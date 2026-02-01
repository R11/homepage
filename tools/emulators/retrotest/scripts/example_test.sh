#!/bin/bash
#
# Example test script for RetroTest
#
# This demonstrates how to run automated tests against libretro cores.
# Typically you would:
# 1. Build a test ROM that exercises specific functionality
# 2. Run it for a deterministic number of frames
# 3. Compare the result (frame hash, memory state) to expected values
#
# Usage:
#   ./scripts/example_test.sh <core.so> <test.rom> <expected_hash>

set -e

RETROTEST="${RETROTEST:-./build/retrotest}"
CORE="$1"
ROM="$2"
EXPECTED_HASH="$3"
FRAMES="${4:-300}"

if [ -z "$CORE" ] || [ -z "$ROM" ]; then
    echo "Usage: $0 <core.so> <rom> [expected_hash] [frames]"
    echo ""
    echo "Examples:"
    echo "  # Run and print hash (for discovering expected values)"
    echo "  $0 /cores/genesis_plus_gx_libretro.so test.md"
    echo ""
    echo "  # Verify against expected hash"
    echo "  $0 /cores/genesis_plus_gx_libretro.so test.md abc123def456"
    exit 1
fi

echo "=== RetroTest Example ==="
echo "Core:   $CORE"
echo "ROM:    $ROM"
echo "Frames: $FRAMES"
echo ""

if [ -n "$EXPECTED_HASH" ]; then
    # Verification mode
    echo "Verifying against expected hash: $EXPECTED_HASH"
    $RETROTEST -c "$CORE" -r "$ROM" -f "$FRAMES" -h "$EXPECTED_HASH"
    echo ""
    echo "Test PASSED"
else
    # Discovery mode
    echo "Running to discover hash..."
    $RETROTEST -c "$CORE" -r "$ROM" -f "$FRAMES" -H
fi
