/**
 * Saturn Mock Libretro Core for Testing
 *
 * A minimal libretro core that simulates Sega Saturn behavior:
 * - Dual SH-2 CPU simulation (master/slave frame counters)
 * - VDP1 (sprite) and VDP2 (background) simulation
 * - Saturn-specific memory map
 * - CD-ROM simulation
 *
 * This allows testing the RetroTest framework for Saturn without
 * needing actual emulator cores or real disc images.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

/* ==========================================================================
   Libretro API Types (same as mock_core.c)
   ========================================================================== */

typedef void (*retro_video_refresh_t)(const void *data, unsigned width,
                                       unsigned height, size_t pitch);
typedef void (*retro_audio_sample_t)(int16_t left, int16_t right);
typedef size_t (*retro_audio_sample_batch_t)(const int16_t *data, size_t frames);
typedef void (*retro_input_poll_t)(void);
typedef int16_t (*retro_input_state_t)(unsigned port, unsigned device,
                                        unsigned index, unsigned id);
typedef bool (*retro_environment_t)(unsigned cmd, void *data);

struct retro_system_info {
    const char *library_name;
    const char *library_version;
    const char *valid_extensions;
    bool need_fullpath;
    bool block_extract;
};

struct retro_game_geometry {
    unsigned base_width;
    unsigned base_height;
    unsigned max_width;
    unsigned max_height;
    float aspect_ratio;
};

struct retro_system_timing {
    double fps;
    double sample_rate;
};

struct retro_system_av_info {
    struct retro_game_geometry geometry;
    struct retro_system_timing timing;
};

struct retro_game_info {
    const char *path;
    const void *data;
    size_t size;
    const char *meta;
};

/* Environment commands */
#define RETRO_ENVIRONMENT_SET_PIXEL_FORMAT 10
#define RETRO_ENVIRONMENT_GET_SYSTEM_DIRECTORY 9
#define RETRO_ENVIRONMENT_GET_SAVE_DIRECTORY 31

/* Pixel formats */
#define RETRO_PIXEL_FORMAT_XRGB8888 1

/* Memory types */
#define RETRO_MEMORY_SAVE_RAM    0
#define RETRO_MEMORY_RTC         1
#define RETRO_MEMORY_SYSTEM_RAM  2
#define RETRO_MEMORY_VIDEO_RAM   3

/* ==========================================================================
   Saturn-Specific Constants
   ========================================================================== */

/* Saturn resolution (320x224 typical, can be 352x224 or 320x240) */
#define SCREEN_WIDTH  320
#define SCREEN_HEIGHT 224

/* Saturn memory sizes */
#define WORK_RAM_HIGH_SIZE  0x100000  /* 1MB High Work RAM */
#define WORK_RAM_LOW_SIZE   0x100000  /* 1MB Low Work RAM */
#define VDP1_VRAM_SIZE      0x80000   /* 512KB VDP1 VRAM */
#define VDP2_VRAM_SIZE      0x80000   /* 512KB VDP2 VRAM */
#define BACKUP_RAM_SIZE     0x8000    /* 32KB Backup RAM */
#define SCSP_RAM_SIZE       0x80000   /* 512KB Sound RAM */

/* Simulated memory (combined for simplicity) */
#define SYSTEM_RAM_SIZE     (WORK_RAM_HIGH_SIZE + WORK_RAM_LOW_SIZE)
#define VRAM_SIZE           (VDP1_VRAM_SIZE + VDP2_VRAM_SIZE)

/* ==========================================================================
   Saturn State
   ========================================================================== */

typedef struct {
    /* Dual SH-2 simulation */
    uint32_t master_cycles;
    uint32_t slave_cycles;
    uint32_t master_pc;
    uint32_t slave_pc;

    /* VDP state */
    uint16_t vdp1_fbcr;      /* Frame buffer control */
    uint16_t vdp2_tvmd;      /* TV mode */
    uint16_t vdp2_bgon;      /* BG enable */
    uint8_t  vdp2_priority[8]; /* Layer priorities */

    /* System state */
    uint8_t  smpc_status;    /* SMPC status */
    uint8_t  cd_status;      /* CD block status */
} saturn_state_t;

