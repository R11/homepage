# RetroTest Docker Image
#
# Provides a reproducible environment for running libretro-based tests.
# Includes pre-built cores for Saturn and N64.
#
# Build:
#   docker build -t retrotest -f docker/Dockerfile .
#
# Run tests:
#   docker run --rm -v $(pwd)/roms:/roms retrotest \
#     retrotest -c /cores/mednafen_saturn_libretro.so -r /roms/test.iso -f 300 -H
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
    libpng-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Build retrotest
WORKDIR /build/retrotest
COPY . .
RUN make clean && make all

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

# Copy retrotest binary
COPY --from=builder /build/retrotest/build/retrotest /usr/local/bin/
COPY --from=builder /build/retrotest/build/libretrotest.so /usr/local/lib/

# Create cores directory
RUN mkdir -p /cores /roms /workspace

# Download libretro cores
# Note: These are nightly builds - pin to specific versions for reproducibility
WORKDIR /cores

# Saturn (Mednafen/Beetle)
RUN curl -L -o beetle_saturn.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/mednafen_saturn_libretro.so.zip" \
    && unzip beetle_saturn.zip && rm beetle_saturn.zip || true

# N64 (Mupen64Plus-Next)
RUN curl -L -o mupen64plus.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/mupen64plus_next_libretro.so.zip" \
    && unzip mupen64plus.zip && rm mupen64plus.zip || true

# N64 (ParaLLEl - more accurate RDP)
RUN curl -L -o parallel_n64.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/parallel_n64_libretro.so.zip" \
    && unzip parallel_n64.zip && rm parallel_n64.zip || true

# Genesis/Mega Drive (for additional testing)
RUN curl -L -o genesis_plus.zip \
    "https://buildbot.libretro.com/nightly/linux/x86_64/latest/genesis_plus_gx_libretro.so.zip" \
    && unzip genesis_plus.zip && rm genesis_plus.zip || true

# Update library cache
RUN ldconfig

WORKDIR /workspace

# Default command
CMD ["retrotest", "--help"]

# =============================================================================
# Usage examples (as labels for documentation)
# =============================================================================

LABEL org.opencontainers.image.title="RetroTest"
LABEL org.opencontainers.image.description="Headless libretro frontend for automated testing"
LABEL usage.saturn="docker run --rm -v \$(pwd):/roms retrotest retrotest -c /cores/mednafen_saturn_libretro.so -r /roms/game.cue -f 300 -H"
LABEL usage.n64="docker run --rm -v \$(pwd):/roms retrotest retrotest -c /cores/mupen64plus_next_libretro.so -r /roms/game.z64 -f 300 -H"
