/**
 * RetroTest - Libretro Testing Frontend Implementation
 *
 * Minimal headless frontend for automated testing of libretro cores.
 */

#include "../include/retrotest.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <dlfcn.h>

/* ==========================================================================
   Libretro API Structures (from libretro.h)
   ========================================================================== */

struct retro_system_info {
    const char* library_name;
    const char* library_version;
    const char* valid_extensions;
    bool        need_fullpath;
    bool        block_extract;
};

struct retro_game_geometry {
    unsigned base_width;
    unsigned base_height;
    unsigned max_width;
    unsigned max_height;
    float    aspect_ratio;
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
    const char* path;
    const void* data;
    size_t      size;
    const char* meta;
};

/* Environment callback commands */
#define RETRO_ENVIRONMENT_SET_ROTATION           1
#define RETRO_ENVIRONMENT_GET_OVERSCAN           2
#define RETRO_ENVIRONMENT_GET_CAN_DUPE           3
#define RETRO_ENVIRONMENT_SET_MESSAGE            6
#define RETRO_ENVIRONMENT_SHUTDOWN               7
#define RETRO_ENVIRONMENT_SET_PERFORMANCE_LEVEL  8
#define RETRO_ENVIRONMENT_GET_SYSTEM_DIRECTORY   9
#define RETRO_ENVIRONMENT_SET_PIXEL_FORMAT       10
#define RETRO_ENVIRONMENT_SET_INPUT_DESCRIPTORS  11
#define RETRO_ENVIRONMENT_SET_KEYBOARD_CALLBACK  12
#define RETRO_ENVIRONMENT_GET_VARIABLE           15
#define RETRO_ENVIRONMENT_SET_VARIABLES          16
#define RETRO_ENVIRONMENT_GET_VARIABLE_UPDATE    17
#define RETRO_ENVIRONMENT_SET_SUPPORT_NO_GAME    18
#define RETRO_ENVIRONMENT_GET_LIBRETRO_PATH      19
#define RETRO_ENVIRONMENT_SET_MEMORY_MAPS        36
#define RETRO_ENVIRONMENT_GET_LOG_INTERFACE      27
#define RETRO_ENVIRONMENT_GET_SAVE_DIRECTORY     31
#define RETRO_ENVIRONMENT_SET_GEOMETRY           37
#define RETRO_ENVIRONMENT_GET_CORE_OPTIONS_VERSION 52

/* Pixel formats */
#define RETRO_PIXEL_FORMAT_0RGB1555  0
#define RETRO_PIXEL_FORMAT_XRGB8888  1
#define RETRO_PIXEL_FORMAT_RGB565    2

/* ==========================================================================
   Test Context Structure
   ========================================================================== */

#define MAX_PORTS 4
#define AUDIO_BUFFER_SIZE (48000 * 2)  /* 1 second stereo */
#define FRAME_BUFFER_SIZE (1920 * 1080 * 4)  /* Max 1080p XRGB */

struct retrotest_ctx {
    /* Core library handle */
    void* core_handle;

    /* Core API functions */
    retro_init_t                  core_init;
    retro_deinit_t                core_deinit;
    retro_api_version_t           core_api_version;
    retro_get_system_info_t       core_get_system_info;
    retro_get_system_av_info_t    core_get_system_av_info;
    retro_set_environment_t       core_set_environment;
    retro_set_video_refresh_t     core_set_video_refresh;
    retro_set_audio_sample_t      core_set_audio_sample;
    retro_set_audio_sample_batch_t core_set_audio_sample_batch;
    retro_set_input_poll_t        core_set_input_poll;
    retro_set_input_state_t       core_set_input_state;
    retro_set_controller_port_device_t core_set_controller_port_device;
    retro_reset_t                 core_reset;
    retro_run_t                   core_run;
    retro_serialize_size_t        core_serialize_size;
    retro_serialize_t             core_serialize;
    retro_unserialize_t           core_unserialize;
    retro_load_game_t             core_load_game;
    retro_unload_game_t           core_unload_game;
    retro_get_memory_data_t       core_get_memory_data;
    retro_get_memory_size_t       core_get_memory_size;

    /* Core info */
    struct retro_system_info    system_info;
    struct retro_system_av_info av_info;
    unsigned pixel_format;

    /* Frame buffer */
    retrotest_frame_t frame;
    uint8_t frame_buffer[FRAME_BUFFER_SIZE];

