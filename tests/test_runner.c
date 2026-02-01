/**
 * RetroForge Test Runner
 *
 * Main entry point for running all tests on the host platform.
 */

#include "test_framework.h"
#include <stdio.h>
#include <string.h>
#include <time.h>

/* ==========================================================================
   Global Test State
   ========================================================================== */

rf_test_stats_t rf_test_stats = { 0 };
rf_test_result_t rf_current_test = { 0 };
rf_test_entry_t rf_test_registry[RF_MAX_TESTS] = { 0 };
int rf_test_count = 0;

/* ==========================================================================
   Test Registration
   ========================================================================== */

void rf_register_test(const char* name, rf_test_fn fn) {
    if (rf_test_count < RF_MAX_TESTS) {
        rf_test_registry[rf_test_count].name = name;
        rf_test_registry[rf_test_count].fn = fn;
        rf_test_count++;
    }
}

/* ==========================================================================
   Test Execution
   ========================================================================== */

void rf_run_all_tests(void) {
    printf("\n");
    printf("========================================\n");
    printf("  RetroForge Test Suite\n");
    printf("========================================\n\n");

    for (int i = 0; i < rf_test_count; i++) {
        rf_test_registry[i].fn();
    }
}

void rf_print_summary(void) {
    printf("\n");
    printf("========================================\n");
    printf("  Results\n");
    printf("========================================\n");
    printf("  Total:   %d\n", rf_test_stats.total);
    printf("  Passed:  %d\n", rf_test_stats.passed);
    printf("  Failed:  %d\n", rf_test_stats.failed);
    printf("  Skipped: %d\n", rf_test_stats.skipped);
    printf("========================================\n");

    if (rf_test_stats.failed == 0) {
        printf("  All tests passed!\n");
    } else {
        printf("  FAILURES DETECTED\n");
    }
    printf("========================================\n\n");
}

/* ==========================================================================
   Performance Measurement (Host Implementation)
   ========================================================================== */

void rf_perf_start(rf_perf_timer_t* timer) {
    /* On host, use clock() for basic timing */
    timer->start_cycles = (uint64_t)clock();
}

void rf_perf_stop(rf_perf_timer_t* timer) {
    timer->end_cycles = (uint64_t)clock();
    timer->elapsed_cycles = timer->end_cycles - timer->start_cycles;
}

/* ==========================================================================
   Main Entry Point
   ========================================================================== */

int main(int argc, char* argv[]) {
    (void)argc;
    (void)argv;

    rf_run_all_tests();
    rf_print_summary();

    return rf_test_stats.failed > 0 ? 1 : 0;
}
