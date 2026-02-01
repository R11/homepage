/**
 * N64 Mock Libretro Core for Testing
 *
 * Simulates Nintendo 64 behavior:
 * - MIPS VR4300 CPU simulation
 * - RSP (Reality Signal Processor) status
 * - RDP (Reality Display Processor) simulation
 * - N64-specific memory map (4MB/8MB RDRAM)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

/* Libretro types */
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

/* N64 Constants */
#define SCREEN_WIDTH  320
#define SCREEN_HEIGHT 240
#define RDRAM_SIZE    0x800000   /* 8MB Expansion Pak */
#define SRAM_SIZE     0x8000     /* 32KB SRAM */
#define TMEM_SIZE     0x1000     /* 4KB Texture Memory */

typedef struct {
    uint64_t cpu_cycles;
    uint32_t pc;
    uint32_t rsp_status;
    uint32_t rdp_status;
    uint32_t vi_origin;
    uint32_t vi_width;
} n64_state_t;

static struct {
    retro_video_refresh_t video_cb;
    retro_audio_sample_batch_t audio_batch_cb;
    retro_input_poll_t input_poll_cb;
    retro_input_state_t input_state_cb;
    retro_environment_t environ_cb;

    uint32_t framebuffer[SCREEN_WIDTH * SCREEN_HEIGHT];
    uint8_t rdram[RDRAM_SIZE];
    uint8_t sram[SRAM_SIZE];

    n64_state_t n64;
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

    /* N64 identification */
    const char* id = "NINTENDO 64 MOCK CORE";
    memcpy(&core.rdram[0x100], id, strlen(id));

    /* Initialize RSP/RDP status */
    core.n64.rsp_status = 0x0001;  /* RSP halted */
    core.n64.rdp_status = 0x0000;
    core.n64.vi_width = SCREEN_WIDTH;
}

void retro_deinit(void) {
    if (core.rom_data) free(core.rom_data);
    core.initialized = false;
}

unsigned retro_api_version(void) { return 1; }

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "N64Mock";
    info->library_version = "1.0";
    info->valid_extensions = "z64|n64|v64";
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
    core.n64.cpu_cycles = 0;
    const char* id = "NINTENDO 64 MOCK CORE";
    memcpy(&core.rdram[0x100], id, strlen(id));
}

static void render_frame(void) {
    uint32_t frame = core.frame_count;

    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            uint32_t color;

            /* N64-style dithered gradient background */
            int dither = ((x + y + frame) & 1) * 8;
            uint8_t g = 40 + (y * 80 / SCREEN_HEIGHT) + dither;

            /* Rotating 3D-ish cube wireframe */
            int cx = SCREEN_WIDTH / 2;
            int cy = SCREEN_HEIGHT / 2;
            int size = 60;

            int angle = frame * 3;
            int sin_a = ((angle % 360) * 1000) / 360;
            int cos_a = 1000 - sin_a;

            /* Simple wireframe effect */
            int dx = x - cx;
            int dy = y - cy;
            int rx = (dx * cos_a - dy * sin_a) / 1000;
            int ry = (dx * sin_a + dy * cos_a) / 1000;

            bool on_edge = (abs(abs(rx) - size) < 3 && abs(ry) <= size) ||
                          (abs(abs(ry) - size) < 3 && abs(rx) <= size);

            /* "N64" text area */
            bool in_text = (y >= 30 && y < 70 && x >= 120 && x < 200);

            if (on_edge) {
                color = 0x00FF0000;  /* Red wireframe */
            } else if (in_text) {
                int letter = (x - 120) / 28;
                uint32_t colors[] = { 0x00FF0000, 0x0000FF00, 0x000000FF };
                color = colors[letter % 3];
            } else {
                color = (g << 8);  /* Green gradient */
            }

            core.framebuffer[y * SCREEN_WIDTH + x] = color;
        }
    }

    /* Store state in RDRAM */
    core.rdram[0x200] = frame & 0xFF;
    core.rdram[0x201] = (frame >> 8) & 0xFF;
    core.rdram[0x202] = (frame >> 16) & 0xFF;
    core.rdram[0x203] = (frame >> 24) & 0xFF;

    core.n64.cpu_cycles += 93750000 / 60;  /* ~1.5M cycles/frame */
    uint64_t c = core.n64.cpu_cycles;
    memcpy(&core.rdram[0x210], &c, 8);
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
    return sizeof(uint32_t) + sizeof(n64_state_t) + RDRAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    uint8_t* p = (uint8_t*)data;
    memcpy(p, &core.frame_count, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(p, &core.n64, sizeof(n64_state_t)); p += sizeof(n64_state_t);
    memcpy(p, core.rdram, RDRAM_SIZE);
    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    const uint8_t* p = (const uint8_t*)data;
    memcpy(&core.frame_count, p, sizeof(uint32_t)); p += sizeof(uint32_t);
    memcpy(&core.n64, p, sizeof(n64_state_t)); p += sizeof(n64_state_t);
    memcpy(core.rdram, p, RDRAM_SIZE);
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
        case RETRO_MEMORY_SYSTEM_RAM: return core.rdram;
        case RETRO_MEMORY_SAVE_RAM: return core.sram;
        default: return NULL;
    }
}

size_t retro_get_memory_size(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return RDRAM_SIZE;
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