    /* Audio buffer */
    retrotest_audio_t audio;
    int16_t audio_buffer[AUDIO_BUFFER_SIZE];

    /* Input state */
    retrotest_input_t input[MAX_PORTS];

    /* Memory regions */
    retrotest_memregion_t memory[4];

    /* Game loaded flag */
    bool game_loaded;
    bool core_loaded;

    /* System directory */
    char system_dir[256];
    char save_dir[256];
};

/* Global context for callbacks (libretro doesn't support userdata) */
static retrotest_ctx_t* g_ctx = NULL;

/* Log settings */
static retrotest_log_level_t g_log_level = RETROTEST_LOG_INFO;
static FILE* g_log_file = NULL;

/* ==========================================================================
   Logging
   ========================================================================== */

void retrotest_set_log_level(retrotest_log_level_t level) {
    g_log_level = level;
}

void retrotest_set_log_file(const char* path) {
    if (g_log_file && g_log_file != stderr) {
        fclose(g_log_file);
    }
    if (path) {
        g_log_file = fopen(path, "w");
    } else {
        g_log_file = NULL;
    }
}

void retrotest_log(retrotest_log_level_t level, const char* fmt, ...) {
    if (level < g_log_level) return;

    FILE* out = g_log_file ? g_log_file : stderr;

    const char* prefix[] = { "[DEBUG]", "[INFO]", "[WARN]", "[ERROR]" };
    fprintf(out, "%s ", prefix[level]);

    va_list args;
    va_start(args, fmt);
    vfprintf(out, fmt, args);
    va_end(args);

    fprintf(out, "\n");
    fflush(out);
}

/* ==========================================================================
   Libretro Callbacks
   ========================================================================== */

static void cb_video_refresh(const void* data, unsigned width,
                             unsigned height, size_t pitch) {
    if (!g_ctx || !data) return;

    g_ctx->frame.width = width;
    g_ctx->frame.height = height;
    g_ctx->frame.pitch = pitch;

    /* Convert to XRGB8888 if needed */
    uint32_t* dst = (uint32_t*)g_ctx->frame_buffer;

    switch (g_ctx->pixel_format) {
        case RETRO_PIXEL_FORMAT_XRGB8888: {
            /* Direct copy */
            const uint8_t* src = (const uint8_t*)data;
            for (unsigned y = 0; y < height; y++) {
                memcpy(&dst[y * width], &src[y * pitch], width * 4);
            }
            break;
        }
        case RETRO_PIXEL_FORMAT_RGB565: {
            /* Convert RGB565 to XRGB8888 */
            const uint16_t* src = (const uint16_t*)data;
            for (unsigned y = 0; y < height; y++) {
                for (unsigned x = 0; x < width; x++) {
                    uint16_t pixel = src[(y * pitch / 2) + x];
                    uint8_t r = ((pixel >> 11) & 0x1F) << 3;
                    uint8_t g = ((pixel >> 5) & 0x3F) << 2;
                    uint8_t b = (pixel & 0x1F) << 3;
                    dst[y * width + x] = (r << 16) | (g << 8) | b;
                }
            }
            break;
        }
        case RETRO_PIXEL_FORMAT_0RGB1555: {
            /* Convert 0RGB1555 to XRGB8888 */
            const uint16_t* src = (const uint16_t*)data;
            for (unsigned y = 0; y < height; y++) {
                for (unsigned x = 0; x < width; x++) {
                    uint16_t pixel = src[(y * pitch / 2) + x];
                    uint8_t r = ((pixel >> 10) & 0x1F) << 3;
                    uint8_t g = ((pixel >> 5) & 0x1F) << 3;
                    uint8_t b = (pixel & 0x1F) << 3;
                    dst[y * width + x] = (r << 16) | (g << 8) | b;
                }
            }
            break;
        }
    }

    g_ctx->frame.pixels = (uint32_t*)g_ctx->frame_buffer;
}

static void cb_audio_sample(int16_t left, int16_t right) {
    if (!g_ctx) return;
    if (g_ctx->audio.count >= AUDIO_BUFFER_SIZE / 2) return;

    g_ctx->audio_buffer[g_ctx->audio.count * 2] = left;
    g_ctx->audio_buffer[g_ctx->audio.count * 2 + 1] = right;
    g_ctx->audio.count++;
}

