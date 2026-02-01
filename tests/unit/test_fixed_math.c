/**
 * Unit Tests: Fixed-Point Math
 *
 * Tests for the core fixed-point math library.
 * These run on host for fast iteration.
 */

#include "../test_framework.h"
#include "../../lib/core/types/types.h"
#include "../../lib/core/math/fixed_math.h"

/* ==========================================================================
   Fixed16 Basic Operations
   ========================================================================== */

RF_TEST(fixed16_conversion) {
    RF_TEST_BEGIN("fixed16 int/fixed conversion");

    /* int to fixed */
    RF_ASSERT_EQ(INT_TO_FIXED16(1), FIXED16_ONE);
    RF_ASSERT_EQ(INT_TO_FIXED16(5), 5 * FIXED16_ONE);
    RF_ASSERT_EQ(INT_TO_FIXED16(-3), -3 * FIXED16_ONE);

    /* fixed to int (truncates) */
    RF_ASSERT_EQ(FIXED16_TO_INT(FIXED16_ONE), 1);
    RF_ASSERT_EQ(FIXED16_TO_INT(FIXED16_ONE + FIXED16_HALF), 1);  /* 1.5 -> 1 */
    RF_ASSERT_EQ(FIXED16_TO_INT(-FIXED16_ONE), -1);

    RF_TEST_END();
}

RF_TEST(fixed16_multiplication) {
    RF_TEST_BEGIN("fixed16 multiplication");

    fixed16_t one = FIXED16_ONE;
    fixed16_t two = INT_TO_FIXED16(2);
    fixed16_t half = FIXED16_HALF;

    /* 1 * 1 = 1 */
    RF_ASSERT_EQ(fixed16_mul(one, one), one);

    /* 2 * 2 = 4 */
    RF_ASSERT_EQ(fixed16_mul(two, two), INT_TO_FIXED16(4));

    /* 2 * 0.5 = 1 */
    RF_ASSERT_EQ(fixed16_mul(two, half), one);

    /* 0.5 * 0.5 = 0.25 */
    fixed16_t quarter = FIXED16_ONE / 4;
    RF_ASSERT_EQ(fixed16_mul(half, half), quarter);

    RF_TEST_END();
}

RF_TEST(fixed16_division) {
    RF_TEST_BEGIN("fixed16 division");

    fixed16_t one = FIXED16_ONE;
    fixed16_t two = INT_TO_FIXED16(2);
    fixed16_t four = INT_TO_FIXED16(4);

    /* 1 / 1 = 1 */
    RF_ASSERT_EQ(fixed16_div(one, one), one);

    /* 4 / 2 = 2 */
    RF_ASSERT_EQ(fixed16_div(four, two), two);

    /* 1 / 2 = 0.5 */
    RF_ASSERT_EQ(fixed16_div(one, two), FIXED16_HALF);

    /* 1 / 4 = 0.25 */
    RF_ASSERT_EQ(fixed16_div(one, four), FIXED16_ONE / 4);

    RF_TEST_END();
}

RF_TEST(fixed16_lerp) {
    RF_TEST_BEGIN("fixed16 linear interpolation");

    fixed16_t a = INT_TO_FIXED16(0);
    fixed16_t b = INT_TO_FIXED16(100);

    /* lerp(0, 100, 0) = 0 */
    RF_ASSERT_EQ(fixed16_lerp(a, b, 0), a);

    /* lerp(0, 100, 1) = 100 */
    RF_ASSERT_EQ(fixed16_lerp(a, b, FIXED16_ONE), b);

    /* lerp(0, 100, 0.5) = 50 */
    RF_ASSERT_EQ(fixed16_lerp(a, b, FIXED16_HALF), INT_TO_FIXED16(50));

    RF_TEST_END();
}

/* ==========================================================================
   Vector Operations
   ========================================================================== */

RF_TEST(vec2_basic_ops) {
    RF_TEST_BEGIN("vec2 basic operations");

    vec2_t a = { INT_TO_FIXED16(3), INT_TO_FIXED16(4) };
    vec2_t b = { INT_TO_FIXED16(1), INT_TO_FIXED16(2) };

    /* addition */
    vec2_t sum = vec2_add(a, b);
    RF_ASSERT_EQ(sum.x, INT_TO_FIXED16(4));
    RF_ASSERT_EQ(sum.y, INT_TO_FIXED16(6));

    /* subtraction */
    vec2_t diff = vec2_sub(a, b);
    RF_ASSERT_EQ(diff.x, INT_TO_FIXED16(2));
    RF_ASSERT_EQ(diff.y, INT_TO_FIXED16(2));

    /* scale */
    vec2_t scaled = vec2_scale(a, INT_TO_FIXED16(2));
    RF_ASSERT_EQ(scaled.x, INT_TO_FIXED16(6));
    RF_ASSERT_EQ(scaled.y, INT_TO_FIXED16(8));

    RF_TEST_END();
}

