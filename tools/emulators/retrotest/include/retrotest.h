/**
 * RetroTest - Libretro Testing Frontend
 *
 * A minimal, headless libretro frontend designed for automated testing.
 * Supports memory inspection, frame capture, and deterministic execution.
 *
 * Based on the libretro API specification.
 * Reference: https://docs.libretro.com/development/libretro-overview/
 */

#ifndef RETROTEST_H
#define RETROTEST_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

/* ==========================================================================
   Libretro Core Interface (loaded dynamically)
   ========================================================================== */

/* Callbacks the core uses to communicate with the frontend */
typedef void (*retro_video_refresh_t)(const void *data, unsigned width,
                                       unsigned height, size_t pitch);
typedef void (*retro_audio_sample_t)(int16_t left, int16_t right);
typedef size_t (*retro_audio_sample_batch_t)(const int16_t *data, size_t frames);
typedef void (*retro_input_poll_t)(void);
typedef int16_t (*retro_input_state_t)(unsigned port, unsigned device,
                                        unsigned index, unsigned id);

/* Core API functions */
typedef void (*retro_set_environment_t)(void*);
typedef void (*retro_set_video_refresh_t)(retro_video_refresh_t);
typedef void (*retro_set_audio_sample_t)(retro_audio_sample_t);
typedef void (*retro_set_audio_sample_batch_t)(retro_audio_sample_batch_t);
typedef void (*retro_set_input_poll_t)(retro_input_poll_t);
typedef void (*retro_set_input_state_t)(retro_input_state_t);
typedef void (*retro_init_t)(void);
typedef void (*retro_deinit_t)(void);
typedef unsigned (*retro_api_version_t)(void);
typedef void (*retro_get_system_info_t)(void*);
typedef void (*retro_get_system_av_info_t)(void*);
typedef void (*retro_set_controller_port_device_t)(unsigned, unsigned);
typedef void (*retro_reset_t)(void);
typedef void (*retro_run_t)(void);
typedef size_t (*retro_serialize_size_t)(void);
typedef bool (*retro_serialize_t)(void*, size_t);
typedef bool (*retro_unserialize_t)(const void*, size_t);
typedef bool (*retro_load_game_t)(const void*);
typedef void (*retro_unload_game_t)(void);
typedef void* (*retro_get_memory_data_t)(unsigned);
typedef size_t (*retro_get_memory_size_t)(unsigned);

/* Memory region IDs */
#define RETRO_MEMORY_SAVE_RAM    0
#define RETRO_MEMORY_RTC         1
#define RETRO_MEMORY_SYSTEM_RAM  2
#define RETRO_MEMORY_VIDEO_RAM   3

/* ==========================================================================
   RetroTest API
   ========================================================================== */

/* Test context - holds all state for a test session */
typedef struct retrotest_ctx retrotest_ctx_t;

/* Frame capture data */
typedef struct {
    uint32_t* pixels;      /* XRGB8888 format */
    unsigned  width;
    unsigned  height;
    size_t    pitch;
} retrotest_frame_t;

/* Audio capture data */
typedef struct {
    int16_t* samples;      /* Interleaved stereo */
    size_t   count;        /* Number of stereo frames */
    size_t   capacity;
} retrotest_audio_t;

/* Memory region info */
typedef struct {
    void*       data;
    size_t      size;
    const char* name;
    uint32_t    flags;
} retrotest_memregion_t;

/* Input state for scripting */
typedef struct {
    uint16_t buttons;      /* Button bitmask */
    int16_t  analog_x;     /* Left stick X */
    int16_t  analog_y;     /* Left stick Y */
} retrotest_input_t;

/* ==========================================================================
   Lifecycle Functions
   ========================================================================== */

/**
 * Create a new test context
 * @return New context or NULL on failure
 */
retrotest_ctx_t* retrotest_create(void);

/**
 * Destroy test context and free resources
 */
void retrotest_destroy(retrotest_ctx_t* ctx);

/**
 * Load a libretro core (.so/.dll/.dylib)
 * @param ctx   Test context
 * @param path  Path to core library
 * @return true on success
 */
bool retrotest_load_core(retrotest_ctx_t* ctx, const char* path);

