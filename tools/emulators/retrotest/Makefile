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

# Mock core for testing
MOCK_CORE = $(BUILD_DIR)/mock_core_libretro.so

$(MOCK_CORE): testrom/mock_core.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -shared -o $@ $<

# Test ROM
TEST_ROM = testrom/hello.md

$(TEST_ROM): testrom/gen_genesis_hello.py
	cd testrom && python3 gen_genesis_hello.py hello.md

# Run the full test pipeline
test: $(CLI) $(MOCK_CORE) $(TEST_ROM)
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
	@echo "=== All tests passed! ==="

# Clean
clean:
	rm -rf $(BUILD_DIR)
	rm -f testrom/hello.md

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
