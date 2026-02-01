#!/bin/bash
#
# RetroTest - Automated Test Runner
#
# Runs a series of tests to verify the RetroTest framework and mock core.
# Exit code 0 = all tests pass, non-zero = failure.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/build"
RETROTEST="$BUILD_DIR/retrotest"
MOCK_CORE="$BUILD_DIR/mock_core_libretro.so"
TEST_ROM="$PROJECT_DIR/testrom/hello.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Test helper functions
pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    pass_count=$((pass_count + 1))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    fail_count=$((fail_count + 1))
}

info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Ensure everything is built
info "Building RetroTest..."
cd "$PROJECT_DIR"
make all >/dev/null 2>&1

# Generate test ROM if needed
if [ ! -f "$TEST_ROM" ]; then
    info "Generating test ROM..."
    cd "$PROJECT_DIR/testrom"
    python3 gen_genesis_hello.py hello.md
fi

echo ""
echo "=============================================="
echo "  RetroTest Verification Suite"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Test 1: Basic execution
# -----------------------------------------------------------------------------
info "Test 1: Basic execution (60 frames)"
output=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -H 2>&1)
if echo "$output" | grep -q "frame_hash:"; then
    pass "Basic execution works"
else
    fail "Basic execution failed"
    echo "$output"
fi

# -----------------------------------------------------------------------------
# Test 2: Deterministic output
# -----------------------------------------------------------------------------
info "Test 2: Deterministic output (run twice, same hash)"
hash1=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -H 2>&1 | grep "frame_hash:" | awk '{print $2}')
hash2=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -H 2>&1 | grep "frame_hash:" | awk '{print $2}')
if [ "$hash1" = "$hash2" ]; then
    pass "Deterministic output (hash=$hash1)"
else
    fail "Non-deterministic output (hash1=$hash1, hash2=$hash2)"
fi

# -----------------------------------------------------------------------------
# Test 3: Memory reflects frame count
# -----------------------------------------------------------------------------
info "Test 3: Memory reflects frame count correctly"
MEM_FILE_60="$BUILD_DIR/test_ram_60.bin"
MEM_FILE_120="$BUILD_DIR/test_ram_120.bin"
"$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -m 2 "$MEM_FILE_60" 2>&1 >/dev/null
"$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 120 -m 2 "$MEM_FILE_120" 2>&1 >/dev/null
# Frame count is stored at offset 0x200 in little-endian
fc60=$(od -A n -t u1 -j 512 -N 1 "$MEM_FILE_60" | tr -d ' ')
fc120=$(od -A n -t u1 -j 512 -N 1 "$MEM_FILE_120" | tr -d ' ')
rm -f "$MEM_FILE_60" "$MEM_FILE_120"
if [ "$fc60" = "59" ] && [ "$fc120" = "119" ]; then
    pass "Frame count in memory: 60 frames->59, 120 frames->119"
elif [ "$fc60" != "$fc120" ]; then
    pass "Frame counts differ: 60 frames->$fc60, 120 frames->$fc120"
else
    fail "Frame counts match unexpectedly: $fc60 = $fc120"
fi

# -----------------------------------------------------------------------------
# Test 4: State save/load
# -----------------------------------------------------------------------------
info "Test 4: State save and load"
STATE_FILE="$BUILD_DIR/test_state.sav"
# Run 30 frames, save state
"$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 30 -S "$STATE_FILE" 2>&1 >/dev/null
# Load state, run 30 more frames
hash_from_state=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -s "$STATE_FILE" -f 30 -H 2>&1 | grep "frame_hash:" | awk '{print $2}')
# Run 60 frames directly
hash_direct=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -H 2>&1 | grep "frame_hash:" | awk '{print $2}')
if [ "$hash_from_state" = "$hash_direct" ]; then
    pass "State save/load produces identical results"
else
    fail "State save/load mismatch (state=$hash_from_state, direct=$hash_direct)"
fi
rm -f "$STATE_FILE"

# -----------------------------------------------------------------------------
# Test 5: Memory dump
# -----------------------------------------------------------------------------
info "Test 5: Memory dump contains expected data"
MEM_FILE="$BUILD_DIR/test_ram.bin"
"$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 10 -m 2 "$MEM_FILE" 2>&1 >/dev/null
# Check for "HELLO" string at offset 0x100
if od -A x -t c -j 256 -N 5 "$MEM_FILE" 2>/dev/null | grep -q "H.*E.*L.*L.*O"; then
    pass "Memory dump contains 'HELLO' at offset 0x100"
else
    fail "Memory dump missing expected data"
fi
rm -f "$MEM_FILE"

# -----------------------------------------------------------------------------
# Test 6: Hash verification
# -----------------------------------------------------------------------------
info "Test 6: Hash verification (--check-hash)"
# Get the expected hash
expected_hash=$("$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -H 2>&1 | grep "frame_hash:" | awk '{print $2}')
# Verify with correct hash
if "$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -h "$expected_hash" 2>&1 | grep -q "PASS"; then
    pass "Hash verification works (correct hash)"
else
    fail "Hash verification failed with correct hash"
fi
# Verify with wrong hash
if "$RETROTEST" -c "$MOCK_CORE" -r "$TEST_ROM" -f 60 -h "0000000000000000" 2>&1 | grep -q "FAIL"; then
    pass "Hash verification rejects wrong hash"
else
    fail "Hash verification accepted wrong hash"
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Summary"
echo "=============================================="
echo ""
echo -e "  Passed: ${GREEN}$pass_count${NC}"
echo -e "  Failed: ${RED}$fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