static size_t cb_audio_sample_batch(const int16_t* data, size_t frames) {
    if (!g_ctx) return 0;

    size_t available = (AUDIO_BUFFER_SIZE / 2) - g_ctx->audio.count;
    size_t to_copy = frames < available ? frames : available;

    memcpy(&g_ctx->audio_buffer[g_ctx->audio.count * 2], data, to_copy * 4);
    g_ctx->audio.count += to_copy;

    return to_copy;
}

static void cb_input_poll(void) {
    /* Nothing to do - input is set via retrotest_set_input */
}

static int16_t cb_input_state(unsigned port, unsigned device,
                               unsigned index, unsigned id) {
    if (!g_ctx || port >= MAX_PORTS) return 0;

    (void)device;
    (void)index;

    /* Check button state */
    if (id < 16) {
        return (g_ctx->input[port].buttons & (1 << id)) ? 1 : 0;
    }

    return 0;
}

static bool cb_environment(unsigned cmd, void* data) {
    if (!g_ctx) return false;

    switch (cmd) {
        case RETRO_ENVIRONMENT_GET_OVERSCAN:
            *(bool*)data = false;
            return true;

        case RETRO_ENVIRONMENT_GET_CAN_DUPE:
            *(bool*)data = true;
            return true;

        case RETRO_ENVIRONMENT_SET_PIXEL_FORMAT:
            g_ctx->pixel_format = *(unsigned*)data;
            return true;

        case RETRO_ENVIRONMENT_GET_SYSTEM_DIRECTORY:
            *(const char**)data = g_ctx->system_dir;
            return true;

        case RETRO_ENVIRONMENT_GET_SAVE_DIRECTORY:
            *(const char**)data = g_ctx->save_dir;
            return true;

        case RETRO_ENVIRONMENT_GET_LOG_INTERFACE:
            /* Could provide logging callback here */
            return false;

        case RETRO_ENVIRONMENT_SET_MEMORY_MAPS:
            /* Store memory map for inspection */
            retrotest_log(RETROTEST_LOG_DEBUG, "Core provided memory map");
            return true;

        case RETRO_ENVIRONMENT_GET_VARIABLE:
        case RETRO_ENVIRONMENT_SET_VARIABLES:
        case RETRO_ENVIRONMENT_GET_VARIABLE_UPDATE:
            /* Core options - not implemented yet */
            return false;

        default:
            retrotest_log(RETROTEST_LOG_DEBUG,
                         "Unhandled environment cmd: %u", cmd);
            return false;
    }
}

/* ==========================================================================
   Lifecycle Functions
   ========================================================================== */

retrotest_ctx_t* retrotest_create(void) {
    retrotest_ctx_t* ctx = calloc(1, sizeof(retrotest_ctx_t));
    if (!ctx) return NULL;

    ctx->audio.samples = ctx->audio_buffer;
    ctx->audio.capacity = AUDIO_BUFFER_SIZE / 2;
    ctx->frame.pixels = (uint32_t*)ctx->frame_buffer;
    ctx->pixel_format = RETRO_PIXEL_FORMAT_0RGB1555;

    strcpy(ctx->system_dir, ".");
    strcpy(ctx->save_dir, ".");

    return ctx;
}

void retrotest_destroy(retrotest_ctx_t* ctx) {
    if (!ctx) return;

    if (ctx->game_loaded) {
        retrotest_unload_game(ctx);
    }
    if (ctx->core_loaded) {
        retrotest_unload_core(ctx);
    }

    free(ctx);
}

