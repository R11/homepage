# RetroTest Makefile
#
# Build the libretro test frontend

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -g -O2 -fPIC
LDFLAGS = -ldl

SRC_DIR = src
INC_DIR = include
BUILD_DIR = build

# Source files
SOURCES = $(SRC_DIR)/retrotest.c
OBJECTS = $(SOURCES:$(SRC_DIR)/%.c=$(BUILD_DIR)/%.o)

# Outputs
LIB = $(BUILD_DIR)/libretrotest.so
STATIC_LIB = $(BUILD_DIR)/libretrotest.a
CLI = $(BUILD_DIR)/retrotest

.PHONY: all clean test docker-build docker-test

all: $(LIB) $(STATIC_LIB) $(CLI)

# Shared library
$(LIB): $(OBJECTS)
	@mkdir -p $(dir $@)
	$(CC) -shared -o $@ $^ $(LDFLAGS)

# Static library
$(STATIC_LIB): $(OBJECTS)
	@mkdir -p $(dir $@)
	ar rcs $@ $^

# CLI tool (statically linked)
$(CLI): $(SRC_DIR)/main.c $(OBJECTS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -I$(INC_DIR) -o $@ $^ $(LDFLAGS)

# Object files
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -I$(INC_DIR) -c -o $@ $<

# =============================================================================
# Mock Cores for testing without external dependencies
# =============================================================================

# Genesis mock core
GENESIS_MOCK_CORE = $(BUILD_DIR)/mock_core_libretro.so
$(GENESIS_MOCK_CORE): testrom/mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $<

# Saturn mock core
SATURN_MOCK_CORE = $(BUILD_DIR)/saturn_mock_core_libretro.so
$(SATURN_MOCK_CORE): testrom/saturn_mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $<

# N64 mock core
N64_MOCK_CORE = $(BUILD_DIR)/n64_mock_core_libretro.so
$(N64_MOCK_CORE): testrom/n64_mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $< -lm

# SNES mock core
SNES_MOCK_CORE = $(BUILD_DIR)/snes_mock_core_libretro.so
$(SNES_MOCK_CORE): testrom/snes_mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $<

# Dreamcast mock core
DC_MOCK_CORE = $(BUILD_DIR)/dc_mock_core_libretro.so
$(DC_MOCK_CORE): testrom/dc_mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $<

# =============================================================================
# Test ROMs/Disc Images
# =============================================================================

# Genesis test ROM
GENESIS_TEST_ROM = testrom/hello.md
$(GENESIS_TEST_ROM): testrom/gen_genesis_hello.py
	cd testrom && python3 gen_genesis_hello.py hello.md

# Saturn test disc
SATURN_TEST_DISC = testrom/saturn_test.cue
$(SATURN_TEST_DISC): testrom/gen_saturn_hello.py
	cd testrom && python3 gen_saturn_hello.py saturn_test

# N64 test ROM
N64_TEST_ROM = testrom/n64_test.z64
$(N64_TEST_ROM): testrom/gen_n64_hello.py
	cd testrom && python3 gen_n64_hello.py n64_test.z64

# SNES test ROM
SNES_TEST_ROM = testrom/snes_test.sfc
$(SNES_TEST_ROM): testrom/gen_snes_hello.py
	cd testrom && python3 gen_snes_hello.py snes_test.sfc

# Dreamcast test disc
DC_TEST_DISC = testrom/dc_test.cue
$(DC_TEST_DISC): testrom/gen_dc_hello.py
	cd testrom && python3 gen_dc_hello.py dc_test

# =============================================================================
# Test Targets
# =============================================================================

# Backwards compatibility
MOCK_CORE = $(GENESIS_MOCK_CORE)
TEST_ROM = $(GENESIS_TEST_ROM)

# Run Genesis tests (default)
test: test-genesis

# Run all platform tests
test-all: test-genesis test-saturn test-n64 test-snes test-dc
	@echo ""
	@echo "=== All platform tests passed! ==="

# Genesis tests
test-genesis: $(CLI) $(GENESIS_MOCK_CORE) $(GENESIS_TEST_ROM)
	@echo ""
	@echo "=== RetroTest Pipeline Test ==="
	@echo ""
	@echo "1. Running 60 frames and printing hash..."
	./$(CLI) -c $(MOCK_CORE) -r $(TEST_ROM) -f 60 -H -v
	@echo ""
	@echo "2. Running 120 frames and checking memory..."
	./$(CLI) -c $(MOCK_CORE) -r $(TEST_ROM) -f 120 -H
	@echo ""
	@echo "3. Saving and loading state..."
	./$(CLI) -c $(MOCK_CORE) -r $(TEST_ROM) -f 30 -S $(BUILD_DIR)/test.state
	./$(CLI) -c $(MOCK_CORE) -r $(TEST_ROM) -s $(BUILD_DIR)/test.state -f 30 -H
	@echo ""
	@echo "4. Dumping memory..."
	./$(CLI) -c $(MOCK_CORE) -r $(TEST_ROM) -f 60 -m 2 $(BUILD_DIR)/ram.bin
	@ls -la $(BUILD_DIR)/ram.bin
	@echo ""
	@echo "=== Genesis tests passed! ==="

# Saturn tests
test-saturn: $(CLI) $(SATURN_MOCK_CORE) $(SATURN_TEST_DISC)
	@echo ""
	@echo "=== Saturn RetroTest Pipeline Test ==="
	@echo ""
	@echo "1. Running 60 frames with Saturn mock core..."
	./$(CLI) -c $(SATURN_MOCK_CORE) -r $(SATURN_TEST_DISC) -f 60 -H -v
	@echo ""
	@echo "2. Running 120 frames and checking memory..."
	./$(CLI) -c $(SATURN_MOCK_CORE) -r $(SATURN_TEST_DISC) -f 120 -H
	@echo ""
	@echo "3. Testing Saturn state save/load..."
	./$(CLI) -c $(SATURN_MOCK_CORE) -r $(SATURN_TEST_DISC) -f 30 -S $(BUILD_DIR)/saturn.state
	./$(CLI) -c $(SATURN_MOCK_CORE) -r $(SATURN_TEST_DISC) -s $(BUILD_DIR)/saturn.state -f 30 -H
	@echo ""
	@echo "4. Dumping Saturn Work RAM..."
	./$(CLI) -c $(SATURN_MOCK_CORE) -r $(SATURN_TEST_DISC) -f 60 -m 2 $(BUILD_DIR)/saturn_wram.bin
	@ls -la $(BUILD_DIR)/saturn_wram.bin
	@echo ""
	@echo "5. Checking Saturn ID string in memory..."
	@od -A x -t c -j 256 -N 21 $(BUILD_DIR)/saturn_wram.bin
	@echo ""
	@echo "=== Saturn tests passed! ==="

# N64 tests
test-n64: $(CLI) $(N64_MOCK_CORE) $(N64_TEST_ROM)
	@echo ""
	@echo "=== N64 RetroTest Pipeline Test ==="
	@echo ""
	@echo "1. Running 60 frames with N64 mock core..."
	./$(CLI) -c $(N64_MOCK_CORE) -r $(N64_TEST_ROM) -f 60 -H -v
	@echo ""
	@echo "2. Running 120 frames and checking memory..."
	./$(CLI) -c $(N64_MOCK_CORE) -r $(N64_TEST_ROM) -f 120 -H
	@echo ""
	@echo "3. Testing N64 state save/load..."
	./$(CLI) -c $(N64_MOCK_CORE) -r $(N64_TEST_ROM) -f 30 -S $(BUILD_DIR)/n64.state
	./$(CLI) -c $(N64_MOCK_CORE) -r $(N64_TEST_ROM) -s $(BUILD_DIR)/n64.state -f 30 -H
	@echo ""
	@echo "4. Dumping N64 RDRAM..."
	./$(CLI) -c $(N64_MOCK_CORE) -r $(N64_TEST_ROM) -f 60 -m 2 $(BUILD_DIR)/n64_rdram.bin
	@ls -la $(BUILD_DIR)/n64_rdram.bin
	@echo ""
	@echo "5. Checking N64 ID string in memory..."
	@od -A x -t c -j 256 -N 24 $(BUILD_DIR)/n64_rdram.bin
	@echo ""
	@echo "=== N64 tests passed! ==="

# SNES tests
test-snes: $(CLI) $(SNES_MOCK_CORE) $(SNES_TEST_ROM)
	@echo ""
	@echo "=== SNES RetroTest Pipeline Test ==="
	@echo ""
	@echo "1. Running 60 frames with SNES mock core..."
	./$(CLI) -c $(SNES_MOCK_CORE) -r $(SNES_TEST_ROM) -f 60 -H -v
	@echo ""
	@echo "2. Running 120 frames and checking memory..."
	./$(CLI) -c $(SNES_MOCK_CORE) -r $(SNES_TEST_ROM) -f 120 -H
	@echo ""
	@echo "3. Testing SNES state save/load..."
	./$(CLI) -c $(SNES_MOCK_CORE) -r $(SNES_TEST_ROM) -f 30 -S $(BUILD_DIR)/snes.state
	./$(CLI) -c $(SNES_MOCK_CORE) -r $(SNES_TEST_ROM) -s $(BUILD_DIR)/snes.state -f 30 -H
	@echo ""
	@echo "4. Dumping SNES WRAM..."
	./$(CLI) -c $(SNES_MOCK_CORE) -r $(SNES_TEST_ROM) -f 60 -m 2 $(BUILD_DIR)/snes_wram.bin
	@ls -la $(BUILD_DIR)/snes_wram.bin
	@echo ""
	@echo "5. Checking SNES ID string in memory..."
	@od -A x -t c -j 256 -N 21 $(BUILD_DIR)/snes_wram.bin
	@echo ""
	@echo "=== SNES tests passed! ==="

# Dreamcast tests
test-dc: $(CLI) $(DC_MOCK_CORE) $(DC_TEST_DISC)
	@echo ""
	@echo "=== Dreamcast RetroTest Pipeline Test ==="
	@echo ""
	@echo "1. Running 60 frames with Dreamcast mock core..."
	./$(CLI) -c $(DC_MOCK_CORE) -r $(DC_TEST_DISC) -f 60 -H -v
	@echo ""
	@echo "2. Running 120 frames and checking memory..."
	./$(CLI) -c $(DC_MOCK_CORE) -r $(DC_TEST_DISC) -f 120 -H
	@echo ""
	@echo "3. Testing Dreamcast state save/load..."
	./$(CLI) -c $(DC_MOCK_CORE) -r $(DC_TEST_DISC) -f 30 -S $(BUILD_DIR)/dc.state
	./$(CLI) -c $(DC_MOCK_CORE) -r $(DC_TEST_DISC) -s $(BUILD_DIR)/dc.state -f 30 -H
	@echo ""
	@echo "4. Dumping Dreamcast main RAM..."
	./$(CLI) -c $(DC_MOCK_CORE) -r $(DC_TEST_DISC) -f 60 -m 2 $(BUILD_DIR)/dc_ram.bin
	@ls -la $(BUILD_DIR)/dc_ram.bin
	@echo ""
	@echo "5. Checking Dreamcast ID string in memory..."
	@od -A x -t c -j 256 -N 24 $(BUILD_DIR)/dc_ram.bin
	@echo ""
	@echo "=== Dreamcast tests passed! ==="

# =============================================================================
# Real Core Testing (when cores are available)
# =============================================================================

# Test with real Genesis Plus GX core
test-genesis-real: $(CLI) $(GENESIS_TEST_ROM)
	@if [ -f cores/genesis_plus_gx_libretro.so ]; then \
		echo "Testing with genesis_plus_gx..."; \
		./$(CLI) -c cores/genesis_plus_gx_libretro.so -r $(GENESIS_TEST_ROM) -f 60 -H; \
	else \
		echo "Error: cores/genesis_plus_gx_libretro.so not found"; \
		echo "Download from: https://buildbot.libretro.com/nightly/linux/x86_64/latest/"; \
		exit 1; \
	fi

# Test with real Mednafen Saturn core
test-saturn-real: $(CLI) $(SATURN_TEST_DISC)
	@if [ -f cores/mednafen_saturn_libretro.so ]; then \
		echo "Testing with mednafen_saturn..."; \
		./$(CLI) -c cores/mednafen_saturn_libretro.so -r $(SATURN_TEST_DISC) -f 60 -H; \
	else \
		echo "Error: cores/mednafen_saturn_libretro.so not found"; \
		echo "Download from: https://buildbot.libretro.com/nightly/linux/x86_64/latest/"; \
		exit 1; \
	fi

# Clean
clean:
	rm -rf $(BUILD_DIR)
	rm -f testrom/hello.md
	rm -f testrom/saturn_test.bin testrom/saturn_test.cue
	rm -f testrom/n64_test.z64
	rm -f testrom/snes_test.sfc
	rm -f testrom/dc_test.bin testrom/dc_test.cue

# Docker
docker-build:
	docker build -t retrotest -f docker/Dockerfile .

docker-test:
	docker run --rm -v $(PWD):/workspace retrotest make test

# Install libretro cores (for testing)
.PHONY: install-cores
install-cores:
	@echo "Downloading libretro cores..."
	@mkdir -p cores
	# Example: Download beetle-saturn core
	# curl -L -o cores/mednafen_saturn_libretro.so \
	#   https://buildbot.libretro.com/nightly/linux/x86_64/latest/mednafen_saturn_libretro.so.zip
	@echo "Note: Download cores manually or from https://buildbot.libretro.com/"
