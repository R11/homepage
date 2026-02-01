/**
 * RetroTest CLI
 *
 * Command-line interface for running automated emulator tests.
 *
 * Usage:
 *   retrotest --core <core.so> --rom <game.rom> [options]
 *
 * Options:
 *   --frames N       Run for N frames (default: 60)
 *   --state FILE     Load state before running
 *   --save-state F   Save state after running
 *   --dump-frame F   Save final frame as raw XRGB
 *   --dump-mem TYPE F  Dump memory region to file
 *   --check-hash H   Verify frame hash matches
 *   --input FILE     Load input script
 *   --verbose        Enable debug logging
 */

#include "../include/retrotest.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <getopt.h>

static void print_usage(const char* prog) {
    printf("RetroTest - Libretro Testing Frontend\n");
    printf("\n");
    printf("Usage: %s --core <core.so> --rom <game.rom> [options]\n", prog);
    printf("\n");
    printf("Required:\n");
    printf("  -c, --core FILE       Path to libretro core (.so)\n");
    printf("  -r, --rom FILE        Path to ROM/game file\n");
    printf("\n");
    printf("Execution:\n");
    printf("  -f, --frames N        Run for N frames (default: 60)\n");
    printf("  -s, --state FILE      Load state before running\n");
    printf("  -S, --save-state FILE Save state after running\n");
    printf("  -R, --reset           Reset before running\n");
    printf("\n");
    printf("Output:\n");
    printf("  -d, --dump-frame FILE Save final frame (raw XRGB8888)\n");
    printf("  -m, --dump-mem T FILE Dump memory (T=0:save,1:rtc,2:sys,3:vram)\n");
    printf("  -H, --frame-hash      Print frame hash after running\n");
    printf("\n");
    printf("Verification:\n");
    printf("  -h, --check-hash HASH Verify frame hash matches (hex)\n");
    printf("  -M, --check-mem T:OFF:HEX  Verify memory contents\n");
    printf("\n");
    printf("Input:\n");
    printf("  -i, --input FILE      Load input script (one line per frame)\n");
    printf("  -b, --button BTN      Press button for first frame\n");
    printf("\n");
    printf("Other:\n");
    printf("  -v, --verbose         Enable debug logging\n");
    printf("  --help                Show this help\n");
    printf("\n");
    printf("Examples:\n");
    printf("  # Run 300 frames and print hash\n");
    printf("  %s -c core.so -r game.rom -f 300 -H\n", prog);
    printf("\n");
    printf("  # Verify frame matches expected hash\n");
    printf("  %s -c core.so -r game.rom -f 60 -h abc123...\n", prog);
    printf("\n");
    printf("  # Dump system RAM after 100 frames\n");
    printf("  %s -c core.so -r game.rom -f 100 -m 2 ram.bin\n", prog);
}

/* Input script format: one line per frame, buttons as comma-separated names */
static bool load_input_script(const char* path, uint16_t** buttons, size_t* count) {
    FILE* f = fopen(path, "r");
    if (!f) return false;

    /* Count lines */
    size_t lines = 0;
    char buf[256];
    while (fgets(buf, sizeof(buf), f)) lines++;
    rewind(f);

    *buttons = calloc(lines, sizeof(uint16_t));
    *count = lines;

    size_t i = 0;
    while (fgets(buf, sizeof(buf), f) && i < lines) {
        uint16_t b = 0;

        if (strstr(buf, "up"))     b |= (1 << RETROTEST_BTN_UP);
        if (strstr(buf, "down"))   b |= (1 << RETROTEST_BTN_DOWN);
        if (strstr(buf, "left"))   b |= (1 << RETROTEST_BTN_LEFT);
        if (strstr(buf, "right"))  b |= (1 << RETROTEST_BTN_RIGHT);
        if (strstr(buf, "a"))      b |= (1 << RETROTEST_BTN_A);
        if (strstr(buf, "b"))      b |= (1 << RETROTEST_BTN_B);
        if (strstr(buf, "x"))      b |= (1 << RETROTEST_BTN_X);
        if (strstr(buf, "y"))      b |= (1 << RETROTEST_BTN_Y);
        if (strstr(buf, "start"))  b |= (1 << RETROTEST_BTN_START);
        if (strstr(buf, "select")) b |= (1 << RETROTEST_BTN_SELECT);
        if (strstr(buf, "l"))      b |= (1 << RETROTEST_BTN_L);
        if (strstr(buf, "r"))      b |= (1 << RETROTEST_BTN_R);

        (*buttons)[i++] = b;
    }

    fclose(f);
    return true;
}

