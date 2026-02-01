/**
 * Graphics Test Mock Core
 *
 * A libretro core that interprets graphics commands from ROM data
 * and renders using the cross-platform software renderer.
 *
 * ROM format:
 *   - Header (16 bytes): "GFXTEST\0" + version + flags + command_count
 *   - Commands: Array of 16-byte gfx_cmd_t structures
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

/* Include graphics implementation */
#define GFX_IMPLEMENTATION
#include "../include/gfx_tests.h"

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

#define RETRO_ENVIRONMENT_SET_PIXEL_FORMAT 10
#define RETRO_PIXEL_FORMAT_RGB565 2
#define RETRO_MEMORY_SYSTEM_RAM  2

/* ==========================================================================
   ROM Header Format
   ========================================================================== */

#define GFX_ROM_MAGIC "GFXTEST"

typedef struct {
    char magic[8];          /* "GFXTEST\0" */
    uint8_t version;        /* ROM format version */
    uint8_t test_id;        /* Test suite ID */
    uint16_t cmd_count;     /* Number of commands */
    uint16_t width;         /* Target width (0 = use default) */
    uint16_t height;        /* Target height (0 = use default) */
} gfx_rom_header_t;

/* ==========================================================================
   Core State
   ========================================================================== */

#define DEFAULT_WIDTH  320
#define DEFAULT_HEIGHT 240
#define MAX_WIDTH      640
#define MAX_HEIGHT     480
#define RAM_SIZE       0x20000  /* 128KB */

static struct {
    /* Callbacks */
    retro_video_refresh_t video_cb;
    retro_audio_sample_batch_t audio_batch_cb;
    retro_input_poll_t input_poll_cb;
    retro_input_state_t input_state_cb;
    retro_environment_t environ_cb;

    /* Frame buffer (RGB565) */
    uint16_t framebuffer[MAX_WIDTH * MAX_HEIGHT];

    /* Memory */
    uint8_t ram[RAM_SIZE];

    /* Graphics context */
    gfx_context_t gfx;

    /* Screen dimensions */
    int width;
    int height;

    /* State */
    bool initialized;
    bool game_loaded;
    uint32_t frame_count;
    bool commands_executed;

    /* ROM data */
    uint8_t* rom_data;
    size_t rom_size;
    gfx_cmd_t* commands;
    int num_commands;
    int current_command;
} core;

/* ==========================================================================
   Libretro API Implementation
   ========================================================================== */

void retro_set_environment(retro_environment_t cb) {
    core.environ_cb = cb;
    unsigned format = RETRO_PIXEL_FORMAT_RGB565;
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
    core.width = DEFAULT_WIDTH;
    core.height = DEFAULT_HEIGHT;

    /* Initialize RAM with identification */
    const char* id = "GFX MOCK CORE RAM";
    memcpy(&core.ram[0x100], id, strlen(id));
}

void retro_deinit(void) {
    if (core.rom_data) {
        free(core.rom_data);
        core.rom_data = NULL;
    }
    core.initialized = false;
}

unsigned retro_api_version(void) { return 1; }

void retro_get_system_info(struct retro_system_info *info) {
    info->library_name = "GfxMock";
    info->library_version = "1.0";
    info->valid_extensions = "gfx|bin|rom";
    info->need_fullpath = false;
    info->block_extract = false;
}

void retro_get_system_av_info(struct retro_system_av_info *info) {
    info->geometry.base_width = core.width;
    info->geometry.base_height = core.height;
    info->geometry.max_width = MAX_WIDTH;
    info->geometry.max_height = MAX_HEIGHT;
    info->geometry.aspect_ratio = (float)core.width / (float)core.height;
    info->timing.fps = 60.0;
    info->timing.sample_rate = 44100.0;
}

void retro_set_controller_port_device(unsigned port, unsigned device) {
    (void)port; (void)device;
}

void retro_reset(void) {
    core.frame_count = 0;
    core.current_command = 0;
    core.commands_executed = false;
    memset(core.framebuffer, 0, sizeof(core.framebuffer));
}

