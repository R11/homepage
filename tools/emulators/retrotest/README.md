# RetroTest

A minimal, headless libretro frontend designed for automated testing of retro game engines and libraries.

## Features

- **Headless execution** - No display required, runs in CI
- **Frame capture** - Hash frames for regression testing
- **Memory inspection** - Read/write/compare emulated memory
- **Input scripting** - Reproducible input sequences
- **State save/load** - Start tests from known states
- **Docker support** - Pre-built images with cores included

## Building

```bash
cd tools/emulators/retrotest
make all
```

This produces:
- `build/retrotest` - CLI tool
- `build/libretrotest.so` - Shared library for custom test programs
- `build/libretrotest.a` - Static library

## Quick Start

```bash
# Run 300 frames and print frame hash
./build/retrotest -c /path/to/core.so -r /path/to/game.rom -f 300 -H

# Verify frame hash matches expected
./build/retrotest -c core.so -r game.rom -f 300 -h abc123def456789

# Dump system RAM after 100 frames
./build/retrotest -c core.so -r game.rom -f 100 -m 2 ram.bin
```

## Docker

Build the Docker image with pre-installed cores:

```bash
make docker-build
# or
docker build -t retrotest -f docker/Dockerfile .
```

Run tests:

```bash
# Saturn test
docker run --rm -v $(pwd)/roms:/roms retrotest \
  retrotest -c /cores/mednafen_saturn_libretro.so -r /roms/game.cue -f 300 -H

# N64 test
docker run --rm -v $(pwd)/roms:/roms retrotest \
  retrotest -c /cores/mupen64plus_next_libretro.so -r /roms/game.z64 -f 300 -H
```

## CLI Options

```
Usage: retrotest --core <core.so> --rom <game.rom> [options]

Required:
  -c, --core FILE       Path to libretro core (.so)
  -r, --rom FILE        Path to ROM/game file

Execution:
  -f, --frames N        Run for N frames (default: 60)
  -s, --state FILE      Load state before running
  -S, --save-state FILE Save state after running
  -R, --reset           Reset before running

Output:
  -d, --dump-frame FILE Save final frame (raw XRGB8888)
  -m, --dump-mem T FILE Dump memory (T=0:save,1:rtc,2:sys,3:vram)
  -H, --frame-hash      Print frame hash after running

Verification:
  -h, --check-hash HASH Verify frame hash matches (hex)

Input:
  -i, --input FILE      Load input script (one line per frame)

Other:
  -v, --verbose         Enable debug logging
```

## Library API

For more control, use the C library directly:

```c
#include "retrotest.h"

int main() {
    retrotest_ctx_t* ctx = retrotest_create();

    retrotest_load_core(ctx, "core.so");
    retrotest_load_game(ctx, "game.rom");

    // Run 60 frames
    for (int i = 0; i < 60; i++) {
        retrotest_run_frame(ctx);
    }

    // Check memory
    uint16_t score = retrotest_read_u16(ctx, RETRO_MEMORY_SYSTEM_RAM, 0x1234);

    // Compare frame
    uint64_t hash = retrotest_frame_hash(ctx);

    retrotest_destroy(ctx);
    return 0;
}
```

## Input Scripts

Create reproducible test runs with input scripts:

```
# input.txt - one line per frame
# Empty lines = no input

start
a
right,a
right
right,b

left,left,a
```

Run with:
```bash
./retrotest -c core.so -r game.rom -i input.txt -f 100 -H
```

## Pre-installed Cores (Docker)

| Core | Platform | Path |
|------|----------|------|
| Beetle Saturn | Sega Saturn | `/cores/mednafen_saturn_libretro.so` |
| Mupen64Plus-Next | Nintendo 64 | `/cores/mupen64plus_next_libretro.so` |
| ParaLLEl N64 | Nintendo 64 | `/cores/parallel_n64_libretro.so` |
| Genesis Plus GX | Genesis/MD | `/cores/genesis_plus_gx_libretro.so` |

## Memory Types

| Type | ID | Description |
|------|-----|-------------|
| Save RAM | 0 | Battery-backed save memory |
| RTC | 1 | Real-time clock data |
| System RAM | 2 | Main system memory |
| Video RAM | 3 | Graphics memory |

## CI Integration

See `.github/workflows/retrotest.yml` for GitHub Actions example.

Basic workflow:
1. Build test ROM that exercises your code
2. Run for deterministic frame count
3. Compare frame hash or memory state to expected values

## Contributing

This is part of the [RetroForge](../../docs/PROJECT.md) project.

## References

- [libretro API](https://docs.libretro.com/development/libretro-overview/)
- [libretro.h](https://github.com/libretro/RetroArch/blob/master/libretro-common/include/libretro.h)
- [miniretro](https://github.com/davidgfnet/miniretro) - Similar minimal frontend