static struct {
    /* Callbacks */
    retro_video_refresh_t video_cb;
    retro_audio_sample_t audio_cb;
    retro_audio_sample_batch_t audio_batch_cb;
    retro_input_poll_t input_poll_cb;
    retro_input_state_t input_state_cb;
    retro_environment_t environ_cb;

    /* Frame buffer (XRGB8888) */
    uint32_t framebuffer[SCREEN_WIDTH * SCREEN_HEIGHT];

    /* Memory regions */
    uint8_t system_ram[SYSTEM_RAM_SIZE];   /* Work RAM High + Low */
    uint8_t vram[VRAM_SIZE];               /* VDP1 + VDP2 VRAM */
    uint8_t backup_ram[BACKUP_RAM_SIZE];   /* Save RAM */
    uint8_t sound_ram[SCSP_RAM_SIZE];      /* SCSP RAM */

    /* Saturn-specific state */
    saturn_state_t saturn;

    /* General state */
    bool initialized;
    bool game_loaded;
    uint32_t frame_count;

    /* ROM/ISO info */
    char rom_path[256];
    uint8_t* rom_data;
    size_t rom_size;
} core;

/* ==========================================================================
   Libretro API Implementation
   ========================================================================== */

void retro_set_environment(retro_environment_t cb) {
    core.environ_cb = cb;

    unsigned format = RETRO_PIXEL_FORMAT_XRGB8888;
    cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &format);
}

void retro_set_video_refresh(retro_video_refresh_t cb) {
    core.video_cb = cb;
}

void retro_set_audio_sample(retro_audio_sample_t cb) {
    core.audio_cb = cb;
}

void retro_set_audio_sample_batch(retro_audio_sample_batch_t cb) {
    core.audio_batch_cb = cb;
}

void retro_set_input_poll(retro_input_poll_t cb) {
    core.input_poll_cb = cb;
}

void retro_set_input_state(retro_input_state_t cb) {
    core.input_state_cb = cb;
}

void retro_init(void) {
    memset(&core, 0, sizeof(core));
    core.initialized = true;

    /* Initialize Work RAM with Saturn-style pattern */
    for (size_t i = 0; i < SYSTEM_RAM_SIZE; i++) {
        core.system_ram[i] = (uint8_t)((i >> 8) ^ (i & 0xFF));
    }

    /* Write Saturn identification string */
    const char* saturn_id = "SEGA SATURN MOCK CORE";
    memcpy(&core.system_ram[0x100], saturn_id, strlen(saturn_id));

    /* Initialize VDP2 registers in memory */
    /* TVMD at 0x25F80000 -> we'll put at offset 0x1000 in our sim */
    core.saturn.vdp2_tvmd = 0x8000;  /* Display on, NTSC */
    core.saturn.vdp2_bgon = 0x0003;  /* NBG0 and NBG1 enabled */

    /* Initialize backup RAM header */
    const char* backup_header = "BackUpRam Format";
    memcpy(core.backup_ram, backup_header, strlen(backup_header));
}

void retro_deinit(void) {
    if (core.rom_data) {
        free(core.rom_data);
        core.rom_data = NULL;
    }
    core.initialized = false;
}

unsigned retro_api_version(void) {
    return 1;
}

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "SaturnMock";
    info->library_version = "1.0";
    info->valid_extensions = "cue|iso|bin|ccd";
    info->need_fullpath = false;
    info->block_extract = false;
}

void retro_get_system_av_info(struct retro_system_av_info *info) {
    info->geometry.base_width = SCREEN_WIDTH;
    info->geometry.base_height = SCREEN_HEIGHT;
    info->geometry.max_width = 704;   /* Saturn max H resolution */
    info->geometry.max_height = 480;  /* Saturn max V resolution (interlaced) */
    info->geometry.aspect_ratio = 4.0f / 3.0f;
    info->timing.fps = 59.94;  /* NTSC Saturn */
    info->timing.sample_rate = 44100.0;
}

void retro_set_controller_port_device(unsigned port, unsigned device) {
    (void)port;
    (void)device;
}