/* Load symbol from core library */
#define LOAD_SYM(name) \
    ctx->core_##name = (retro_##name##_t)dlsym(ctx->core_handle, "retro_" #name); \
    if (!ctx->core_##name) { \
        retrotest_log(RETROTEST_LOG_ERROR, "Missing symbol: retro_" #name); \
        dlclose(ctx->core_handle); \
        ctx->core_handle = NULL; \
        return false; \
    }

bool retrotest_load_core(retrotest_ctx_t* ctx, const char* path) {
    if (!ctx || !path) return false;
    if (ctx->core_loaded) retrotest_unload_core(ctx);

    retrotest_log(RETROTEST_LOG_INFO, "Loading core: %s", path);

    ctx->core_handle = dlopen(path, RTLD_LAZY);
    if (!ctx->core_handle) {
        retrotest_log(RETROTEST_LOG_ERROR, "dlopen failed: %s", dlerror());
        return false;
    }

    /* Load all required symbols */
    LOAD_SYM(init);
    LOAD_SYM(deinit);
    LOAD_SYM(api_version);
    LOAD_SYM(get_system_info);
    LOAD_SYM(get_system_av_info);
    LOAD_SYM(set_environment);
    LOAD_SYM(set_video_refresh);
    LOAD_SYM(set_audio_sample);
    LOAD_SYM(set_audio_sample_batch);
    LOAD_SYM(set_input_poll);
    LOAD_SYM(set_input_state);
    LOAD_SYM(set_controller_port_device);
    LOAD_SYM(reset);
    LOAD_SYM(run);
    LOAD_SYM(serialize_size);
    LOAD_SYM(serialize);
    LOAD_SYM(unserialize);
    LOAD_SYM(load_game);
    LOAD_SYM(unload_game);
    LOAD_SYM(get_memory_data);
    LOAD_SYM(get_memory_size);

    /* Set up global context for callbacks */
    g_ctx = ctx;

    /* Per libretro spec: set_environment must be called before init */
    ctx->core_set_environment(cb_environment);

    /* Initialize core */
    ctx->core_init();
    ctx->core_get_system_info(&ctx->system_info);

    /* Set remaining callbacks after init (they may be cleared by init) */
    ctx->core_set_video_refresh(cb_video_refresh);
    ctx->core_set_audio_sample(cb_audio_sample);
    ctx->core_set_audio_sample_batch(cb_audio_sample_batch);
    ctx->core_set_input_poll(cb_input_poll);
    ctx->core_set_input_state(cb_input_state);

    retrotest_log(RETROTEST_LOG_INFO, "Core loaded: %s %s",
                 ctx->system_info.library_name,
                 ctx->system_info.library_version);

    ctx->core_loaded = true;
    return true;
}

bool retrotest_load_game(retrotest_ctx_t* ctx, const char* path) {
    if (!ctx || !path || !ctx->core_loaded) return false;
    if (ctx->game_loaded) retrotest_unload_game(ctx);

    retrotest_log(RETROTEST_LOG_INFO, "Loading game: %s", path);

    struct retro_game_info game = {0};
    game.path = path;

    /* Load ROM into memory if core doesn't use fullpath */
    void* rom_data = NULL;
    if (!ctx->system_info.need_fullpath) {
        FILE* f = fopen(path, "rb");
        if (!f) {
            retrotest_log(RETROTEST_LOG_ERROR, "Failed to open: %s", path);
            return false;
        }

        fseek(f, 0, SEEK_END);
        game.size = ftell(f);
        fseek(f, 0, SEEK_SET);

        rom_data = malloc(game.size);
        if (!rom_data) {
            fclose(f);
            return false;
        }

        if (fread(rom_data, 1, game.size, f) != game.size) {
            free(rom_data);
            fclose(f);
            return false;
        }
        fclose(f);

        game.data = rom_data;
    }

    bool result = ctx->core_load_game(&game);

    if (rom_data) free(rom_data);

    if (!result) {
        retrotest_log(RETROTEST_LOG_ERROR, "Core rejected game");
        return false;
    }

    ctx->core_get_system_av_info(&ctx->av_info);

    retrotest_log(RETROTEST_LOG_INFO, "Game loaded. Resolution: %ux%u, FPS: %.2f",
                 ctx->av_info.geometry.base_width,
                 ctx->av_info.geometry.base_height,
                 ctx->av_info.timing.fps);

    /* Update memory region info */
    for (unsigned i = 0; i < 4; i++) {
        ctx->memory[i].data = ctx->core_get_memory_data(i);
        ctx->memory[i].size = ctx->core_get_memory_size(i);
    }
    ctx->memory[RETRO_MEMORY_SYSTEM_RAM].name = "System RAM";
    ctx->memory[RETRO_MEMORY_SAVE_RAM].name = "Save RAM";
    ctx->memory[RETRO_MEMORY_VIDEO_RAM].name = "Video RAM";
    ctx->memory[RETRO_MEMORY_RTC].name = "RTC";

    ctx->game_loaded = true;
    return true;
}

void retrotest_unload_game(retrotest_ctx_t* ctx) {
    if (!ctx || !ctx->game_loaded) return;
    ctx->core_unload_game();
    ctx->game_loaded = false;
}

void retrotest_unload_core(retrotest_ctx_t* ctx) {
    if (!ctx || !ctx->core_loaded) return;

    ctx->core_deinit();
    dlclose(ctx->core_handle);
    ctx->core_handle = NULL;
    ctx->core_loaded = false;
    g_ctx = NULL;
}

/* ==========================================================================
   Execution Control
   ========================================================================== */

void retrotest_run_frame(retrotest_ctx_t* ctx) {
    if (!ctx || !ctx->game_loaded) return;
    ctx->core_run();
}

void retrotest_run_frames(retrotest_ctx_t* ctx, unsigned frames) {
    for (unsigned i = 0; i < frames; i++) {
        retrotest_run_frame(ctx);
    }
}

void retrotest_reset(retrotest_ctx_t* ctx) {
    if (!ctx || !ctx->game_loaded) return;
    ctx->core_reset();
}

/* ==========================================================================
   State Management
   ========================================================================== */

size_t retrotest_save_state(retrotest_ctx_t* ctx, void* data, size_t size) {
    if (!ctx || !ctx->game_loaded) return 0;

    size_t required = ctx->core_serialize_size();
    if (!data) return required;
    if (size < required) return 0;

    return ctx->core_serialize(data, size) ? required : 0;
}

bool retrotest_load_state(retrotest_ctx_t* ctx, const void* data, size_t size) {
    if (!ctx || !ctx->game_loaded || !data) return false;
    return ctx->core_unserialize(data, size);
}

bool retrotest_save_state_file(retrotest_ctx_t* ctx, const char* path) {
    size_t size = retrotest_save_state(ctx, NULL, 0);
    if (size == 0) return false;

    void* data = malloc(size);
    if (!data) return false;

    if (retrotest_save_state(ctx, data, size) == 0) {
        free(data);
        return false;
    }

    FILE* f = fopen(path, "wb");
    if (!f) {
        free(data);
        return false;
    }

    bool ok = fwrite(data, 1, size, f) == size;
    fclose(f);
    free(data);

    return ok;
}

bool retrotest_load_state_file(retrotest_ctx_t* ctx, const char* path) {
    FILE* f = fopen(path, "rb");
    if (!f) return false;

    fseek(f, 0, SEEK_END);
    size_t size = ftell(f);
    fseek(f, 0, SEEK_SET);

    void* data = malloc(size);
    if (!data) {
        fclose(f);
        return false;
    }

    if (fread(data, 1, size, f) != size) {
        free(data);
        fclose(f);
        return false;
    }
    fclose(f);

    bool ok = retrotest_load_state(ctx, data, size);
    free(data);

    return ok;
}

/* ==========================================================================
   Frame Capture
   ========================================================================== */

const retrotest_frame_t* retrotest_get_frame(retrotest_ctx_t* ctx) {
    return ctx ? &ctx->frame : NULL;
}

uint64_t retrotest_frame_hash(retrotest_ctx_t* ctx) {
    if (!ctx || !ctx->frame.pixels) return 0;

    /* Simple FNV-1a hash */
    uint64_t hash = 14695981039346656037ULL;
    const uint8_t* data = (const uint8_t*)ctx->frame.pixels;
    size_t size = ctx->frame.width * ctx->frame.height * 4;

    for (size_t i = 0; i < size; i++) {
        hash ^= data[i];
        hash *= 1099511628211ULL;
    }

    return hash;
}

/* PNG saving would require libpng - stub for now */
bool retrotest_save_frame_png(retrotest_ctx_t* ctx, const char* path) {
    (void)ctx;
    (void)path;
    retrotest_log(RETROTEST_LOG_WARN, "PNG saving not implemented");
    return false;
}

bool retrotest_compare_frame(retrotest_ctx_t* ctx, const char* ref_path,
                             unsigned threshold) {
    (void)ctx;
    (void)ref_path;
    (void)threshold;
    retrotest_log(RETROTEST_LOG_WARN, "Frame comparison not implemented");
    return false;
}

/* ==========================================================================
   Audio Capture
   ========================================================================== */

const retrotest_audio_t* retrotest_get_audio(retrotest_ctx_t* ctx) {
    return ctx ? &ctx->audio : NULL;
}

void retrotest_clear_audio(retrotest_ctx_t* ctx) {
    if (ctx) ctx->audio.count = 0;
}

bool retrotest_save_audio_wav(retrotest_ctx_t* ctx, const char* path) {
    (void)ctx;
    (void)path;
    retrotest_log(RETROTEST_LOG_WARN, "WAV saving not implemented");
    return false;
}

/* ==========================================================================
   Memory Inspection
   ========================================================================== */

const retrotest_memregion_t* retrotest_get_memory(retrotest_ctx_t* ctx,
                                                   unsigned type) {
    if (!ctx || type >= 4) return NULL;
    if (!ctx->memory[type].data) return NULL;
    return &ctx->memory[type];
}

uint8_t retrotest_read_u8(retrotest_ctx_t* ctx, unsigned type, size_t offset) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset >= mem->size) return 0;
    return ((uint8_t*)mem->data)[offset];
}

