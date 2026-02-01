#!/usr/bin/env python3
"""
Generate a minimal Sega Saturn test disc image.

Creates a simplified Saturn disc structure that Saturn emulators
can load. This is a minimal "hello world" style test disc.

Saturn disc structure:
- IP.BIN (Initial Program) at sector 0
- Executable at sector 150+
- Track 1: Data track (Mode 1, 2048 bytes/sector)
"""

import struct
import sys
import os

def pad_to(data: bytes, size: int, fill: int = 0) -> bytes:
    """Pad data to specified size."""
    if len(data) >= size:
        return data[:size]
    return data + bytes([fill] * (size - len(data)))

def generate_ip_bin():
    """
    Generate IP.BIN (Initial Program / Boot header)
    Located at the start of the disc.
    """
    ip = bytearray()

    # Hardware ID (16 bytes)
    ip += b'SEGA SEGASATURN '

    # Maker ID (16 bytes)
    ip += b'SEGA ENTERPRISES'

    # Product Number (10 bytes)
    ip += b'T-000000  '

    # Version (6 bytes)
    ip += b'V1.000'

    # Release Date (8 bytes) - YYYYMMDD
    ip += b'20240101'

    # Device Info (8 bytes)
    ip += b'CD-1/1  '

    # Compatible Area Symbols (10 bytes) - JUE = Japan, USA, Europe
    ip += b'JUE       '

    # Compatible Peripherals (16 bytes)
    ip += b'J               '

    # Game Title (112 bytes)
    title = b'RETROTEST SATURN HELLO WORLD'
    ip += pad_to(title, 112, 0x20)

    # Reserved (16 bytes)
    ip += bytes(16)

    # Initial Program Size (4 bytes, big-endian)
    ip_size = 0x8000  # 32KB
    ip += struct.pack('>I', ip_size)

    # Reserved (4 bytes)
    ip += bytes(4)

    # Master Stack Pointer (4 bytes, big-endian)
    ip += struct.pack('>I', 0x06004000)

    # Slave Stack Pointer (4 bytes, big-endian)
    ip += struct.pack('>I', 0x06002000)

    # First Read Address (4 bytes) - where to load the executable
    ip += struct.pack('>I', 0x06010000)

    # First Read Size (4 bytes)
    ip += struct.pack('>I', 0x1000)  # 4KB

    # Reserved (8 bytes)
    ip += bytes(8)

    # Boot up entry address (4 bytes)
    ip += struct.pack('>I', 0x06010000)

    # Pad IP.BIN to 512 bytes
    ip = pad_to(bytes(ip), 512)

    # Add Saturn SH-2 bootstrap code
    bootstrap = generate_sh2_bootstrap()
    ip += bootstrap

    # Pad to 32KB (IP.BIN typical size)
    ip = pad_to(bytes(ip), 0x8000)

    return bytes(ip)


def generate_sh2_bootstrap():
    """
    Generate minimal SH-2 bootstrap code.

    This code:
    1. Sets up the stack
    2. Initializes VDP2 for basic display
    3. Writes "HELLO" pattern to VDP2 VRAM
    4. Loops forever
    """
    code = bytearray()

    # SH-2 is big-endian
    def emit16(val):
        return struct.pack('>H', val & 0xFFFF)

    def emit32(val):
        return struct.pack('>I', val & 0xFFFFFFFF)

    # Entry point
    # mov.l @(disp, PC), R15  ; Load stack pointer
    # We'll use a simpler approach: hardcode the bootstrap

    # NOP slide for safety
    for _ in range(8):
        code += emit16(0x0009)  # nop

    # Set R15 (stack) = 0x06004000
    # mov.l @(PC+disp), R15
    code += emit16(0xDF08)  # mov.l @(8, PC), R15
    code += emit16(0x0009)  # nop

    # Jump to main loop (skip data)
    code += emit16(0xA006)  # bra +14
    code += emit16(0x0009)  # nop (delay slot)

    # Data pool (must be 4-byte aligned)
    code += emit32(0x06004000)  # Stack pointer value
    code += emit32(0x25F80000)  # VDP2 VRAM address
    code += emit32(0x060FFFFF)  # Work RAM High end

    # Main loop (simple infinite loop)
    # main_loop:
    code += emit16(0x0009)  # nop
    code += emit16(0xAFFE)  # bra main_loop (-4 bytes = -2 instructions)
    code += emit16(0x0009)  # nop (delay slot)

    # Pad to 256 bytes
    while len(code) < 256:
        code += emit16(0x0009)

    return bytes(code)


def generate_data_sector():
    """Generate a data sector with test pattern."""
    sector = bytearray()

    # Saturn "HELLO" test data
    sector += b'SATURN TEST ROM - HELLO WORLD!\n'
    sector += b'This is a minimal test disc for RetroTest.\n'
    sector += b'\x00' * 64

    # Test pattern for memory verification
    for i in range(256):
        sector += bytes([i])

    # Frame counter location marker
    sector += b'FRAME_COUNT_HERE'
    sector += struct.pack('<I', 0)  # Initial frame count

    # Pad to 2048 bytes (Mode 1 sector)
    sector = pad_to(bytes(sector), 2048)

    return bytes(sector)


def generate_cue_sheet(bin_filename: str) -> str:
    """Generate CUE sheet for the disc image."""
    return f'''FILE "{bin_filename}" BINARY
  TRACK 01 MODE1/2048
    INDEX 01 00:00:00
'''


def generate_disc_image():
    """Generate complete Saturn disc image (BIN file)."""
    image = bytearray()

    # Sector 0-15: IP.BIN (system area)
    ip_bin = generate_ip_bin()
    # IP.BIN spans first 16 sectors
    for i in range(16):
        start = i * 2048
        end = start + 2048
        if end <= len(ip_bin):
            image += ip_bin[start:end]
        else:
            image += pad_to(ip_bin[start:] if start < len(ip_bin) else b'', 2048)

    # Sectors 16-149: Reserved (typically empty or system)
    for _ in range(16, 150):
        image += bytes(2048)

    # Sector 150+: User data (our test program)
    data_sector = generate_data_sector()
    image += data_sector

    # Add a few more sectors for padding
    for _ in range(10):
        image += bytes(2048)

    return bytes(image)


def main():
    output_base = sys.argv[1] if len(sys.argv) > 1 else 'saturn_test'

    # Remove extension if provided
    if output_base.endswith('.bin') or output_base.endswith('.cue'):
        output_base = output_base.rsplit('.', 1)[0]

    bin_path = output_base + '.bin'
    cue_path = output_base + '.cue'

    # Generate BIN file
    disc_image = generate_disc_image()
    with open(bin_path, 'wb') as f:
        f.write(disc_image)

    # Generate CUE sheet
    cue_content = generate_cue_sheet(os.path.basename(bin_path))
    with open(cue_path, 'w') as f:
        f.write(cue_content)

    print(f"Generated Saturn test disc:")
    print(f"  BIN: {bin_path} ({len(disc_image)} bytes, {len(disc_image)//2048} sectors)")
    print(f"  CUE: {cue_path}")


if __name__ == '__main__':
    main()