void retro_reset(void) {
    core.frame_count = 0;
    core.saturn.master_cycles = 0;
    core.saturn.slave_cycles = 0;

    /* Re-initialize RAM */
    for (size_t i = 0; i < SYSTEM_RAM_SIZE; i++) {
        core.system_ram[i] = (uint8_t)((i >> 8) ^ (i & 0xFF));
    }

    const char* saturn_id = "SEGA SATURN MOCK CORE";
    memcpy(&core.system_ram[0x100], saturn_id, strlen(saturn_id));
}

/* Render a Saturn-style test pattern */
static void render_frame(void) {
    uint32_t frame = core.frame_count;

    /* Saturn has multiple layers - simulate VDP2 backgrounds */
    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            uint32_t color;

            /* NBG0: Scrolling starfield background (blue/black) */
            int star_x = (x + frame) % 64;
            int star_y = (y + frame / 2) % 64;
            bool is_star = ((star_x * star_y) % 37 == 0);

            /* NBG1: Grid pattern overlay */
            bool on_grid = (x % 32 == 0) || (y % 32 == 0);

            /* VDP1: Sprite layer - rotating quad */
            int cx = SCREEN_WIDTH / 2;
            int cy = SCREEN_HEIGHT / 2;
            int dx = x - cx;
            int dy = y - cy;

            /* Rotate point (simple approximation) */
            int angle = frame * 2;
            int sin_a = (angle % 360 < 180) ? (angle % 180) : (180 - (angle % 180));
            int cos_a = 90 - sin_a;
            sin_a = sin_a * 2 - 180;  /* Scale to -180..180 */
            cos_a = cos_a * 2;

            int rx = (dx * cos_a - dy * sin_a) / 180;
            int ry = (dx * sin_a + dy * cos_a) / 180;

            bool in_quad = (rx >= -40 && rx < 40 && ry >= -40 && ry < 40);

            /* Compose layers with Saturn-style priority */
            if (in_quad) {
                /* VDP1 sprite - Saturn red */
                color = 0x00E02020;
            } else if (on_grid) {
                /* NBG1 grid - Saturn blue/cyan */
                color = 0x002080A0;
            } else if (is_star) {
                /* NBG0 star - white */
                color = 0x00FFFFFF;
            } else {
                /* Background - dark blue gradient */
                uint8_t b = 20 + (y * 40 / SCREEN_HEIGHT);
                color = (b << 0) | (b/4 << 8);
            }

            core.framebuffer[y * SCREEN_WIDTH + x] = color;
        }
    }

    /* Draw "SATURN" text area (colored blocks like Genesis test) */
    for (int y = 20; y < 52; y++) {
        for (int x = 80; x < 240; x++) {
            int letter_idx = (x - 80) / 28;
            int in_letter = (x - 80) % 28;

            if (letter_idx < 6 && in_letter < 24) {
                /* S-A-T-U-R-N in different colors */
                uint32_t colors[] = {
                    0x00FF6600,  /* S - Orange */
                    0x00FFFF00,  /* A - Yellow */
                    0x0000FF00,  /* T - Green */
                    0x0000FFFF,  /* U - Cyan */
                    0x000066FF,  /* R - Blue */
                    0x00FF00FF,  /* N - Magenta */
                };
                core.framebuffer[y * SCREEN_WIDTH + x] = colors[letter_idx];
            }
        }
    }

    /* Store frame count and SH-2 state in Work RAM */
    /* Frame count at 0x200 (like Genesis mock) */
    core.system_ram[0x200] = (frame >> 0) & 0xFF;
    core.system_ram[0x201] = (frame >> 8) & 0xFF;
    core.system_ram[0x202] = (frame >> 16) & 0xFF;
    core.system_ram[0x203] = (frame >> 24) & 0xFF;

    /* Master SH-2 cycles at 0x210 */
    core.saturn.master_cycles += 28636360 / 60;  /* ~477K cycles per frame */
    uint32_t mc = core.saturn.master_cycles;
    core.system_ram[0x210] = (mc >> 0) & 0xFF;
    core.system_ram[0x211] = (mc >> 8) & 0xFF;
    core.system_ram[0x212] = (mc >> 16) & 0xFF;
    core.system_ram[0x213] = (mc >> 24) & 0xFF;

    /* Slave SH-2 cycles at 0x220 (runs slightly behind master) */
    core.saturn.slave_cycles += 28636360 / 60 - 1000;
    uint32_t sc = core.saturn.slave_cycles;
    core.system_ram[0x220] = (sc >> 0) & 0xFF;
    core.system_ram[0x221] = (sc >> 8) & 0xFF;
    core.system_ram[0x222] = (sc >> 16) & 0xFF;
    core.system_ram[0x223] = (sc >> 24) & 0xFF;

    /* VDP1/VDP2 status at 0x230 */
    core.system_ram[0x230] = core.saturn.vdp2_tvmd & 0xFF;
    core.system_ram[0x231] = (core.saturn.vdp2_tvmd >> 8) & 0xFF;
    core.system_ram[0x232] = core.saturn.vdp2_bgon & 0xFF;
    core.system_ram[0x233] = (core.saturn.vdp2_bgon >> 8) & 0xFF;
}

