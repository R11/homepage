/**
 * RetroForge Fixed-Point Math Implementation
 */

#include "fixed_math.h"

/* ==========================================================================
   Sin Table (256 entries for first quadrant)

   Values are fixed12: sin(i * 90 / 256) * 4096
   Generated at build time for accuracy
   ========================================================================== */

const fixed12_t rf_sin_table[256] = {
       0,   25,   50,   75,  100,  125,  150,  175,
     200,  225,  250,  275,  300,  325,  350,  375,
     400,  424,  449,  474,  498,  523,  548,  572,
     597,  621,  646,  670,  694,  719,  743,  767,
     791,  815,  839,  863,  887,  911,  935,  958,
     982, 1005, 1029, 1052, 1075, 1098, 1121, 1144,
    1167, 1190, 1212, 1235, 1257, 1280, 1302, 1324,
    1346, 1368, 1389, 1411, 1433, 1454, 1475, 1496,
    1517, 1538, 1559, 1580, 1600, 1621, 1641, 1661,
    1681, 1701, 1721, 1740, 1760, 1779, 1798, 1817,
    1836, 1855, 1874, 1892, 1911, 1929, 1947, 1965,
    1983, 2001, 2018, 2035, 2053, 2070, 2087, 2104,
    2120, 2137, 2153, 2170, 2186, 2202, 2218, 2233,
    2249, 2264, 2280, 2295, 2310, 2325, 2339, 2354,
    2368, 2383, 2397, 2411, 2425, 2438, 2452, 2465,
    2478, 2492, 2505, 2517, 2530, 2543, 2555, 2567,
    2580, 2591, 2603, 2615, 2626, 2638, 2649, 2660,
    2671, 2681, 2692, 2702, 2713, 2723, 2733, 2742,
    2752, 2762, 2771, 2780, 2789, 2798, 2807, 2815,
    2824, 2832, 2840, 2848, 2856, 2864, 2871, 2879,
    2886, 2893, 2900, 2907, 2914, 2920, 2927, 2933,
    2939, 2945, 2951, 2956, 2962, 2967, 2972, 2977,
    2982, 2987, 2992, 2996, 3001, 3005, 3009, 3013,
    3017, 3020, 3024, 3027, 3030, 3033, 3036, 3039,
    3042, 3044, 3047, 3049, 3051, 3053, 3055, 3057,
    3058, 3060, 3061, 3062, 3064, 3065, 3065, 3066,
    3067, 3067, 3068, 3068, 3068, 3068, 3068, 3068,
    3068, 3068, 3067, 3067, 3066, 3065, 3065, 3064,
    3062, 3061, 3060, 3058, 3057, 3055, 3053, 3051,
    3049, 3047, 3044, 3042, 3039, 3036, 3033, 3030,
    3027, 3024, 3020, 3017, 3013, 3009, 3005, 3001,
    2996, 2992, 2987, 2982, 2977, 2972, 2967, 2962
};

/* ==========================================================================
   Square Root
   ========================================================================== */

/**
 * Integer square root using Newton's method
 * Optimized for 32-bit inputs
 */
uint32_t rf_sqrt(uint32_t n) {
    if (n == 0) return 0;

    uint32_t x = n;
    uint32_t y = (x + 1) >> 1;

    while (y < x) {
        x = y;
        y = (x + n / x) >> 1;
    }

    return x;
}

/**
 * Fixed16 square root
 * sqrt(n) where n is fixed16 (16.16)
 * Returns fixed16 result
 */
fixed16_t fixed16_sqrt(fixed16_t n) {
    if (n <= 0) return 0;

    /* Scale up to maintain precision, then take integer sqrt */
    /* sqrt(n * 2^16) = sqrt(n) * 2^8, so we need to shift up by 8 more */
    uint64_t scaled = (uint64_t)n << 16;

    /* Newton's method on the scaled value */
    uint64_t x = scaled;
    uint64_t y = (x + 1) >> 1;

    while (y < x) {
        x = y;
        y = (x + scaled / x) >> 1;
    }

    return (fixed16_t)x;
}

/**
 * 2D vector length
 */
fixed16_t vec2_length(vec2_t v) {
    /* length = sqrt(x^2 + y^2) */
    fixed16_t x2 = fixed16_mul(v.x, v.x);
    fixed16_t y2 = fixed16_mul(v.y, v.y);
    return fixed16_sqrt(x2 + y2);
}

/**
 * 3D vector length
 */
fixed16_t vec3_length(vec3_t v) {
    /* length = sqrt(x^2 + y^2 + z^2) */
    fixed16_t x2 = fixed16_mul(v.x, v.x);
    fixed16_t y2 = fixed16_mul(v.y, v.y);
    fixed16_t z2 = fixed16_mul(v.z, v.z);
    return fixed16_sqrt(x2 + y2 + z2);
}

/**
 * Normalize 2D vector
 */
vec2_t vec2_normalize(vec2_t v) {
    fixed16_t len = vec2_length(v);
    if (len == 0) return (vec2_t){ 0, 0 };

    return (vec2_t){
        fixed16_div(v.x, len),
        fixed16_div(v.y, len)
    };
}

/**
 * Normalize 3D vector
 */
vec3_t vec3_normalize(vec3_t v) {
    fixed16_t len = vec3_length(v);
    if (len == 0) return (vec3_t){ 0, 0, 0 };

    return (vec3_t){
        fixed16_div(v.x, len),
        fixed16_div(v.y, len),
        fixed16_div(v.z, len)
    };
}