uint16_t retrotest_read_u16(retrotest_ctx_t* ctx, unsigned type, size_t offset) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset + 1 >= mem->size) return 0;
    uint8_t* p = (uint8_t*)mem->data + offset;
    return p[0] | (p[1] << 8);
}

uint32_t retrotest_read_u32(retrotest_ctx_t* ctx, unsigned type, size_t offset) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset + 3 >= mem->size) return 0;
    uint8_t* p = (uint8_t*)mem->data + offset;
    return p[0] | (p[1] << 8) | (p[2] << 16) | (p[3] << 24);
}

void retrotest_write_u8(retrotest_ctx_t* ctx, unsigned type,
                        size_t offset, uint8_t value) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset >= mem->size) return;
    ((uint8_t*)mem->data)[offset] = value;
}

void retrotest_write_u16(retrotest_ctx_t* ctx, unsigned type,
                         size_t offset, uint16_t value) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset + 1 >= mem->size) return;
    uint8_t* p = (uint8_t*)mem->data + offset;
    p[0] = value & 0xFF;
    p[1] = (value >> 8) & 0xFF;
}

void retrotest_write_u32(retrotest_ctx_t* ctx, unsigned type,
                         size_t offset, uint32_t value) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || offset + 3 >= mem->size) return;
    uint8_t* p = (uint8_t*)mem->data + offset;
    p[0] = value & 0xFF;
    p[1] = (value >> 8) & 0xFF;
    p[2] = (value >> 16) & 0xFF;
    p[3] = (value >> 24) & 0xFF;
}

