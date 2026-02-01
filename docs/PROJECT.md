# RetroForge

AI-assisted game development framework for retro gaming platforms.

## Vision

Create a self-improving ecosystem of AI agents that specialize in retro console development. Each agent deeply understands its target platform's architecture and can write, test, and iterate on code for that platform.

## Architecture

### Agents

```
agents/
├── core/
│   ├── orchestrator.md    # Coordinates all agents
│   ├── testing.md         # TDD specialist
│   └── emulator.md        # Emulator development & verification
└── platform/
    ├── saturn.md          # Sega Saturn specialist
    └── n64.md             # Nintendo 64 specialist
```

### Library

```
lib/
├── core/                  # Cross-platform code
│   ├── types/             # Common types, fixed-point
│   ├── math/              # Vector, matrix, trig
│   └── memory/            # Allocators, DMA
└── platform/              # Platform-specific implementations
    ├── saturn/
    └── n64/
```

### Workflow

1. **Testing Agent** writes tests that define expected behavior
2. **Platform Specialist** implements code to pass the tests
3. **Emulator Agent** runs tests on emulators, captures results
4. **Orchestrator** analyzes results, iterates until passing
5. Repeat, gradually building up functionality

## Getting Started

### Prerequisites

For host development (testing, iteration):
- GCC or Clang
- Make

For Saturn development:
- SH-2 cross-compiler (sh-elf-gcc)
- Jo Engine or similar SDK
- Mednafen or Kronos emulator

For N64 development:
- MIPS64 cross-compiler (mips64-elf-gcc)
- Libdragon SDK
- Ares or parallel-n64 emulator

### Build & Test

```bash
# Build and run tests on host
make test

# Clean build
make clean
```

## Roadmap

### Phase 1: Foundation
- [x] Project structure
- [x] Agent definitions
- [x] Cross-platform types
- [x] Fixed-point math
- [x] Basic test framework
- [ ] Memory allocators
- [ ] Matrix operations

### Phase 2: Graphics Primitives
- [ ] 2D sprite system
- [ ] Tile/background rendering
- [ ] Basic 3D geometry pipeline
- [ ] Platform-specific renderers

### Phase 3: Audio
- [ ] Audio streaming
- [ ] Sound effects
- [ ] Music playback
- [ ] Platform audio drivers

### Phase 4: Engine
- [ ] Game loop
- [ ] Input handling
- [ ] Asset loading
- [ ] Scene management

### Phase 5: Tools
- [ ] Asset converters
- [ ] Build automation
- [ ] Emulator integration
- [ ] Performance profiling

## Design Principles

1. **TDD First**: Write tests before implementation
2. **Hardware Accuracy**: Match real hardware behavior
3. **Gradual Replacement**: Use existing tools, replace with native code over time
4. **Cross-Platform Core**: Share code where it makes sense
5. **Platform Embrace**: Leverage each platform's strengths, don't fight them

## Contributing

This project is designed to be developed with AI assistance. The agents in `agents/` directory define how AI should approach each aspect of development.

## License

TBD
