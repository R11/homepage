/**
 * RetroForge Test Framework
 *
 * Minimal test framework that works on host and can generate
 * test ROMs for emulator verification.
 */

#ifndef RETROFORGE_TEST_FRAMEWORK_H
#define RETROFORGE_TEST_FRAMEWORK_H

#include <stdio.h>
#include <stdbool.h>
#include <stdint.h>

/* ==========================================================================
   Test Result Tracking
   ========================================================================== */

typedef struct {
    const char* name;
    const char* file;
    int line;
    bool passed;
    const char* message;
} rf_test_result_t;

typedef struct {
    int total;
    int passed;
    int failed;
    int skipped;
} rf_test_stats_t;

/* Global test state */
extern rf_test_stats_t rf_test_stats;
extern rf_test_result_t rf_current_test;

/* ==========================================================================
   Test Macros
   ========================================================================== */

#define RF_TEST(name) \
    void test_##name(void); \
    static void __attribute__((constructor)) register_test_##name(void) { \
        rf_register_test(#name, test_##name); \
    } \
    void test_##name(void)

#define RF_TEST_BEGIN(name) \
    do { \
        rf_current_test.name = name; \
        rf_current_test.file = __FILE__; \
        rf_current_test.line = __LINE__; \
        rf_current_test.passed = true; \
        rf_current_test.message = NULL; \
    } while(0)

#define RF_TEST_END() \
    do { \
        rf_test_stats.total++; \
        if (rf_current_test.passed) { \
            rf_test_stats.passed++; \
            printf("  [PASS] %s\n", rf_current_test.name); \
        } else { \
            rf_test_stats.failed++; \
            printf("  [FAIL] %s (%s:%d)\n", rf_current_test.name, \
                   rf_current_test.file, rf_current_test.line); \
            if (rf_current_test.message) { \
                printf("         %s\n", rf_current_test.message); \
            } \
        } \
    } while(0)

/* ==========================================================================
   Assertion Macros
   ========================================================================== */

#define RF_ASSERT(expr) \
    do { \
        if (!(expr)) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Assertion failed: " #expr; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_EQ(expected, actual) \
    do { \
        if ((expected) != (actual)) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #expected " == " #actual; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_NEQ(a, b) \
    do { \
        if ((a) == (b)) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #a " != " #b; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_LT(a, b) \
    do { \
        if (!((a) < (b))) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #a " < " #b; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_GT(a, b) \
    do { \
        if (!((a) > (b))) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #a " > " #b; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_NULL(ptr) \
    do { \
        if ((ptr) != NULL) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #ptr " to be NULL"; \
            return; \
        } \
    } while(0)

#define RF_ASSERT_NOT_NULL(ptr) \
    do { \
        if ((ptr) == NULL) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Expected " #ptr " to not be NULL"; \
            return; \
        } \
    } while(0)

/* Fixed-point comparison with tolerance */
#define RF_ASSERT_FIXED_NEAR(expected, actual, tolerance) \
    do { \
        int32_t diff = (expected) - (actual); \
        if (diff < 0) diff = -diff; \
        if (diff > (tolerance)) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Fixed-point values not within tolerance"; \
            return; \
        } \
    } while(0)

/* ==========================================================================
   Test Registration and Running
   ========================================================================== */

typedef void (*rf_test_fn)(void);

typedef struct {
    const char* name;
    rf_test_fn  fn;
} rf_test_entry_t;

#define RF_MAX_TESTS 256

extern rf_test_entry_t rf_test_registry[RF_MAX_TESTS];
extern int rf_test_count;

void rf_register_test(const char* name, rf_test_fn fn);
void rf_run_all_tests(void);
void rf_print_summary(void);

/* ==========================================================================
   Performance Measurement
   ========================================================================== */

typedef struct {
    uint64_t start_cycles;
    uint64_t end_cycles;
    uint64_t elapsed_cycles;
} rf_perf_timer_t;

void rf_perf_start(rf_perf_timer_t* timer);
void rf_perf_stop(rf_perf_timer_t* timer);

#define RF_ASSERT_CYCLES_LT(timer, max_cycles) \
    do { \
        if ((timer).elapsed_cycles >= (max_cycles)) { \
            rf_current_test.passed = false; \
            rf_current_test.line = __LINE__; \
            rf_current_test.message = "Exceeded cycle budget"; \
            return; \
        } \
    } while(0)

#endif /* RETROFORGE_TEST_FRAMEWORK_H */