size_t retrotest_mem_find(retrotest_ctx_t* ctx, unsigned type,
                          const uint8_t* pattern, size_t len, size_t start) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || !pattern || len == 0) return (size_t)-1;
    if (start + len > mem->size) return (size_t)-1;

    const uint8_t* data = (const uint8_t*)mem->data;
    for (size_t i = start; i <= mem->size - len; i++) {
        if (memcmp(&data[i], pattern, len) == 0) {
            return i;
        }
    }

    return (size_t)-1;
}

bool retrotest_mem_compare(retrotest_ctx_t* ctx, unsigned type, size_t offset,
                           const uint8_t* expected, size_t len) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem || !expected) return false;
    if (offset + len > mem->size) return false;

    return memcmp((uint8_t*)mem->data + offset, expected, len) == 0;
}

bool retrotest_mem_dump(retrotest_ctx_t* ctx, unsigned type, const char* path) {
    const retrotest_memregion_t* mem = retrotest_get_memory(ctx, type);
    if (!mem) return false;

    FILE* f = fopen(path, "wb");
    if (!f) return false;

    bool ok = fwrite(mem->data, 1, mem->size, f) == mem->size;
    fclose(f);

    return ok;
}

/* ==========================================================================
   Input Scripting
   ========================================================================== */

void retrotest_set_input(retrotest_ctx_t* ctx, unsigned port,
                         const retrotest_input_t* input) {
    if (!ctx || port >= MAX_PORTS || !input) return;
    ctx->input[port] = *input;
}

void retrotest_clear_input(retrotest_ctx_t* ctx) {
    if (!ctx) return;
    memset(ctx->input, 0, sizeof(ctx->input));
}

void retrotest_press_button(retrotest_ctx_t* ctx, unsigned port, unsigned button) {
    if (!ctx || port >= MAX_PORTS || button >= 16) return;
    ctx->input[port].buttons |= (1 << button);
}