/**
 * Load a ROM/game file
 * @param ctx   Test context
 * @param path  Path to ROM file
 * @return true on success
 */
bool retrotest_load_game(retrotest_ctx_t* ctx, const char* path);

/**
 * Unload the current game
 */
void retrotest_unload_game(retrotest_ctx_t* ctx);

/**
 * Unload the current core
 */
void retrotest_unload_core(retrotest_ctx_t* ctx);

/* ==========================================================================
   Execution Control
   ========================================================================== */

/**
 * Run the core for one frame
 */
void retrotest_run_frame(retrotest_ctx_t* ctx);

/**
 * Run the core for N frames
 * @param ctx     Test context
 * @param frames  Number of frames to run
 */
void retrotest_run_frames(retrotest_ctx_t* ctx, unsigned frames);

/**
 * Reset the emulated system
 */
void retrotest_reset(retrotest_ctx_t* ctx);

/* ==========================================================================
   State Management (for reproducible tests)
   ========================================================================== */

/**
 * Save current state to buffer
 * @param ctx   Test context
 * @param data  Output buffer (NULL to query size)
 * @param size  Buffer size
 * @return Bytes written, or required size if data is NULL
 */
size_t retrotest_save_state(retrotest_ctx_t* ctx, void* data, size_t size);

/**
 * Load state from buffer
 * @param ctx   Test context
 * @param data  State data
 * @param size  Data size
 * @return true on success
 */
bool retrotest_load_state(retrotest_ctx_t* ctx, const void* data, size_t size);

/**
 * Save state to file
 */
bool retrotest_save_state_file(retrotest_ctx_t* ctx, const char* path);

/**
 * Load state from file
 */
bool retrotest_load_state_file(retrotest_ctx_t* ctx, const char* path);

/* ==========================================================================
   Frame Capture
   ========================================================================== */

/**
 * Get the most recent frame
 * @param ctx  Test context
 * @return Frame data (valid until next frame)
 */
const retrotest_frame_t* retrotest_get_frame(retrotest_ctx_t* ctx);

/**
 * Save frame as PNG
 * @param ctx   Test context
 * @param path  Output path
 * @return true on success
 */
bool retrotest_save_frame_png(retrotest_ctx_t* ctx, const char* path);

/**
 * Compare current frame to reference image
 * @param ctx        Test context
 * @param ref_path   Path to reference PNG
 * @param threshold  Max allowed difference (0-255 per channel)
 * @return true if frames match within threshold
 */
bool retrotest_compare_frame(retrotest_ctx_t* ctx, const char* ref_path,
                             unsigned threshold);

/**
 * Compute frame hash (for quick comparison)
 * @param ctx  Test context
 * @return 64-bit hash of current frame
 */
uint64_t retrotest_frame_hash(retrotest_ctx_t* ctx);

/* ==========================================================================
   Audio Capture
   ========================================================================== */

/**
 * Get captured audio since last call
 * @param ctx  Test context
 * @return Audio data (caller should copy if needed)
 */
const retrotest_audio_t* retrotest_get_audio(retrotest_ctx_t* ctx);

/**
 * Clear audio buffer
 */
void retrotest_clear_audio(retrotest_ctx_t* ctx);

/**
 * Save audio buffer as WAV
 */
bool retrotest_save_audio_wav(retrotest_ctx_t* ctx, const char* path);

/* ==========================================================================
   Memory Inspection
   ========================================================================== */

/**
 * Get memory region by type
 * @param ctx  Test context
 * @param type RETRO_MEMORY_* constant
 * @return Memory region info (NULL if not available)
 */
const retrotest_memregion_t* retrotest_get_memory(retrotest_ctx_t* ctx,
                                                   unsigned type);

/**
 * Read byte from emulated memory
 */
uint8_t retrotest_read_u8(retrotest_ctx_t* ctx, unsigned type, size_t offset);

/**
 * Read 16-bit word (little-endian)
 */
uint16_t retrotest_read_u16(retrotest_ctx_t* ctx, unsigned type, size_t offset);

/**
 * Read 32-bit word (little-endian)
 */
uint32_t retrotest_read_u32(retrotest_ctx_t* ctx, unsigned type, size_t offset);

