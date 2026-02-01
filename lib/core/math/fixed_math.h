/**
 * RetroForge Fixed-Point Math
 *
 * Fast fixed-point arithmetic for retro platforms.
 * Optimized for platforms without FPU or with integer-focused pipelines.
 */

#ifndef RETROFORGE_FIXED_MATH_H
#define RETROFORGE_FIXED_MATH_H

#include "../types/types.h"

/* ==========================================================================
   Fixed16 Arithmetic
   ========================================================================== */

/**
 * Multiply two fixed16 values
 * Result = (a * b) >> 16
 */
static inline fixed16_t fixed16_mul(fixed16_t a, fixed16_t b) {
    /* Use 64-bit intermediate to avoid overflow */
    int64_t result = (int64_t)a * (int64_t)b;
    return (fixed16_t)(result >> FIXED16_SHIFT);
}

/**
 * Divide two fixed16 values
 * Result = (a << 16) / b
 */
static inline fixed16_t fixed16_div(fixed16_t a, fixed16_t b) {
    /* Shift numerator first for precision */
    int64_t temp = (int64_t)a << FIXED16_SHIFT;
    return (fixed16_t)(temp / b);
}

/**
 * Fast multiply by integer
 */
static inline fixed16_t fixed16_mul_int(fixed16_t a, int32_t b) {
    return a * b;
}

/**
 * Interpolate between two values: result = a + (b - a) * t
 * t is in fixed16 format (0.0 = 0, 1.0 = FIXED16_ONE)
 */
static inline fixed16_t fixed16_lerp(fixed16_t a, fixed16_t b, fixed16_t t) {
    return a + fixed16_mul(b - a, t);
}

/* ==========================================================================
   Vector2 Operations
   ========================================================================== */

static inline vec2_t vec2_add(vec2_t a, vec2_t b) {
    return (vec2_t){ a.x + b.x, a.y + b.y };
}

static inline vec2_t vec2_sub(vec2_t a, vec2_t b) {
    return (vec2_t){ a.x - b.x, a.y - b.y };
}

static inline vec2_t vec2_scale(vec2_t v, fixed16_t s) {
    return (vec2_t){ fixed16_mul(v.x, s), fixed16_mul(v.y, s) };
}

static inline fixed16_t vec2_dot(vec2_t a, vec2_t b) {
    return fixed16_mul(a.x, b.x) + fixed16_mul(a.y, b.y);
}

/* ==========================================================================
   Vector3 Operations
   ========================================================================== */

static inline vec3_t vec3_add(vec3_t a, vec3_t b) {
    return (vec3_t){ a.x + b.x, a.y + b.y, a.z + b.z };
}

static inline vec3_t vec3_sub(vec3_t a, vec3_t b) {
    return (vec3_t){ a.x - b.x, a.y - b.y, a.z - b.z };
}

static inline vec3_t vec3_scale(vec3_t v, fixed16_t s) {
    return (vec3_t){
        fixed16_mul(v.x, s),
        fixed16_mul(v.y, s),
        fixed16_mul(v.z, s)
    };
}

static inline fixed16_t vec3_dot(vec3_t a, vec3_t b) {
    return fixed16_mul(a.x, b.x) +
           fixed16_mul(a.y, b.y) +
           fixed16_mul(a.z, b.z);
}

static inline vec3_t vec3_cross(vec3_t a, vec3_t b) {
    return (vec3_t){
        fixed16_mul(a.y, b.z) - fixed16_mul(a.z, b.y),
        fixed16_mul(a.z, b.x) - fixed16_mul(a.x, b.z),
        fixed16_mul(a.x, b.y) - fixed16_mul(a.y, b.x)
    };
}

/* ==========================================================================
   Trigonometry (Table-based)

   Uses 4.12 fixed-point for precision in the 0-1 range.
   Angles are in "brads" (binary radians): 0-65535 = 0-360 degrees
   ========================================================================== */

/* Angle type: full circle = 65536 (fits in uint16_t) */
typedef uint16_t angle_t;

#define ANGLE_0     0
#define ANGLE_90    16384
#define ANGLE_180   32768
#define ANGLE_270   49152
#define ANGLE_360   65536

/* Convert degrees to angle_t */
#define DEG_TO_ANGLE(deg) ((angle_t)(((deg) * 65536) / 360))

/* Sin/cos tables - defined in fixed_math.c */
extern const fixed12_t rf_sin_table[256];

/**
 * Get sine of angle (returns fixed12: -4096 to +4096)
 */
static inline fixed12_t rf_sin(angle_t angle) {
    /* Table has 256 entries for first quadrant, mirror for others */
    uint16_t index = angle >> 6;  /* Reduce to 10-bit, use top 8 */
    uint8_t quadrant = (angle >> 14) & 3;

    switch (quadrant) {
        case 0: return  rf_sin_table[index & 0xFF];
        case 1: return  rf_sin_table[255 - (index & 0xFF)];
        case 2: return -rf_sin_table[index & 0xFF];
        case 3: return -rf_sin_table[255 - (index & 0xFF)];
    }
    return 0;
}

/**
 * Get cosine of angle
 */
static inline fixed12_t rf_cos(angle_t angle) {
    return rf_sin(angle + ANGLE_90);
}

/* ==========================================================================
   Square Root (Integer)

   Fast integer square root using Newton's method
   ========================================================================== */

uint32_t rf_sqrt(uint32_t n);

/**
 * Fixed16 square root
 * Takes fixed16 input, returns fixed16 output
 */
fixed16_t fixed16_sqrt(fixed16_t n);

/**
 * Vector length (magnitude)
 */
fixed16_t vec2_length(vec2_t v);
fixed16_t vec3_length(vec3_t v);

/**
 * Normalize vector to unit length
 */
vec2_t vec2_normalize(vec2_t v);
vec3_t vec3_normalize(vec3_t v);

#endif /* RETROFORGE_FIXED_MATH_H */
