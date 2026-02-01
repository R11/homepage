/**
 * Mock Libretro Core for Testing
 *
 * A minimal libretro core that:
 * - Loads any "ROM" file
 * - Renders a deterministic test pattern
 * - Exposes fake system RAM for memory testing
 *
 * This allows testing the RetroTest framework without needing
 * actual emulator cores or real ROMs.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

/* ==========================================================================
   Libretro API Types
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
   Core State
   ========================================================================== */

#define SCREEN_WIDTH  320
#define SCREEN_HEIGHT 224
#define RAM_SIZE      0x10000  /* 64KB fake RAM */
#define VRAM_SIZE     0x10000  /* 64KB fake VRAM */
#define SRAM_SIZE     0x2000   /* 8KB save RAM */

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

    /* Memory */
    uint8_t ram[RAM_SIZE];
    uint8_t vram[VRAM_SIZE];
    uint8_t sram[SRAM_SIZE];

    /* State */
    bool initialized;
    bool game_loaded;
    uint32_t frame_count;

    /* ROM info */
    char rom_path[256];
    uint8_t* rom_data;
    size_t rom_size;
} core;

/* ==========================================================================
   Libretro API Implementation
   ========================================================================== */

void retro_set_environment(retro_environment_t cb) {
    core.environ_cb = cb;

    /* Request XRGB8888 pixel format */
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

    /* Initialize RAM with a pattern */
    for (size_t i = 0; i < RAM_SIZE; i++) {
        core.ram[i] = (uint8_t)(i & 0xFF);
    }

    /* Write "HELLO" into RAM at offset 0x100 */
    const char* hello = "HELLO WORLD FROM MOCK CORE!";
    memcpy(&core.ram[0x100], hello, strlen(hello));
}

void retro_deinit(void) {
    if (core.rom_data) {
        free(core.rom_data);
        core.rom_data = NULL;
    }
    core.initialized = false;
}

unsigned retro_api_version(void) {
    return 1;  /* RETRO_API_VERSION */
}

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "MockCore";
    info->library_version = "1.0";
    info->valid_extensions = "md|bin|rom";
    info->need_fullpath = false;
    info->block_extract = false;
}

void retro_get_system_av_info(struct retro_system_av_info *info) {
    info->geometry.base_width = SCREEN_WIDTH;
    info->geometry.base_height = SCREEN_HEIGHT;
    info->geometry.max_width = SCREEN_WIDTH;
    info->geometry.max_height = SCREEN_HEIGHT;
    info->geometry.aspect_ratio = 4.0f / 3.0f;
    info->timing.fps = 60.0;
    info->timing.sample_rate = 44100.0;
}

void retro_set_controller_port_device(unsigned port, unsigned device) {
    (void)port;
    (void)device;
}

void retro_reset(void) {
    core.frame_count = 0;

    /* Re-initialize RAM pattern */
    for (size_t i = 0; i < RAM_SIZE; i++) {
        core.ram[i] = (uint8_t)(i & 0xFF);
    }

    const char* hello = "HELLO WORLD FROM MOCK CORE!";
    memcpy(&core.ram[0x100], hello, strlen(hello));
}

