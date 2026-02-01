/**
 * SNES Mock Libretro Core for Testing
 *
 * Simulates Super Nintendo behavior:
 * - 65816 CPU simulation
 * - PPU (Picture Processing Unit) Mode 7 effects
 * - SPC700 audio status
 * - SNES-specific memory map
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

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

#define RETRO_ENVIRONMENT_SET_PIXEL_FORMAT 10
#define RETRO_PIXEL_FORMAT_XRGB8888 1
#define RETRO_MEMORY_SAVE_RAM    0
#define RETRO_MEMORY_SYSTEM_RAM  2
#define RETRO_MEMORY_VIDEO_RAM   3

/* SNES Constants */
#define SCREEN_WIDTH  256
#define SCREEN_HEIGHT 224
#define WRAM_SIZE     0x20000   /* 128KB Work RAM */
#define VRAM_SIZE     0x10000   /* 64KB Video RAM */
#define SRAM_SIZE     0x8000    /* 32KB SRAM max */

typedef struct {
    uint32_t cpu_cycles;
    uint16_t pc;
    uint8_t  db;           /* Data Bank */
    uint8_t  pb;           /* Program Bank */
    uint16_t ppu_scanline;
    uint8_t  ppu_mode;     /* BG mode 0-7 */
    uint8_t  spc_status;
} snes_state_t;

static struct {
    retro_video_refresh_t video_cb;
    retro_audio_sample_batch_t audio_batch_cb;
    retro_input_poll_t input_poll_cb;
    retro_input_state_t input_state_cb;
    retro_environment_t environ_cb;

    uint32_t framebuffer[SCREEN_WIDTH * SCREEN_HEIGHT];
    uint8_t wram[WRAM_SIZE];
    uint8_t vram[VRAM_SIZE];
    uint8_t sram[SRAM_SIZE];

    snes_state_t snes;
    bool initialized;
    bool game_loaded;
    uint32_t frame_count;

    uint8_t* rom_data;
    size_t rom_size;
} core;

void retro_set_environment(retro_environment_t cb) {
    core.environ_cb = cb;
    unsigned format = RETRO_PIXEL_FORMAT_XRGB8888;
    cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &format);
}

void retro_set_video_refresh(retro_video_refresh_t cb) { core.video_cb = cb; }
void retro_set_audio_sample(retro_audio_sample_t cb) { (void)cb; }
void retro_set_audio_sample_batch(retro_audio_sample_batch_t cb) { core.audio_batch_cb = cb; }
void retro_set_input_poll(retro_input_poll_t cb) { core.input_poll_cb = cb; }
void retro_set_input_state(retro_input_state_t cb) { core.input_state_cb = cb; }

void retro_init(void) {
    memset(&core, 0, sizeof(core));
    core.initialized = true;

    const char* id = "SUPER NINTENDO MOCK CORE";
    memcpy(&core.wram[0x100], id, strlen(id));

    core.snes.ppu_mode = 1;  /* Mode 1 is common */
}

void retro_deinit(void) {
    if (core.rom_data) free(core.rom_data);
    core.initialized = false;
}

unsigned retro_api_version(void) { return 1; }

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "SNESMock";
    info->library_version = "1.0";
    info->valid_extensions = "sfc|smc";
    info->need_fullpath = false;
    info->block_extract = false;
}

void retro_get_system_av_info(struct retro_system_av_info *info) {
    info->geometry.base_width = SCREEN_WIDTH;
    info->geometry.base_height = SCREEN_HEIGHT;
    info->geometry.max_width = 512;
    info->geometry.max_height = 478;
    info->geometry.aspect_ratio = 4.0f / 3.0f;
    info->timing.fps = 60.098;
    info->timing.sample_rate = 32000.0;
}

void retro_set_controller_port_device(unsigned port, unsigned device) {
    (void)port; (void)device;
}

void retro_reset(void) {
    core.frame_count = 0;
    core.snes.cpu_cycles = 0;
    const char* id = "SUPER NINTENDO MOCK CORE";
    memcpy(&core.wram[0x100], id, strlen(id));
}