RF_TEST(vec2_dot_product) {
    RF_TEST_BEGIN("vec2 dot product");

    vec2_t a = { INT_TO_FIXED16(3), INT_TO_FIXED16(4) };
    vec2_t b = { INT_TO_FIXED16(2), INT_TO_FIXED16(1) };

    /* (3,4) . (2,1) = 6 + 4 = 10 */
    fixed16_t dot = vec2_dot(a, b);
    RF_ASSERT_EQ(dot, INT_TO_FIXED16(10));

    RF_TEST_END();
}

RF_TEST(vec3_cross_product) {
    RF_TEST_BEGIN("vec3 cross product");

    vec3_t x = { FIXED16_ONE, 0, 0 };
    vec3_t y = { 0, FIXED16_ONE, 0 };

    /* x cross y = z */
    vec3_t z = vec3_cross(x, y);
    RF_ASSERT_EQ(z.x, 0);
    RF_ASSERT_EQ(z.y, 0);
    RF_ASSERT_EQ(z.z, FIXED16_ONE);

    /* y cross x = -z */
    vec3_t neg_z = vec3_cross(y, x);
    RF_ASSERT_EQ(neg_z.x, 0);
    RF_ASSERT_EQ(neg_z.y, 0);
    RF_ASSERT_EQ(neg_z.z, -FIXED16_ONE);

    RF_TEST_END();
}

/* ==========================================================================
   Trigonometry
   ========================================================================== */

RF_TEST(trig_sin_basic) {
    RF_TEST_BEGIN("sine basic values");

    /* sin(0) = 0 */
    RF_ASSERT_EQ(rf_sin(ANGLE_0), 0);

    /* sin(90) = 1 (4096 in fixed12) */
    /* Allow small tolerance due to table approximation */
    RF_ASSERT_FIXED_NEAR(rf_sin(ANGLE_90), FIXED12_ONE, 10);

    /* sin(180) = 0 */
    RF_ASSERT_FIXED_NEAR(rf_sin(ANGLE_180), 0, 10);

    /* sin(270) = -1 */
    RF_ASSERT_FIXED_NEAR(rf_sin(ANGLE_270), -FIXED12_ONE, 10);

    RF_TEST_END();
}

RF_TEST(trig_cos_basic) {
    RF_TEST_BEGIN("cosine basic values");

    /* cos(0) = 1 */
    RF_ASSERT_FIXED_NEAR(rf_cos(ANGLE_0), FIXED12_ONE, 10);

    /* cos(90) = 0 */
    RF_ASSERT_FIXED_NEAR(rf_cos(ANGLE_90), 0, 10);

    /* cos(180) = -1 */
    RF_ASSERT_FIXED_NEAR(rf_cos(ANGLE_180), -FIXED12_ONE, 10);

    /* cos(270) = 0 */
    RF_ASSERT_FIXED_NEAR(rf_cos(ANGLE_270), 0, 10);

    RF_TEST_END();
}

/* ==========================================================================
   Square Root
   ========================================================================== */

RF_TEST(sqrt_integer) {
    RF_TEST_BEGIN("integer square root");

    RF_ASSERT_EQ(rf_sqrt(0), 0);
    RF_ASSERT_EQ(rf_sqrt(1), 1);
    RF_ASSERT_EQ(rf_sqrt(4), 2);
    RF_ASSERT_EQ(rf_sqrt(9), 3);
    RF_ASSERT_EQ(rf_sqrt(16), 4);
    RF_ASSERT_EQ(rf_sqrt(100), 10);
    RF_ASSERT_EQ(rf_sqrt(10000), 100);

    /* Non-perfect squares (truncated) */
    RF_ASSERT_EQ(rf_sqrt(2), 1);
    RF_ASSERT_EQ(rf_sqrt(8), 2);  /* sqrt(8) = 2.83, truncates to 2 */

    RF_TEST_END();
}

RF_TEST(sqrt_fixed16) {
    RF_TEST_BEGIN("fixed16 square root");

    /* sqrt(1.0) = 1.0 */
    RF_ASSERT_FIXED_NEAR(fixed16_sqrt(FIXED16_ONE), FIXED16_ONE, 100);

    /* sqrt(4.0) = 2.0 */
    RF_ASSERT_FIXED_NEAR(fixed16_sqrt(INT_TO_FIXED16(4)), INT_TO_FIXED16(2), 100);

    /* sqrt(0.25) = 0.5 */
    fixed16_t quarter = FIXED16_ONE / 4;
    RF_ASSERT_FIXED_NEAR(fixed16_sqrt(quarter), FIXED16_HALF, 100);

    RF_TEST_END();
}

RF_TEST(vec2_length_test) {
    RF_TEST_BEGIN("vec2 length");

    /* 3-4-5 triangle */
    vec2_t v = { INT_TO_FIXED16(3), INT_TO_FIXED16(4) };
    fixed16_t len = vec2_length(v);
    RF_ASSERT_FIXED_NEAR(len, INT_TO_FIXED16(5), 100);

    RF_TEST_END();
}