void retro_run(void) {
    if (core.input_poll_cb) {
        core.input_poll_cb();
    }

    render_frame();

    if (core.video_cb) {
        core.video_cb(core.framebuffer, SCREEN_WIDTH, SCREEN_HEIGHT,
                      SCREEN_WIDTH * sizeof(uint32_t));
    }

    /* Generate SCSP-style audio (FM synthesis approximation) */
    if (core.audio_batch_cb) {
        int16_t audio[735 * 2];  /* 44100 / 60 ≈ 735 samples */
        for (int i = 0; i < 735; i++) {
            /* Simple FM-ish tone */
            int phase = (core.frame_count * 735 + i) * 440;
            int mod = ((phase / 44100) % 4) * 1000;
            int16_t sample = ((phase / 44100 + mod / 1000) % 2) ? 3000 : -3000;
            audio[i * 2] = sample;
            audio[i * 2 + 1] = sample;
        }
        core.audio_batch_cb(audio, 735);
    }

    core.frame_count++;
}

size_t retro_serialize_size(void) {
    return sizeof(uint32_t) + sizeof(saturn_state_t) + SYSTEM_RAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size()) return false;

    uint8_t* p = (uint8_t*)data;

    memcpy(p, &core.frame_count, sizeof(uint32_t));
    p += sizeof(uint32_t);

    memcpy(p, &core.saturn, sizeof(saturn_state_t));
    p += sizeof(saturn_state_t);

    memcpy(p, core.system_ram, SYSTEM_RAM_SIZE);

    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size()) return false;

    const uint8_t* p = (const uint8_t*)data;

    memcpy(&core.frame_count, p, sizeof(uint32_t));
    p += sizeof(uint32_t);

    memcpy(&core.saturn, p, sizeof(saturn_state_t));
    p += sizeof(saturn_state_t);

    memcpy(core.system_ram, p, SYSTEM_RAM_SIZE);

    return true;
}

bool retro_load_game(const struct retro_game_info *game) {
    if (!game) return false;

    if (game->path) {
        strncpy(core.rom_path, game->path, sizeof(core.rom_path) - 1);
    }

    if (game->data && game->size > 0) {
        core.rom_data = malloc(game->size);
        if (core.rom_data) {
            memcpy(core.rom_data, game->data, game->size);
            core.rom_size = game->size;
        }
    }

    core.game_loaded = true;
    core.frame_count = 0;

    return true;
}

void retro_unload_game(void) {
    if (core.rom_data) {
        free(core.rom_data);
        core.rom_data = NULL;
    }
    core.game_loaded = false;
}

void* retro_get_memory_data(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return core.system_ram;
        case RETRO_MEMORY_VIDEO_RAM:  return core.vram;
        case RETRO_MEMORY_SAVE_RAM:   return core.backup_ram;
        default: return NULL;
    }
}

size_t retro_get_memory_size(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return SYSTEM_RAM_SIZE;
        case RETRO_MEMORY_VIDEO_RAM:  return VRAM_SIZE;
        case RETRO_MEMORY_SAVE_RAM:   return BACKUP_RAM_SIZE;
        default: return 0;
    }
}

unsigned retro_get_region(void) { return 0; }
void retro_cheat_reset(void) {}
void retro_cheat_set(unsigned idx, bool enabled, const char *code) {
    (void)idx; (void)enabled; (void)code;
}
bool retro_load_game_special(unsigned type, const struct retro_game_info *info, size_t num) {
    (void)type; (void)info; (void)num;
    return false;
}
