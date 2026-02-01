#!/usr/bin/env python3
"""
Generate a minimal N64 ROM for testing.

N64 ROM format:
- Big-endian (.z64) or byte-swapped (.n64, .v64)
- First 0x40 bytes: ROM header
- 0x40-0x1000: Boot code (IPL3)
- 0x1000+: Game code

This creates a minimal valid ROM that mock cores can load.
"""

import struct
import sys

def generate_n64_rom(output_path):
    """Generate a minimal N64 test ROM."""

    # N64 ROM header (64 bytes)
    header = bytearray(64)

    # PI BSD DOM1 settings (first 4 bytes)
    header[0:4] = bytes([0x80, 0x37, 0x12, 0x40])  # Standard PI settings

    # Clock rate (usually 0x0000000F)
    header[4:8] = struct.pack('>I', 0x0000000F)

    # Program counter (entry point) - typically 0x80000400
    header[8:12] = struct.pack('>I', 0x80000400)

    # Release address
    header[12:16] = struct.pack('>I', 0x00001444)

    # CRC1 and CRC2 (checksums - can be 0 for mock testing)
    header[16:20] = struct.pack('>I', 0x00000000)
    header[20:24] = struct.pack('>I', 0x00000000)

    # Reserved (8 bytes)
    header[24:32] = bytes(8)

    # Game title (20 bytes, space-padded)
    title = b'RETROTEST HELLO     '
    header[32:52] = title[:20]

    # Reserved (7 bytes)
    header[52:59] = bytes(7)

    # Game code (4 bytes): N = N64, R = Region-free, T = Test, E = English
    header[59:63] = b'NRTE'

    # Version
    header[63] = 0x00

    # Boot code area (0x40 to 0x1000) - minimal stub
    boot_code = bytearray(0x1000 - 0x40)

    # Simple MIPS assembly to write to memory (big-endian)
    # lui t0, 0x8000      ; t0 = 0x80000000
    # ori t0, t0, 0x0400  ; t0 = 0x80000400
    # lui t1, 0x5245      ; "RE"
    # ori t1, t1, 0x5452  ; "TR" -> t1 = "RETR"
    # sw t1, 0(t0)        ; Store "RETR" at 0x80000400
    # j entry             ; Loop forever
    # nop

    mips_code = bytes([
        0x3C, 0x08, 0x80, 0x00,  # lui t0, 0x8000
        0x35, 0x08, 0x04, 0x00,  # ori t0, t0, 0x0400
        0x3C, 0x09, 0x52, 0x45,  # lui t1, 0x5245 ("RE")
        0x35, 0x29, 0x54, 0x52,  # ori t1, t1, 0x5452 ("TR")
        0xAD, 0x09, 0x00, 0x00,  # sw t1, 0(t0)
        0x08, 0x00, 0x00, 0x10,  # j 0x80000040
        0x00, 0x00, 0x00, 0x00,  # nop (delay slot)
    ])
    boot_code[0:len(mips_code)] = mips_code

    # Game code area (minimal)
    game_code = bytearray(0x1000)

    # Put identification string in ROM
    id_string = b'N64 RETROTEST ROM - HELLO WORLD!'
    game_code[0:len(id_string)] = id_string

    # Combine all parts
    rom = header + boot_code + game_code

    # Pad to minimum size (1MB is common minimum)
    min_size = 1024 * 1024
    if len(rom) < min_size:
        rom = rom + bytes(min_size - len(rom))

    # Write ROM file
    with open(output_path, 'wb') as f:
        f.write(rom)

    print(f"Generated N64 ROM: {output_path}")
    print(f"  Size: {len(rom)} bytes ({len(rom) // 1024} KB)")
    print(f"  Title: {title.decode().strip()}")
    print(f"  Entry: 0x80000400")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <output.z64>")
        sys.exit(1)

    generate_n64_rom(sys.argv[1])
