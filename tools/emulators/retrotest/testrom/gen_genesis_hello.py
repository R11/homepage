#!/usr/bin/env python3
"""
Generate a minimal Sega Genesis/Mega Drive test ROM.

This creates a ROM that:
1. Initializes the VDP (Video Display Processor)
2. Sets the background color to blue
3. Writes "HELLO" to VRAM (visible as colored blocks)
4. Loops forever

The ROM is designed for automated testing - it produces deterministic
output that can be verified via frame hashing.
"""

import struct
import sys

def write_be16(val):
    """Write big-endian 16-bit value."""
    return struct.pack('>H', val & 0xFFFF)

def write_be32(val):
    """Write big-endian 32-bit value."""
    return struct.pack('>I', val & 0xFFFFFFFF)

def generate_rom():
    rom = bytearray()

    # ==========================================================================
    # Vector Table (0x000 - 0x0FF)
    # ==========================================================================

    entry_point = 0x200  # Start of our code

    # 0x000: Initial Stack Pointer
    rom += write_be32(0x00FFE000)

    # 0x004: Initial Program Counter (entry point)
    rom += write_be32(entry_point)

    # 0x008-0x0FF: Exception vectors (all point to a simple loop)
    exception_handler = entry_point + 0x100  # We'll put a loop there
    for i in range(62):  # 62 more vectors (248 bytes)
        rom += write_be32(exception_handler)

    # ==========================================================================
    # ROM Header (0x100 - 0x1FF)
    # ==========================================================================

    # Console name (16 bytes)
    rom += b'SEGA MEGA DRIVE '

    # Copyright/date (16 bytes)
    rom += b'(C)RETROFORGE 24'

    # Domestic name (48 bytes)
    rom += b'RETROTEST HELLO WORLD                           '

    # Overseas name (48 bytes)
    rom += b'RETROTEST HELLO WORLD                           '

    # Serial number (14 bytes)
    rom += b'GM 00000000-00'

    # Checksum (2 bytes) - will be calculated later
    checksum_offset = len(rom)
    rom += write_be16(0x0000)

    # I/O support (16 bytes)
    rom += b'J               '

    # ROM start address (4 bytes)
    rom += write_be32(0x00000000)

    # ROM end address (4 bytes) - will update later
    rom_end_offset = len(rom)
    rom += write_be32(0x00000000)

    # RAM start (4 bytes)
    rom += write_be32(0x00FF0000)

    # RAM end (4 bytes)
    rom += write_be32(0x00FFFFFF)

    # SRAM info (12 bytes) - no SRAM
    rom += b'            '

    # Modem info (12 bytes)
    rom += b'            '

    # Memo (40 bytes)
    rom += b'MINIMAL TEST ROM FOR RETROTEST          '

    # Countries (16 bytes)
    rom += b'JUE             '

    # Pad to 0x200
    while len(rom) < 0x200:
        rom += b'\x00'

    # ==========================================================================
    # Main Code (0x200+)
    # ==========================================================================

    code_start = len(rom)

    # Genesis 68000 machine code
    # Addresses:
    #   VDP Data Port:    0xC00000
    #   VDP Control Port: 0xC00004
    #   Z80 Bus Request:  0xA11100
    #   Z80 Reset:        0xA11200

    code = bytearray()

    # --- Request Z80 bus ---
    # move.w #$0100, ($A11100)
    code += bytes([0x33, 0xFC, 0x01, 0x00, 0x00, 0xA1, 0x11, 0x00])

    # --- Wait for Z80 bus ---
    # wait_z80:
    #   btst #0, ($A11100)
    #   bne wait_z80
    wait_z80_offset = len(code)
    code += bytes([0x08, 0x39, 0x00, 0x00, 0x00, 0xA1, 0x11, 0x00])  # btst
    code += bytes([0x66, 0xF6])  # bne -10 (back to btst)

    # --- Reset Z80 ---
    # move.w #$0000, ($A11200)
    code += bytes([0x33, 0xFC, 0x00, 0x00, 0x00, 0xA1, 0x12, 0x00])

    # --- Initialize VDP ---
    # We'll set up the VDP with a series of register writes

    # VDP register format: 0x8000 | (reg << 8) | value
    vdp_regs = [
        (0x00, 0x04),  # Mode 1: No H interrupt
        (0x01, 0x44),  # Mode 2: Enable display, enable V interrupt, DMA off
        (0x02, 0x30),  # Plane A at VRAM 0xC000
        (0x03, 0x3C),  # Window at VRAM 0xF000
        (0x04, 0x07),  # Plane B at VRAM 0xE000
        (0x05, 0x6C),  # Sprite table at VRAM 0xD800
        (0x06, 0x00),  # Unused
        (0x07, 0x00),  # Background color: palette 0, color 0
        (0x08, 0x00),  # Unused
        (0x09, 0x00),  # Unused
        (0x0A, 0xFF),  # H interrupt counter
        (0x0B, 0x00),  # Mode 3: Full screen scroll
        (0x0C, 0x81),  # Mode 4: H40 (320px), no interlace, no shadow
        (0x0D, 0x3F),  # H scroll at VRAM 0xFC00
        (0x0E, 0x00),  # Unused
        (0x0F, 0x02),  # Auto-increment: 2
        (0x10, 0x01),  # Scroll size: 32x64
        (0x11, 0x00),  # Window H position
        (0x12, 0x00),  # Window V position
    ]

    # Load address of VDP control port into A0
    # lea ($C00004), A0
    code += bytes([0x41, 0xF9, 0x00, 0xC0, 0x00, 0x04])

    # Write all VDP registers
    for reg, val in vdp_regs:
        cmd = 0x8000 | (reg << 8) | val
        # move.w #cmd, (A0)
        code += bytes([0x30, 0xBC]) + write_be16(cmd)

    # --- Set background color (palette entry 0) ---
    # CRAM write: 0xC0000000
    # move.l #$C0000000, (A0)
    code += bytes([0x20, 0xBC, 0xC0, 0x00, 0x00, 0x00])

    # Write color (BGR format, 0x0E00 = blue)
    # lea ($C00000), A1
    code += bytes([0x43, 0xF9, 0x00, 0xC0, 0x00, 0x00])
    # move.w #$0E00, (A1)   ; Blue
    code += bytes([0x32, 0xBC, 0x0E, 0x00])

    # --- Write some colors to CRAM for "HELLO" visualization ---
    # Set palette entry 1 = white (0x0EEE)
    # move.l #$C0020000, (A0)  ; CRAM address 2
    code += bytes([0x20, 0xBC, 0xC0, 0x02, 0x00, 0x00])
    # move.w #$0EEE, (A1)
    code += bytes([0x32, 0xBC, 0x0E, 0xEE])

    # --- Fill Plane A with a pattern ---
    # VRAM write to plane A (0xC000): 0x40000003
    # move.l #$40000003, (A0)
    code += bytes([0x20, 0xBC, 0x40, 0x00, 0x00, 0x03])

    # Write pattern: alternating tiles to spell "HI" in blocks
    # Pattern: 0x0001 = tile 1 with palette 0 (white on blue)
    # We'll write 64*32 = 2048 words

    # move.w #2047, D0   ; Counter
    code += bytes([0x30, 0x3C, 0x07, 0xFF])
    # move.w #$0000, D1  ; Tile pattern (blank)
    code += bytes([0x32, 0x3C, 0x00, 0x00])

    # fill_loop:
    fill_loop = len(code)
    # move.w D1, (A1)
    code += bytes([0x32, 0x81])
    # dbf D0, fill_loop
    offset = fill_loop - (len(code) + 4)
    code += bytes([0x51, 0xC8]) + struct.pack('>h', offset)

    # --- Write "HELLO" pattern to specific VRAM locations ---
    # Write to plane A at row 10, creating visible blocks

    # For simplicity, let's write directly to VRAM tile data
    # to create a visible pattern

    # VRAM address for tile 1 pattern data: 0x0020 (tile 1 * 32 bytes)
    # move.l #$40200000, (A0)   ; VRAM write to 0x0020
    code += bytes([0x20, 0xBC, 0x40, 0x20, 0x00, 0x00])

    # Write 8 rows of tile data (4 bytes each = 32 bytes total)
    # Each row: 8 pixels, 4 bits per pixel
    # Pattern: solid color 1 (white)
    for _ in range(8):
        # move.l #$11111111, (A1)
        code += bytes([0x22, 0xBC, 0x11, 0x11, 0x11, 0x11])

    # Now place tile 1 at a visible position on plane A
    # Plane A is at 0xC000, row 12 column 14 = offset 12*64 + 14 = 782 words = 0x61C
    # VRAM address = 0xC000 + 0xC38 = 0xCC38
    # move.l #$4C380003, (A0)   ; VRAM write to 0xCC38
    code += bytes([0x20, 0xBC, 0x4C, 0x38, 0x00, 0x03])
    # Write tile indices spelling HELLO (simplified: just 5 white blocks)
    for _ in range(5):
        # move.w #$0001, (A1)   ; Tile 1
        code += bytes([0x32, 0xBC, 0x00, 0x01])

    # --- Enable display and enter main loop ---
    # Release Z80 reset
    # move.w #$0100, ($A11200)
    code += bytes([0x33, 0xFC, 0x01, 0x00, 0x00, 0xA1, 0x12, 0x00])

    # Main loop (infinite)
    # main_loop:
    main_loop = len(code)
    #   nop
    code += bytes([0x4E, 0x71])
    #   bra main_loop
    offset = main_loop - (len(code) + 2)
    code += bytes([0x60]) + struct.pack('b', offset)

    # --- Exception handler (just loops) ---
    # Pad to exception handler location
    while len(code) < 0x100:
        code += bytes([0x4E, 0x71])  # nop

    # exception_loop:
    exception_loop = len(code)
    code += bytes([0x4E, 0x71])  # nop
    offset = exception_loop - (len(code) + 2)
    code += bytes([0x60]) + struct.pack('b', offset)  # bra exception_loop

    # Add code to ROM
    rom += code

    # Pad to power of 2 size (at least 32KB)
    while len(rom) < 32768:
        rom += b'\x00'

    # ==========================================================================
    # Fix up header
    # ==========================================================================

    # ROM end address
    struct.pack_into('>I', rom, rom_end_offset, len(rom) - 1)

    # Calculate checksum (sum of all words from 0x200 to end)
    checksum = 0
    for i in range(0x200, len(rom), 2):
        checksum += (rom[i] << 8) | rom[i + 1]
    checksum &= 0xFFFF

    struct.pack_into('>H', rom, checksum_offset, checksum)

    return bytes(rom)


def main():
    rom = generate_rom()

    output_path = sys.argv[1] if len(sys.argv) > 1 else 'hello.md'

    with open(output_path, 'wb') as f:
        f.write(rom)

    print(f"Generated {len(rom)} byte ROM: {output_path}")
    print(f"Checksum: 0x{rom[0x18E]:02X}{rom[0x18F]:02X}")


if __name__ == '__main__':
    main()