static void render_frame(void) {
    uint32_t frame = core.frame_count;

    /* Create a deterministic test pattern */
    for (int y = 0; y < SCREEN_HEIGHT; y++) {
        for (int x = 0; x < SCREEN_WIDTH; x++) {
            uint32_t color;

            /* Background: blue gradient */
            uint8_t b = (uint8_t)(128 + (y * 127 / SCREEN_HEIGHT));

            /* Add a moving vertical bar (based on frame count) */
            int bar_x = (frame * 2) % SCREEN_WIDTH;
            if (x >= bar_x && x < bar_x + 20) {
                /* White bar */
                color = 0x00FFFFFF;
            }
            /* Add "HELLO" text area (simplified: colored rectangle) */
            else if (y >= 80 && y < 144 && x >= 60 && x < 260) {
                /* Letter positions */
                int letter_width = 32;
                int gap = 8;
                int start_x = 60;

                int rel_x = x - start_x;
                int letter_idx = rel_x / (letter_width + gap);
                int in_letter = rel_x % (letter_width + gap);

                if (letter_idx < 5 && in_letter < letter_width) {
                    /* Inside a letter block */
                    /* Different color for each letter */
                    switch (letter_idx) {
                        case 0: color = 0x00FF0000; break;  /* H - Red */
                        case 1: color = 0x0000FF00; break;  /* E - Green */
                        case 2: color = 0x00FFFF00; break;  /* L - Yellow */
                        case 3: color = 0x00FF00FF; break;  /* L - Magenta */
                        case 4: color = 0x0000FFFF; break;  /* O - Cyan */
                        default: color = 0x00FFFFFF; break;
                    }
                } else {
                    color = (b << 0);  /* Blue background */
                }
            }
            else {
                /* Blue gradient background */
                color = (b << 0);
            }

            core.framebuffer[y * SCREEN_WIDTH + x] = color;
        }
    }

    /* Store frame count in RAM for verification */
    core.ram[0x200] = (frame >> 0) & 0xFF;
    core.ram[0x201] = (frame >> 8) & 0xFF;
    core.ram[0x202] = (frame >> 16) & 0xFF;
    core.ram[0x203] = (frame >> 24) & 0xFF;
}

void retro_run(void) {
    /* Poll input */
    if (core.input_poll_cb) {
        core.input_poll_cb();
    }

    /* Render frame */
    render_frame();

    /* Send frame to frontend */
    if (core.video_cb) {
        core.video_cb(core.framebuffer, SCREEN_WIDTH, SCREEN_HEIGHT,
                      SCREEN_WIDTH * sizeof(uint32_t));
    }

    /* Generate audio (simple tone) */
    if (core.audio_batch_cb) {
        int16_t audio[882 * 2];  /* ~735 samples at 44100Hz / 60fps */
        for (int i = 0; i < 882; i++) {
            /* Simple square wave at 440Hz */
            int16_t sample = ((i * 440 / 44100) % 2) ? 4000 : -4000;
            audio[i * 2] = sample;      /* Left */
            audio[i * 2 + 1] = sample;  /* Right */
        }
        core.audio_batch_cb(audio, 882);
    }

    core.frame_count++;
}

size_t retro_serialize_size(void) {
    /* State: frame_count + RAM */
    return sizeof(uint32_t) + RAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size()) return false;

    uint8_t* p = (uint8_t*)data;

    /* Save frame count */
    memcpy(p, &core.frame_count, sizeof(uint32_t));
    p += sizeof(uint32_t);

    /* Save RAM */
    memcpy(p, core.ram, RAM_SIZE);

    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size()) return false;

    const uint8_t* p = (const uint8_t*)data;

    /* Load frame count */
    memcpy(&core.frame_count, p, sizeof(uint32_t));
    p += sizeof(uint32_t);

    /* Load RAM */
    memcpy(core.ram, p, RAM_SIZE);

    return true;
}

bool retro_load_game(const struct retro_game_info *game) {
    if (!game) return false;

    /* Store ROM path */
    if (game->path) {
        strncpy(core.rom_path, game->path, sizeof(core.rom_path) - 1);
    }

    /* Copy ROM data if provided */
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
        case RETRO_MEMORY_SYSTEM_RAM: return core.ram;
        case RETRO_MEMORY_VIDEO_RAM:  return core.vram;
        case RETRO_MEMORY_SAVE_RAM:   return core.sram;
        default: return NULL;
    }
}

size_t retro_get_memory_size(unsigned id) {
    switch (id) {
        case RETRO_MEMORY_SYSTEM_RAM: return RAM_SIZE;
        case RETRO_MEMORY_VIDEO_RAM:  return VRAM_SIZE;
        case RETRO_MEMORY_SAVE_RAM:   return SRAM_SIZE;
        default: return 0;
    }
}

/* Unused but required by libretro API */
unsigned retro_get_region(void) { return 0; }
void retro_cheat_reset(void) {}
void retro_cheat_set(unsigned idx, bool enabled, const char *code) {
    (void)idx; (void)enabled; (void)code;
}
bool retro_load_game_special(unsigned type, const struct retro_game_info *info, size_t num) {
    (void)type; (void)info; (void)num;
    return false;
}
