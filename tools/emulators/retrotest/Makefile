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

# CLI tool
$(CLI): $(SRC_DIR)/main.c $(STATIC_LIB)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -I$(INC_DIR) -o $@ $< -L$(BUILD_DIR) -lretrotest $(LDFLAGS)

# Object files
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -I$(INC_DIR) -c -o $@ $<

# Clean
clean:
	rm -rf $(BUILD_DIR)

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
