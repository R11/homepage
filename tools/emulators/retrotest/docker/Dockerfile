# RetroTest Docker Image
#
# Provides a reproducible environment for running libretro-based tests.
# Includes real cores (Saturn, N64, Genesis) plus mock cores for fallback.
#
# Build:
#   docker build -t retrotest -f docker/Dockerfile .
#
# Run with real Saturn core:
#   docker run --rm -v $(pwd)/roms:/roms retrotest \
#     retrotest -c /cores/mednafen_saturn_libretro.so -r /roms/game.cue -f 300 -H
#
# Run with mock core (no real ROM needed):
#   docker run --rm retrotest \
#     retrotest -c /cores/saturn_mock_core_libretro.so -r /testrom/saturn_test.cue -f 60 -H
#
# Interactive:
#   docker run -it --rm -v $(pwd):/workspace retrotest bash

FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    unzip \
    pkg-config \
    python3 \
    libpng-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Build retrotest and mock cores
WORKDIR /build/retrotest
COPY . .
RUN make clean && make all
RUN make build/mock_core_libretro.so build/saturn_mock_core_libretro.so
RUN make testrom/hello.md testrom/saturn_test.cue

# =============================================================================
# Runtime image
# =============================================================================

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    libpng16-16 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Copy retrotest binary and libraries
COPY --from=builder /build/retrotest/build/retrotest /usr/local/bin/
COPY --from=builder /build/retrotest/build/libretrotest.so /usr/local/lib/

# Copy mock cores (always available, no network needed)
COPY --from=builder /build/retrotest/build/mock_core_libretro.so /cores/
COPY --from=builder /build/retrotest/build/saturn_mock_core_libretro.so /cores/

# Copy test ROMs/discs
COPY --from=builder /build/retrotest/testrom/hello.md /testrom/
COPY --from=builder /build/retrotest/testrom/saturn_test.bin /testrom/
COPY --from=builder /build/retrotest/testrom/saturn_test.cue /testrom/

# Create directories
RUN mkdir -p /roms /workspace

# Download real libretro cores
# Note: || true allows build to succeed even if downloads fail
WORKDIR /cores

# Saturn (Mednafen/Beetle) - High accuracy
RUN curl -L --fail -o beetle_saturn.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/mednafen_saturn_libretro.so.zip" \
    && unzip beetle_saturn.zip && rm beetle_saturn.zip \
    && echo "Downloaded mednafen_saturn_libretro.so" \
    || echo "Warning: Could not download Saturn core, using mock"

# Genesis/Mega Drive (Genesis Plus GX) - High accuracy
RUN curl -L --fail -o genesis_plus.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/genesis_plus_gx_libretro.so.zip" \
    && unzip genesis_plus.zip && rm genesis_plus.zip \
    && echo "Downloaded genesis_plus_gx_libretro.so" \
    || echo "Warning: Could not download Genesis core, using mock"

# N64 (Mupen64Plus-Next)
RUN curl -L --fail -o mupen64plus.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/mupen64plus_next_libretro.so.zip" \
    && unzip mupen64plus.zip && rm mupen64plus.zip \
    && echo "Downloaded mupen64plus_next_libretro.so" \
    || echo "Warning: Could not download N64 core"

# N64 (ParaLLEl - more accurate RDP)
RUN curl -L --fail -o parallel_n64.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/parallel_n64_libretro.so.zip" \
    && unzip parallel_n64.zip && rm parallel_n64.zip \
    && echo "Downloaded parallel_n64_libretro.so" \
    || echo "Warning: Could not download ParaLLEl N64 core"

# Update library cache
RUN ldconfig

# List available cores
RUN echo "=== Available cores ===" && ls -la /cores/

WORKDIR /workspace

# Default: run self-test with mock cores
CMD ["sh", "-c", "echo 'Testing mock cores...' && \
     retrotest -c /cores/mock_core_libretro.so -r /testrom/hello.md -f 60 -H && \
     retrotest -c /cores/saturn_mock_core_libretro.so -r /testrom/saturn_test.cue -f 60 -H && \
     echo 'All tests passed!'"]

# =============================================================================
# Usage examples (as labels for documentation)
# =============================================================================

LABEL org.opencontainers.image.title="RetroTest"
LABEL org.opencontainers.image.description="Headless libretro frontend for automated testing"
LABEL usage.saturn.real="docker run --rm -v \$(pwd):/roms retrotest retrotest -c /cores/mednafen_saturn_libretro.so -r /roms/game.cue -f 300 -H"
LABEL usage.saturn.mock="docker run --rm retrotest retrotest -c /cores/saturn_mock_core_libretro.so -r /testrom/saturn_test.cue -f 60 -H"
LABEL usage.genesis.real="docker run --rm -v \$(pwd):/roms retrotest retrotest -c /cores/genesis_plus_gx_libretro.so -r /roms/game.md -f 300 -H"
LABEL usage.genesis.mock="docker run --rm retrotest retrotest -c /cores/mock_core_libretro.so -r /testrom/hello.md -f 60 -H"
