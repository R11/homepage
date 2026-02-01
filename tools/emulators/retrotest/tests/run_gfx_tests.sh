#!/bin/bash
#
# Graphics Test Runner
#
# Runs graphics tests across platforms and compares frame hashes.
# Can generate baseline hashes or verify against existing baselines.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$ROOT_DIR/build"
TESTROM_DIR="$ROOT_DIR/testrom"
GFX_TEST_DIR="$BUILD_DIR/gfx_tests"

CLI="$BUILD_DIR/retrotest"
GFX_CORE="$BUILD_DIR/gfx_mock_core_libretro.so"

# Test configuration
TESTS="primitives lines triangles clipping stress all"
FRAMES=5  # Run a few frames to ensure stable render

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [options] [command]"
    echo ""
    echo "Commands:"
    echo "  run       Run tests and display hashes (default)"
    echo "  baseline  Generate baseline hashes"
    echo "  verify    Verify against baseline hashes"
    echo "  compare   Compare hashes across platforms"
    echo ""
    echo "Options:"
    echo "  -p PLATFORM   Test specific platform (gfx_mock, genesis, saturn, n64, snes, dc)"
    echo "  -t TEST       Run specific test (primitives, lines, triangles, clipping, stress, all)"
    echo "  -v            Verbose output"
    echo "  -h            Show this help"
    echo ""
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $*"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

# Generate test ROMs if needed
generate_test_roms() {
    if [ ! -d "$GFX_TEST_DIR" ] || [ ! -f "$GFX_TEST_DIR/gfx_primitives.gfx" ]; then
        log_info "Generating graphics test ROMs..."
        mkdir -p "$GFX_TEST_DIR"
        python3 "$TESTROM_DIR/gen_gfx_tests.py" "$GFX_TEST_DIR"
    fi
}

# Build graphics mock core if needed
build_gfx_core() {
    if [ ! -f "$GFX_CORE" ]; then
        log_info "Building graphics mock core..."
        make -C "$ROOT_DIR" "$GFX_CORE"
    fi
}

# Get hash for a specific test
get_hash() {
    local core="$1"
    local rom="$2"
    local frames="${3:-$FRAMES}"

    "$CLI" -c "$core" -r "$rom" -f "$frames" -H 2>/dev/null | grep "frame_hash:" | awk '{print $2}'
}

# Run single test
run_test() {
    local platform="$1"
    local test_name="$2"
    local core="$3"
    local rom="$GFX_TEST_DIR/gfx_${test_name}.gfx"

    if [ ! -f "$rom" ]; then
        log_warn "Test ROM not found: $rom"
        return 1
    fi

    if [ ! -f "$core" ]; then
        log_warn "Core not found: $core"
        return 1
    fi

    local hash
    hash=$(get_hash "$core" "$rom")

    if [ -n "$hash" ]; then
        printf "  %-12s %-15s %s\n" "$platform" "$test_name" "$hash"
        echo "$hash"
    else
        log_fail "Failed to get hash for $platform/$test_name"
        return 1
    fi
}

# Run all tests for a platform
run_platform_tests() {
    local platform="$1"
    local core="$2"

    echo ""
    echo "=== $platform ==="

    local pass_count=0
    local fail_count=0

    for test in $TESTS; do
        if run_test "$platform" "$test" "$core" > /dev/null 2>&1; then
            hash=$(get_hash "$core" "$GFX_TEST_DIR/gfx_${test}.gfx")
            printf "  %-15s %s\n" "$test" "$hash"
            pass_count=$((pass_count + 1))
        else
            printf "  %-15s %s\n" "$test" "FAILED"
            fail_count=$((fail_count + 1))
        fi
    done

    echo "  ---"
    echo "  Passed: $pass_count, Failed: $fail_count"
}

# Main run command
cmd_run() {
    log_info "Running graphics tests..."
    generate_test_roms
    build_gfx_core

    echo ""
    echo "Graphics Test Results"
    echo "====================="

    # GFX Mock Core (reference platform)
    run_platform_tests "gfx_mock" "$GFX_CORE"

    # Platform-specific cores (if available)
    local platforms="genesis saturn n64 snes dc"
    for p in $platforms; do
        local core="$BUILD_DIR/${p}_mock_core_libretro.so"
        if [ -f "$core" ]; then
            # For now, use the gfx mock core since platform cores
            # don't interpret graphics commands yet
            : # run_platform_tests "$p" "$core"
        fi
    done

    echo ""
    log_info "Graphics tests completed."
}