static void parse_rom(void) {
    if (!core.rom_data || core.rom_size < sizeof(gfx_rom_header_t)) {
        return;
    }

    gfx_rom_header_t* hdr = (gfx_rom_header_t*)core.rom_data;

    /* Check magic */
    if (memcmp(hdr->magic, GFX_ROM_MAGIC, 7) != 0) {
        /* Not a graphics test ROM, use defaults */
        return;
    }

    /* Get dimensions */
    if (hdr->width > 0 && hdr->width <= MAX_WIDTH) {
        core.width = hdr->width;
    }
    if (hdr->height > 0 && hdr->height <= MAX_HEIGHT) {
        core.height = hdr->height;
    }

    /* Get commands */
    core.num_commands = hdr->cmd_count;
    core.commands = (gfx_cmd_t*)(core.rom_data + sizeof(gfx_rom_header_t));

    /* Store test info in RAM */
    core.ram[0x200] = hdr->test_id;
    core.ram[0x201] = hdr->version;
    core.ram[0x202] = (hdr->cmd_count >> 0) & 0xFF;
    core.ram[0x203] = (hdr->cmd_count >> 8) & 0xFF;
}

static void execute_commands(void) {
    if (!core.commands || core.commands_executed) {
        return;
    }

    /* Setup graphics context */
    core.gfx.framebuffer = core.framebuffer;
    core.gfx.width = core.width;
    core.gfx.height = core.height;
    core.gfx.pitch = core.width;

    /* Execute all commands */
    gfx_execute_commands(&core.gfx, core.commands, core.num_commands);

    core.commands_executed = true;
}

void retro_run(void) {
    if (core.input_poll_cb) {
        core.input_poll_cb();
    }

    /* Execute graphics commands on first frame */
    if (core.frame_count == 0) {
        execute_commands();
    }

    /* Store frame count in RAM */
    core.ram[0x210] = (core.frame_count >> 0) & 0xFF;
    core.ram[0x211] = (core.frame_count >> 8) & 0xFF;
    core.ram[0x212] = (core.frame_count >> 16) & 0xFF;
    core.ram[0x213] = (core.frame_count >> 24) & 0xFF;

    /* Send frame to frontend */
    if (core.video_cb) {
        core.video_cb(core.framebuffer, core.width, core.height,
                      core.width * sizeof(uint16_t));
    }

    core.frame_count++;
}

size_t retro_serialize_size(void) {
    return sizeof(uint32_t) + sizeof(core.framebuffer) + RAM_SIZE;
}

bool retro_serialize(void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    uint8_t* p = (uint8_t*)data;
    memcpy(p, &core.frame_count, sizeof(uint32_t));
    p += sizeof(uint32_t);
    memcpy(p, core.framebuffer, sizeof(core.framebuffer));
    p += sizeof(core.framebuffer);
    memcpy(p, core.ram, RAM_SIZE);
    return true;
}

bool retro_unserialize(const void *data, size_t size) {
    if (size < retro_serialize_size()) return false;
    const uint8_t* p = (const uint8_t*)data;
    memcpy(&core.frame_count, p, sizeof(uint32_t));
    p += sizeof(uint32_t);
    memcpy(core.framebuffer, p, sizeof(core.framebuffer));
    p += sizeof(core.framebuffer);
    memcpy(core.ram, p, RAM_SIZE);
    core.commands_executed = true;  /* Don't re-execute after load */
    return true;
}

bool retro_load_game(const struct retro_game_info *game) {
    if (!game) return false;

    if (game->data && game->size > 0) {
        core.rom_data = malloc(game->size);
        if (core.rom_data) {
            memcpy(core.rom_data, game->data, game->size);
            core.rom_size = game->size;
            parse_rom();
        }
    }

    core.game_loaded = true;
    core.frame_count = 0;
    core.commands_executed = false;

    return true;
}

void retro_unload_game(void) {
    if (core.rom_data) {
        free(core.rom_data);
        core.rom_data = NULL;
    }
    core.game_loaded = false;
    core.commands = NULL;
    core.num_commands = 0;
}

void* retro_get_memory_data(unsigned id) {
    if (id == RETRO_MEMORY_SYSTEM_RAM) return core.ram;
    return NULL;
}

size_t retro_get_memory_size(unsigned id) {
    if (id == RETRO_MEMORY_SYSTEM_RAM) return RAM_SIZE;
    return 0;
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