int main(int argc, char* argv[]) {
    const char* core_path = NULL;
    const char* rom_path = NULL;
    const char* state_path = NULL;
    const char* save_state_path = NULL;
    const char* dump_frame_path = NULL;
    const char* input_script_path = NULL;
    const char* check_hash_str = NULL;
    int dump_mem_type = -1;
    const char* dump_mem_path = NULL;
    unsigned frames = 60;
    bool do_reset = false;
    bool print_hash = false;
    bool verbose = false;

    static struct option long_options[] = {
        {"core",        required_argument, 0, 'c'},
        {"rom",         required_argument, 0, 'r'},
        {"frames",      required_argument, 0, 'f'},
        {"state",       required_argument, 0, 's'},
        {"save-state",  required_argument, 0, 'S'},
        {"reset",       no_argument,       0, 'R'},
        {"dump-frame",  required_argument, 0, 'd'},
        {"dump-mem",    required_argument, 0, 'm'},
        {"frame-hash",  no_argument,       0, 'H'},
        {"check-hash",  required_argument, 0, 'h'},
        {"input",       required_argument, 0, 'i'},
        {"verbose",     no_argument,       0, 'v'},
        {"help",        no_argument,       0, '?'},
        {0, 0, 0, 0}
    };

    int opt;
    while ((opt = getopt_long(argc, argv, "c:r:f:s:S:Rd:m:Hh:i:v",
                              long_options, NULL)) != -1) {
        switch (opt) {
            case 'c': core_path = optarg; break;
            case 'r': rom_path = optarg; break;
            case 'f': frames = atoi(optarg); break;
            case 's': state_path = optarg; break;
            case 'S': save_state_path = optarg; break;
            case 'R': do_reset = true; break;
            case 'd': dump_frame_path = optarg; break;
            case 'm':
                /* Format: TYPE FILE */
                dump_mem_type = atoi(optarg);
                if (optind < argc) {
                    dump_mem_path = argv[optind++];
                }
                break;
            case 'H': print_hash = true; break;
            case 'h': check_hash_str = optarg; break;
            case 'i': input_script_path = optarg; break;
            case 'v': verbose = true; break;
            case '?':
            default:
                print_usage(argv[0]);
                return opt == '?' ? 0 : 1;
        }
    }

    if (!core_path || !rom_path) {
        fprintf(stderr, "Error: --core and --rom are required\n\n");
        print_usage(argv[0]);
        return 1;
    }

    /* Set up logging */
    if (verbose) {
        retrotest_set_log_level(RETROTEST_LOG_DEBUG);
    }

    /* Create context */
    retrotest_ctx_t* ctx = retrotest_create();
    if (!ctx) {
        fprintf(stderr, "Failed to create test context\n");
        return 1;
    }

    /* Load core and game */
    if (!retrotest_load_core(ctx, core_path)) {
        fprintf(stderr, "Failed to load core: %s\n", core_path);
        retrotest_destroy(ctx);
        return 1;
    }

    if (!retrotest_load_game(ctx, rom_path)) {
        fprintf(stderr, "Failed to load ROM: %s\n", rom_path);
        retrotest_destroy(ctx);
        return 1;
    }

    /* Load state if specified */
    if (state_path) {
        if (!retrotest_load_state_file(ctx, state_path)) {
            fprintf(stderr, "Failed to load state: %s\n", state_path);
            retrotest_destroy(ctx);
            return 1;
        }
        retrotest_log(RETROTEST_LOG_INFO, "Loaded state: %s", state_path);
    }

    /* Reset if requested */
    if (do_reset) {
        retrotest_reset(ctx);
    }

    /* Load input script */
    uint16_t* input_buttons = NULL;
    size_t input_count = 0;
    if (input_script_path) {
        if (!load_input_script(input_script_path, &input_buttons, &input_count)) {
            fprintf(stderr, "Failed to load input script: %s\n", input_script_path);
        }
    }

    /* Run frames */
    retrotest_log(RETROTEST_LOG_INFO, "Running %u frames...", frames);

    for (unsigned i = 0; i < frames; i++) {
        /* Apply input from script */
        if (input_buttons && i < input_count) {
            retrotest_input_t input = { .buttons = input_buttons[i] };
            retrotest_set_input(ctx, 0, &input);
        } else {
            retrotest_clear_input(ctx);
        }

        retrotest_run_frame(ctx);
    }

    free(input_buttons);

    retrotest_log(RETROTEST_LOG_INFO, "Done.");

    /* Output results */
    int exit_code = 0;

    if (print_hash) {
        uint64_t hash = retrotest_frame_hash(ctx);
        printf("frame_hash: %016llx\n", (unsigned long long)hash);
    }

    if (check_hash_str) {
        uint64_t expected = strtoull(check_hash_str, NULL, 16);
        uint64_t actual = retrotest_frame_hash(ctx);
        if (expected == actual) {
            printf("PASS: Frame hash matches\n");
        } else {
            printf("FAIL: Frame hash mismatch\n");
            printf("  Expected: %016llx\n", (unsigned long long)expected);
            printf("  Actual:   %016llx\n", (unsigned long long)actual);
            exit_code = 1;
        }
    }

    if (dump_frame_path) {
        const retrotest_frame_t* frame = retrotest_get_frame(ctx);
        if (frame && frame->pixels) {
            FILE* f = fopen(dump_frame_path, "wb");
            if (f) {
                /* Write simple header: width, height, then XRGB data */
                uint32_t header[2] = { frame->width, frame->height };
                fwrite(header, sizeof(header), 1, f);
                fwrite(frame->pixels, 4, frame->width * frame->height, f);
                fclose(f);
                retrotest_log(RETROTEST_LOG_INFO, "Saved frame: %s", dump_frame_path);
            }
        }
    }

    if (dump_mem_type >= 0 && dump_mem_path) {
        if (retrotest_mem_dump(ctx, dump_mem_type, dump_mem_path)) {
            retrotest_log(RETROTEST_LOG_INFO, "Dumped memory type %d: %s",
                         dump_mem_type, dump_mem_path);
        } else {
            fprintf(stderr, "Failed to dump memory type %d\n", dump_mem_type);
        }
    }

    if (save_state_path) {
        if (retrotest_save_state_file(ctx, save_state_path)) {
            retrotest_log(RETROTEST_LOG_INFO, "Saved state: %s", save_state_path);
        } else {
            fprintf(stderr, "Failed to save state: %s\n", save_state_path);
        }
    }

    /* Cleanup */
    retrotest_destroy(ctx);

    return exit_code;
}