static void render_frame(void) {
    uint32_t frame = core.frame_count;

    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            uint32_t color;

            /* Mode 7 style floor effect */
            int horizon = 80;
            if (y > horizon) {
                /* Floor with perspective */
                int dist = y - horizon;
                int scroll = (frame * 2 + x * 256 / (dist + 1)) % 32;
                bool checker = ((scroll / 16) + ((frame / 4) % 2)) & 1;

                if (checker) {
                    color = 0x00804000;  /* Brown */
                } else {
                    color = 0x00C06000;  /* Light brown */
                }
            } else {
                /* Sky gradient */
                uint8_t b = 200 - y;
                uint8_t g = 100 + y / 2;
                color = (g << 8) | b;
            }

            /* "SNES" text blocks */
            if (y >= 30 && y < 60 && x >= 80 && x < 176) {
                int letter = (x - 80) / 24;
                uint32_t colors[] = {
                    0x00FF0000,  /* S - Red */
                    0x0000FF00,  /* N - Green */
                    0x000000FF,  /* E - Blue */
                    0x00FFFF00,  /* S - Yellow */
                };
                color = colors[letter % 4];
            }

            core.framebuffer[y * SCREEN_WIDTH + x] = color;
        }
    }

    /* Store state in WRAM */
    core.wram[0x200] = frame & 0xFF;
    core.wram[0x201] = (frame >> 8) & 0xFF;
    core.wram[0x202] = (frame >> 16) & 0xFF;
    core.wram[0x203] = (frame >> 24) & 0xFF;

    core.snes.cpu_cycles += 357366;  /* ~357K cycles/frame at 21.477MHz / 60 */
    memcpy(&core.wram[0x210], &core.snes.cpu_cycles, 4);
}

void retro_run(void) {
    if (core.input_poll_cb) core.input_poll_cb();
    render_frame();
    if (core.video_cb) {
        core.video_cb(core.framebuffer, SCREEN_WIDTH, SCREEN_HEIGHT,
                      SCREEN_WIDTH * sizeof(uint32_t));
    }
    if (core.audio_batch_cb) {
        int16_t audio[534 * 2] = {0};  /* 32000/60 ≈ 534 */
        core.audio_batch_cb(audio, 534);
    }
    core.frame_count++;
}

size_t retro_serialize_size(void) {
    return sizeof(uint32_t) + sizeof(snes_state_t) + WRAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    uint8_t* p = (uint8_t*)data;
    memcpy(p, &core.frame_count, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(p, &core.snes, sizeof(snes_state_t)); p += sizeof(snes_state_t);
    memcpy(p, core.wram, WRAM_SIZE);
    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    const uint8_t* p = (const uint8_t*)data;
    memcpy(&core.frame_count, p, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(&core.snes, p, sizeof(snes_state_t)); p += sizeof(snes_state_t);
    memcpy(core.wram, p, WRAM_SIZE);
    return true;
}

bool retro_load_game(const struct retro_game_info *game) {
    if (!game) return false;
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
    if (core.rom_data) { free(core.rom_data); core.rom_data = NULL; }
    core.game_loaded = false;
}

void* retro_get_memory_data(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return core.wram;
        case RETRO_MEMORY_VIDEO_RAM: return core.vram;
        case RETRO_MEMORY_SAVE_RAM: return core.sram;
        default: return NULL;
    }
}

size_t retro_get_memory_size(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return WRAM_SIZE;
        case RETRO_MEMORY_VIDEO_RAM: return VRAM_SIZE;
        case RETRO_MEMORY_SAVE_RAM: return SRAM_SIZE;
        default: return 0;
    }
}

unsigned retro_get_region(void) { return 0; }
void retro_cheat_reset(void) {}
void retro_cheat_set(unsigned i, bool e, const char *c) { (void)i;(void)e;(void)c; }
bool retro_load_game_special(unsigned t, const struct retro_game_info *i, size_t n) {
    (void)t;(void)i;(void)n; return false;
}
