/**
 * RetroForge Core Types
 *
 * Cross-platform type definitions for retro game development.
 * These types provide consistent behavior across Saturn, N64, and host platforms.
 */

#ifndef RETROFORGE_TYPES_H
#define RETROFORGE_TYPES_H

#include <stdint.h>
#include <stdbool.h>

/* ==========================================================================
   Platform Detection
   ========================================================================== */

#if defined(__SH2__) || defined(__sh2__)
    #define RF_PLATFORM_SATURN 1
    #define RF_PLATFORM_NAME "saturn"
#elif defined(__mips__) || defined(__MIPS__)
    #define RF_PLATFORM_N64 1
    #define RF_PLATFORM_NAME "n64"
#else
    #define RF_PLATFORM_HOST 1
    #define RF_PLATFORM_NAME "host"
#endif

/* ==========================================================================
   Fixed-Point Types

   Retro consoles lack FPUs (Saturn) or have limited FPU (N64 RSP uses integer).
   Fixed-point math is essential for consistent, fast calculations.
   ========================================================================== */

/* 16.16 fixed-point: Good for positions, general math */
typedef int32_t fixed16_t;
#define FIXED16_SHIFT 16
#define FIXED16_ONE   (1 << FIXED16_SHIFT)
#define FIXED16_HALF  (1 << (FIXED16_SHIFT - 1))

/* Convert int to fixed16 */
#define INT_TO_FIXED16(x)   ((fixed16_t)((x) << FIXED16_SHIFT))
/* Convert fixed16 to int (truncate) */
#define FIXED16_TO_INT(x)   ((int32_t)((x) >> FIXED16_SHIFT))
/* Convert float to fixed16 (host/compile-time only) */
#define FLOAT_TO_FIXED16(x) ((fixed16_t)((x) * FIXED16_ONE))
/* Convert fixed16 to float (host/debug only) */
#define FIXED16_TO_FLOAT(x) ((float)(x) / FIXED16_ONE)

/* 8.8 fixed-point: Good for normalized values, UV coords */
typedef int16_t fixed8_t;
#define FIXED8_SHIFT 8
#define FIXED8_ONE   (1 << FIXED8_SHIFT)

/* 4.12 fixed-point: Good for sin/cos tables, high precision 0-1 range */
typedef int16_t fixed12_t;
#define FIXED12_SHIFT 12
#define FIXED12_ONE   (1 << FIXED12_SHIFT)

/* ==========================================================================
   Vector Types
   ========================================================================== */

/* 2D vector (fixed-point) */
typedef struct {
    fixed16_t x, y;
} vec2_t;

/* 3D vector (fixed-point) */
typedef struct {
    fixed16_t x, y, z;
} vec3_t;

/* 4D vector/quaternion (fixed-point) */
typedef struct {
    fixed16_t x, y, z, w;
} vec4_t;

/* 2D vector (integer) - for screen coordinates */
typedef struct {
    int16_t x, y;
} ivec2_t;

/* 3D vector (integer) */
typedef struct {
    int16_t x, y, z;
} ivec3_t;

/* ==========================================================================
   Matrix Types
   ========================================================================== */

/* 3x3 matrix (fixed-point) - for 2D transforms, rotations */
typedef struct {
    fixed16_t m[3][3];
} mat3_t;

/* 4x4 matrix (fixed-point) - for 3D transforms */
typedef struct {
    fixed16_t m[4][4];
} mat4_t;

/* ==========================================================================
   Color Types
   ========================================================================== */

/* RGB555 - Common format for Saturn VDP2, N64 RGBA16 (with alpha bit) */
typedef uint16_t color555_t;
#define COLOR555_R_MASK 0x7C00
#define COLOR555_G_MASK 0x03E0
#define COLOR555_B_MASK 0x001F
#define COLOR555(r, g, b) (((r) << 10) | ((g) << 5) | (b))

/* RGBA8888 - For intermediate processing, host rendering */
typedef uint32_t color8888_t;
#define COLOR8888_R(c) (((c) >> 24) & 0xFF)
#define COLOR8888_G(c) (((c) >> 16) & 0xFF)
#define COLOR8888_B(c) (((c) >> 8) & 0xFF)
#define COLOR8888_A(c) ((c) & 0xFF)
#define COLOR8888(r, g, b, a) (((r) << 24) | ((g) << 16) | ((b) << 8) | (a))

/* ==========================================================================
   Rectangle Types
   ========================================================================== */

typedef struct {
    int16_t x, y, w, h;
} rect_t;

typedef struct {
    fixed16_t x, y, w, h;
} rectf_t;

/* ==========================================================================
   Utility Macros
   ========================================================================== */

#define RF_MIN(a, b) (((a) < (b)) ? (a) : (b))
#define RF_MAX(a, b) (((a) > (b)) ? (a) : (b))
#define RF_CLAMP(x, lo, hi) RF_MIN(RF_MAX(x, lo), hi)
#define RF_ABS(x) (((x) < 0) ? -(x) : (x))

/* Alignment macros - critical for DMA and hardware requirements */
#define RF_ALIGN(x, a) (((x) + ((a) - 1)) & ~((a) - 1))
#define RF_IS_ALIGNED(x, a) (((x) & ((a) - 1)) == 0)

/* Array size */
#define RF_ARRAY_SIZE(arr) (sizeof(arr) / sizeof((arr)[0]))

/* ==========================================================================
   Platform-specific attributes
   ========================================================================== */

#if RF_PLATFORM_SATURN
    #define RF_FAST_RAM   __attribute__((section(".hwram")))  /* Work RAM High */
    #define RF_SLOW_RAM   __attribute__((section(".lwram")))  /* Work RAM Low */
    #define RF_ALIGNED(n) __attribute__((aligned(n)))
#elif RF_PLATFORM_N64
    #define RF_FAST_RAM   /* RDRAM is unified */
    #define RF_SLOW_RAM
    #define RF_ALIGNED(n) __attribute__((aligned(n)))
#else
    #define RF_FAST_RAM
    #define RF_SLOW_RAM
    #define RF_ALIGNED(n) __attribute__((aligned(n)))
#endif

#endif /* RETROFORGE_TYPES_H */