/**
 * Write byte to emulated memory
 */
void retrotest_write_u8(retrotest_ctx_t* ctx, unsigned type,
                        size_t offset, uint8_t value);

/**
 * Write 16-bit word (little-endian)
 */
void retrotest_write_u16(retrotest_ctx_t* ctx, unsigned type,
                         size_t offset, uint16_t value);

/**
 * Write 32-bit word (little-endian)
 */
void retrotest_write_u32(retrotest_ctx_t* ctx, unsigned type,
                         size_t offset, uint32_t value);

/**
 * Search memory for byte pattern
 * @param ctx     Test context
 * @param type    Memory type
 * @param pattern Bytes to find
 * @param len     Pattern length
 * @param start   Start offset
 * @return Offset of match, or (size_t)-1 if not found
 */
size_t retrotest_mem_find(retrotest_ctx_t* ctx, unsigned type,
                          const uint8_t* pattern, size_t len, size_t start);

/**
 * Compare memory region to expected data
 * @param ctx      Test context
 * @param type     Memory type
 * @param offset   Start offset
 * @param expected Expected bytes
 * @param len      Length to compare
 * @return true if memory matches
 */
bool retrotest_mem_compare(retrotest_ctx_t* ctx, unsigned type, size_t offset,
                           const uint8_t* expected, size_t len);

/**
 * Dump memory region to file
 */
bool retrotest_mem_dump(retrotest_ctx_t* ctx, unsigned type, const char* path);

/* ==========================================================================
   Input Scripting
   ========================================================================== */

/**
 * Set input state for next frame(s)
 * @param ctx   Test context
 * @param port  Controller port (0-3)
 * @param input Input state
 */
void retrotest_set_input(retrotest_ctx_t* ctx, unsigned port,
                         const retrotest_input_t* input);

/**
 * Clear all input
 */
void retrotest_clear_input(retrotest_ctx_t* ctx);

/**
 * Press a button for one frame
 */
void retrotest_press_button(retrotest_ctx_t* ctx, unsigned port, unsigned button);

/* Button constants */
#define RETROTEST_BTN_B        0
#define RETROTEST_BTN_Y        1
#define RETROTEST_BTN_SELECT   2
#define RETROTEST_BTN_START    3
#define RETROTEST_BTN_UP       4
#define RETROTEST_BTN_DOWN     5
#define RETROTEST_BTN_LEFT     6
#define RETROTEST_BTN_RIGHT    7
#define RETROTEST_BTN_A        8
#define RETROTEST_BTN_X        9
#define RETROTEST_BTN_L        10
#define RETROTEST_BTN_R        11
#define RETROTEST_BTN_L2       12
#define RETROTEST_BTN_R2       13
#define RETROTEST_BTN_L3       14
#define RETROTEST_BTN_R3       15

/* ==========================================================================
   Logging & Assertions
   ========================================================================== */

typedef enum {
    RETROTEST_LOG_DEBUG,
    RETROTEST_LOG_INFO,
    RETROTEST_LOG_WARN,
    RETROTEST_LOG_ERROR
} retrotest_log_level_t;

/**
 * Set log level
 */
void retrotest_set_log_level(retrotest_log_level_t level);

/**
 * Set log output file (NULL for stderr)
 */
void retrotest_set_log_file(const char* path);

/**
 * Log a message
 */
void retrotest_log(retrotest_log_level_t level, const char* fmt, ...);

/* Assertion macros for test scripts */
#define RETROTEST_ASSERT(ctx, expr) \
    do { \
        if (!(expr)) { \
            retrotest_log(RETROTEST_LOG_ERROR, \
                "ASSERT FAILED: %s (%s:%d)", #expr, __FILE__, __LINE__); \
            return false; \
        } \
    } while(0)

#define RETROTEST_ASSERT_EQ(ctx, a, b) \
    RETROTEST_ASSERT(ctx, (a) == (b))

#define RETROTEST_ASSERT_MEM(ctx, type, offset, expected, len) \
    RETROTEST_ASSERT(ctx, retrotest_mem_compare(ctx, type, offset, expected, len))

#endif /* RETROTEST_H */
