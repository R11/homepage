# RetroForge Makefile
#
# Build system for cross-platform retro game development library

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -g -O2

# Directories
LIB_DIR = lib
TEST_DIR = tests
BUILD_DIR = build

# Source files
LIB_SOURCES = \
	$(LIB_DIR)/core/math/fixed_math.c

TEST_SOURCES = \
	$(TEST_DIR)/test_runner.c \
	$(TEST_DIR)/unit/test_fixed_math.c

# Object files
LIB_OBJECTS = $(LIB_SOURCES:%.c=$(BUILD_DIR)/%.o)
TEST_OBJECTS = $(TEST_SOURCES:%.c=$(BUILD_DIR)/%.o)

# Targets
.PHONY: all clean test

all: $(BUILD_DIR)/test_runner

# Build test runner
$(BUILD_DIR)/test_runner: $(LIB_OBJECTS) $(TEST_OBJECTS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -o $@ $^

# Compile library sources
$(BUILD_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -I$(LIB_DIR) -c -o $@ $<

# Run tests
test: $(BUILD_DIR)/test_runner
	@echo ""
	@./$(BUILD_DIR)/test_runner

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR)

# Platform-specific targets (placeholders for future)
.PHONY: saturn n64

saturn:
	@echo "Saturn build not yet implemented"
	@echo "Requires SH-2 cross-compiler (sh-elf-gcc)"

n64:
	@echo "N64 build not yet implemented"
	@echo "Requires MIPS cross-compiler (mips64-elf-gcc) or libdragon"

# Help
.PHONY: help
help:
	@echo "RetroForge Build System"
	@echo ""
	@echo "Targets:"
	@echo "  all      - Build test runner (default)"
	@echo "  test     - Build and run tests"
	@echo "  clean    - Remove build artifacts"
	@echo "  saturn   - Build for Sega Saturn (not yet implemented)"
	@echo "  n64      - Build for Nintendo 64 (not yet implemented)"
	@echo "  help     - Show this message"