# Generate baseline hashes
cmd_baseline() {
    log_info "Generating baseline hashes..."
    generate_test_roms
    build_gfx_core

    local baseline_file="$SCRIPT_DIR/gfx_baseline.txt"

    echo "# Graphics Test Baseline Hashes" > "$baseline_file"
    echo "# Generated: $(date -Iseconds)" >> "$baseline_file"
    echo "# Platform: gfx_mock (320x240 RGB565)" >> "$baseline_file"
    echo "" >> "$baseline_file"

    for test in $TESTS; do
        local hash
        hash=$(get_hash "$GFX_CORE" "$GFX_TEST_DIR/gfx_${test}.gfx")
        echo "gfx_mock:$test:$hash" >> "$baseline_file"
        echo "  $test: $hash"
    done

    echo ""
    log_info "Baseline saved to: $baseline_file"
}

# Verify against baseline
cmd_verify() {
    local baseline_file="$SCRIPT_DIR/gfx_baseline.txt"

    if [ ! -f "$baseline_file" ]; then
        log_fail "Baseline file not found: $baseline_file"
        log_info "Run '$0 baseline' first to generate it."
        exit 1
    fi

    log_info "Verifying against baseline..."
    generate_test_roms
    build_gfx_core

    local pass_count=0
    local fail_count=0

    echo ""
    echo "Verification Results"
    echo "===================="

    while IFS=: read -r platform test expected_hash; do
        # Skip comments and empty lines
        [[ "$platform" =~ ^#.*$ ]] && continue
        [[ -z "$platform" ]] && continue

        local core="$GFX_CORE"
        local rom="$GFX_TEST_DIR/gfx_${test}.gfx"

        local actual_hash
        actual_hash=$(get_hash "$core" "$rom")

        if [ "$actual_hash" = "$expected_hash" ]; then
            log_pass "$platform/$test"
            pass_count=$((pass_count + 1))
        else
            log_fail "$platform/$test (expected: $expected_hash, got: $actual_hash)"
            fail_count=$((fail_count + 1))
        fi
    done < "$baseline_file"

    echo ""
    echo "Summary: $pass_count passed, $fail_count failed"

    if [ "$fail_count" -gt 0 ]; then
        exit 1
    fi
}

# Compare hashes across platforms
cmd_compare() {
    log_info "Comparing hashes across platforms..."
    generate_test_roms
    build_gfx_core

    echo ""
    echo "Cross-Platform Hash Comparison"
    echo "=============================="
    printf "%-15s" "Test"

    # Header
    local platforms="gfx_mock"
    for p in $platforms; do
        printf "%-20s" "$p"
    done
    echo ""

    # Separator
    printf "%-15s" "----"
    for p in $platforms; do
        printf "%-20s" "----"
    done
    echo ""

    # Data
    for test in $TESTS; do
        printf "%-15s" "$test"
        for p in $platforms; do
            local core="$GFX_CORE"
            local hash
            hash=$(get_hash "$core" "$GFX_TEST_DIR/gfx_${test}.gfx" 2>/dev/null || echo "N/A")
            # Truncate hash for display
            printf "%-20s" "${hash:0:16}"
        done
        echo ""
    done
}

# Parse arguments
PLATFORM=""
TEST_NAME=""
VERBOSE=0
COMMAND="run"

while getopts "p:t:vh" opt; do
    case $opt in
        p) PLATFORM="$OPTARG" ;;
        t) TEST_NAME="$OPTARG" ;;
        v) VERBOSE=1 ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done
shift $((OPTIND - 1))

if [ $# -gt 0 ]; then
    COMMAND="$1"
fi

# Execute command
case "$COMMAND" in
    run)      cmd_run ;;
    baseline) cmd_baseline ;;
    verify)   cmd_verify ;;
    compare)  cmd_compare ;;
    *)
        echo "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac
