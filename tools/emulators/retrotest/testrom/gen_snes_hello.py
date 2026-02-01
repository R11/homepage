#!/usr/bin/env python3
"""
Generate a minimal SNES ROM for testing.

SNES ROM format:
- LoROM or HiROM mapping
- Internal header at specific offset
- 65816 reset vector at end of first bank

This creates a minimal valid ROM that mock cores can load.
"""

import struct
import sys

def generate_snes_rom(output_path):
    """Generate a minimal SNES test ROM (LoROM format)."""

    # LoROM: 32KB banks, header at 0x7FC0
    # Create a 32KB ROM (minimum useful size)
    rom_size = 32 * 1024
    rom = bytearray(rom_size)

    # Internal ROM header at 0x7FC0 (LoROM)
    header_offset = 0x7FC0

    # Game title (21 bytes, space-padded)
    title = b'RETROTEST HELLO      '
    rom[header_offset:header_offset + 21] = title[:21]

    # ROM makeup byte (0x20 = LoROM, no FastROM)
    rom[header_offset + 21] = 0x20

    # ROM type (0x00 = ROM only)
    rom[header_offset + 22] = 0x00

    # ROM size (0x08 = 256KB, but we use smaller)
    rom[header_offset + 23] = 0x08

    # SRAM size (0x00 = no SRAM)
    rom[header_offset + 24] = 0x00

    # Country (0x01 = USA)
    rom[header_offset + 25] = 0x01

    # Developer ID (0x33 = use extended header)
    rom[header_offset + 26] = 0x33

    # Version
    rom[header_offset + 27] = 0x00

    # Checksum complement and checksum (calculated below)
    # For now, use placeholder
    rom[header_offset + 28] = 0xFF
    rom[header_offset + 29] = 0xFF
    rom[header_offset + 30] = 0x00
    rom[header_offset + 31] = 0x00

    # Interrupt vectors at 0x7FE0-0x7FFF (native mode)
    # and 0x7FF0-0x7FFF (emulation mode)
    vector_base = 0x7FE0

    # Native mode vectors (unused in this simple test)
    for i in range(8):
        rom[vector_base + i * 2] = 0x00
        rom[vector_base + i * 2 + 1] = 0x80  # Point to 0x8000

    # Emulation mode vectors at 0x7FF0
    # Most important: RESET vector at 0x7FFC-0x7FFD
    # Points to our code at 0x8000
    rom[0x7FFC] = 0x00  # Low byte
    rom[0x7FFD] = 0x80  # High byte -> 0x8000

    # Code at 0x8000 (start of ROM in LoROM mapping)
    code_offset = 0x0000  # In file, maps to 0x8000 in CPU address space

    # 65816 assembly (emulation mode, 8-bit accumulator)
    code = bytes([
        # sei            ; Disable interrupts
        0x78,
        # clc            ; Switch to native mode
        0x18,
        # xce            ; Exchange carry and emulation
        0xFB,
        # rep #$30       ; 16-bit A and X/Y
        0xC2, 0x30,
        # lda #$0000     ; Clear A
        0xA9, 0x00, 0x00,
        # sta $2100      ; Force blank (screen off)
        0x8D, 0x00, 0x21,
        # lda #$5245     ; "RE" (little-endian)
        0xA9, 0x45, 0x52,
        # sta $7E0100    ; Store in WRAM
        0x8F, 0x00, 0x01, 0x7E,
        # lda #$5452     ; "TR" (little-endian)
        0xA9, 0x52, 0x54,
        # sta $7E0102    ; Store in WRAM
        0x8F, 0x02, 0x01, 0x7E,
        # bra loop       ; Infinite loop
        0x80, 0xFE,
    ])

    rom[code_offset:code_offset + len(code)] = code

    # Put identification string in ROM
    id_offset = 0x0100
    id_string = b'SNES RETROTEST ROM - HELLO WORLD!'
    rom[id_offset:id_offset + len(id_string)] = id_string

    # Calculate checksum
    checksum = sum(rom) & 0xFFFF
    complement = (checksum ^ 0xFFFF) & 0xFFFF

    rom[header_offset + 28] = complement & 0xFF
    rom[header_offset + 29] = (complement >> 8) & 0xFF
    rom[header_offset + 30] = checksum & 0xFF
    rom[header_offset + 31] = (checksum >> 8) & 0xFF

    # Write ROM file
    with open(output_path, 'wb') as f:
        f.write(rom)

    print(f"Generated SNES ROM: {output_path}")
    print(f"  Size: {len(rom)} bytes ({len(rom) // 1024} KB)")
    print(f"  Title: {title.decode().strip()}")
    print(f"  Format: LoROM")
    print(f"  Checksum: 0x{checksum:04X}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <output.sfc>")
        sys.exit(1)

    generate_snes_rom(sys.argv[1])
