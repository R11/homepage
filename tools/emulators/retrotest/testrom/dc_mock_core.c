/**
 * Dreamcast Mock Libretro Core for Testing
 *
 * Simulates Sega Dreamcast behavior:
 * - Hitachi SH-4 CPU simulation
 * - PowerVR2 GPU status
 * - AICA sound processor status
 * - Dreamcast memory map (16MB main RAM)
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

/* Dreamcast Constants */
#define SCREEN_WIDTH  640
#define SCREEN_HEIGHT 480
#define MAIN_RAM_SIZE 0x1000000  /* 16MB */
#define VRAM_SIZE     0x800000   /* 8MB */
#define VMU_SIZE      0x20000    /* 128KB per VMU */

typedef struct {
    uint64_t cpu_cycles;
    uint32_t pc;
    uint32_t pvr_status;
    uint32_t aica_status;
    uint32_t gdrom_status;
    float    fps;
} dc_state_t;

static struct {
    retro_video_refresh_t video_cb;
    retro_audio_sample_batch_t audio_batch_cb;
    retro_input_poll_t input_poll_cb;
    retro_input_state_t input_state_cb;
    retro_environment_t environ_cb;

    uint32_t framebuffer[SCREEN_WIDTH * SCREEN_HEIGHT];
    uint8_t* main_ram;
    uint8_t* vram;
    uint8_t vmu[VMU_SIZE];

    dc_state_t dc;
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

    /* Allocate large memory regions */
    core.main_ram = calloc(1, MAIN_RAM_SIZE);
    core.vram = calloc(1, VRAM_SIZE);

    if (core.main_ram) {
        const char* id = "SEGA DREAMCAST MOCK CORE";
        memcpy(&core.main_ram[0x100], id, strlen(id));
    }

    core.dc.pvr_status = 0x0001;
    core.dc.aica_status = 0x0001;
    core.initialized = true;
}

void retro_deinit(void) {
    if (core.rom_data) free(core.rom_data);
    if (core.main_ram) free(core.main_ram);
    if (core.vram) free(core.vram);
    core.initialized = false;
}

unsigned retro_api_version(void) { return 1; }

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "DCMock";
    info->library_version = "1.0";
    info->valid_extensions = "cdi|gdi|chd|cue";
    info->need_fullpath = false;
    info->block_extract = false;
}

void retro_get_system_av_info(struct retro_system_av_info *info) {
    info->geometry.base_width = SCREEN_WIDTH;
    info->geometry.base_height = SCREEN_HEIGHT;
    info->geometry.max_width = 640;
    info->geometry.max_height = 480;
    info->geometry.aspect_ratio = 4.0f / 3.0f;
    info->timing.fps = 60.0;
    info->timing.sample_rate = 44100.0;
}

void retro_set_controller_port_device(unsigned port, unsigned device) {
    (void)port; (void)device;
}

void retro_reset(void) {
    core.frame_count = 0;
    core.dc.cpu_cycles = 0;
    if (core.main_ram) {
        const char* id = "SEGA DREAMCAST MOCK CORE";
        memcpy(&core.main_ram[0x100], id, strlen(id));
    }
}

static void render_frame(void) {
    uint32_t frame = core.frame_count;

    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            uint32_t color;

            /* Dreamcast swirl logo inspired effect */
            int cx = SCREEN_WIDTH / 2;
            int cy = SCREEN_HEIGHT / 2;
            int dx = x - cx;
            int dy = y - cy;

            int dist = (dx * dx + dy * dy) / 100;
            int angle = (frame * 4 + dist) % 360;

            /* Swirl pattern */
            int swirl = (angle / 30 + frame / 10) % 6;
            uint32_t swirl_colors[] = {
                0x00FF6600,  /* Orange */
                0x00FF0000,  /* Red */
                0x00FF00FF,  /* Magenta */
                0x000000FF,  /* Blue */
                0x0000FFFF,  /* Cyan */
                0x0000FF00,  /* Green */
            };

            if (dist < 15000) {
                color = swirl_colors[swirl];
            } else {
                /* Background gradient */
                uint8_t b = 40 + (y * 60 / SCREEN_HEIGHT);
                color = b;
            }

            /* "DREAMCAST" text area */
            if (y >= 50 && y < 90 && x >= 180 && x < 460) {
                int letter = (x - 180) / 32;
                if (letter < 9) {
                    color = 0x00FFFFFF;  /* White text */
                }
            }

            core.framebuffer[y * SCREEN_WIDTH + x] = color;
        }
    }

    /* Store state in main RAM */
    if (core.main_ram) {
        core.main_ram[0x200] = frame & 0xFF;
        core.main_ram[0x201] = (frame >> 8) & 0xFF;
        core.main_ram[0x202] = (frame >> 16) & 0xFF;
        core.main_ram[0x203] = (frame >> 24) & 0xFF;

        core.dc.cpu_cycles += 200000000 / 60;  /* 200MHz / 60fps */
        memcpy(&core.main_ram[0x210], &core.dc.cpu_cycles, 8);
    }
}

void retro_run(void) {
    if (core.input_poll_cb) core.input_poll_cb();
    render_frame();
    if (core.video_cb) {
        core.video_cb(core.framebuffer, SCREEN_WIDTH, SCREEN_HEIGHT,
                      SCREEN_WIDTH * sizeof(uint32_t));
    }
    if (core.audio_batch_cb) {
        int16_t audio[735 * 2] = {0};
        core.audio_batch_cb(audio, 735);
    }
    core.frame_count++;
}

size_t retro_serialize_size(void) {
    return sizeof(uint32_t) + sizeof(dc_state_t) + MAIN_RAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size() || !core.main_ram) return false;
    uint8_t* p = (uint8_t*)data;
    memcpy(p, &core.frame_count, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(p, &core.dc, sizeof(dc_state_t)); p += sizeof(dc_state_t);
    memcpy(p, core.main_ram, MAIN_RAM_SIZE);
    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size() || !core.main_ram) return false;
    const uint8_t* p = (const uint8_t*)data;
    memcpy(&core.frame_count, p, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(&core.dc, p, sizeof(dc_state_t)); p += sizeof(dc_state_t);
    memcpy(core.main_ram, p, MAIN_RAM_SIZE);
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
        case RETRO_MEMORY_SYSTEM_RAM: return core.main_ram;
        case RETRO_MEMORY_VIDEO_RAM: return core.vram;
        case RETRO_MEMORY_SAVE_RAM: return core.vmu;
        default: return NULL;
    }
}

size_t retro_get_memory_size(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return core.main_ram ? MAIN_RAM_SIZE : 0;
        case RETRO_MEMORY_VIDEO_RAM: return core.vram ? VRAM_SIZE : 0;
        case RETRO_MEMORY_SAVE_RAM: return VMU_SIZE;
        default: return 0;
    }
}

unsigned retro_get_region(void) { return 0; }
void retro_cheat_reset(void) {}
void retro_cheat_set(unsigned i, bool e, const char *c) { (void)i;(void)e;(void)c; }
bool retro_load_game_special(unsigned t, const struct retro_game_info *i, size_t n) {
    (void)t;(void)i;(void)n; return false;
}
