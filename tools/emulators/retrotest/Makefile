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

# =============================================================================
# Test Targets
# =============================================================================

# Backwards compatibility
MOCK_CORE = $(GENESIS_MOCK_CORE)
TEST_ROM = $(GENESIS_TEST_ROM)

# Run Genesis tests (default)
test: test-genesis

# Run all platform tests
test-all: test-genesis test-saturn
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
