#!/usr/bin/env python3
"""
Generate a minimal Dreamcast disc image for testing.

Dreamcast disc format:
- GD-ROM (proprietary) or CD-ROM (for homebrew)
- IP.BIN bootstrap at LBA 45000 (GD-ROM) or LBA 0 (CD-R)
- 1ST_READ.BIN main executable

This creates a minimal BIN/CUE that mock cores can load.
"""

import struct
import sys
import os

def generate_dc_disc(base_name):
    """Generate a minimal Dreamcast test disc (BIN/CUE format)."""

    bin_path = base_name + '.bin'
    cue_path = base_name + '.cue'

    # Dreamcast bootstrap (IP.BIN) structure
    # Simplified for mock core testing

    # Sector size for Mode 1 CD-ROM
    SECTOR_SIZE = 2048

    # Create IP.BIN-like header (first 16 sectors)
    ip_bin = bytearray(SECTOR_SIZE * 16)

    # Hardware ID (must be "SEGA SEGAKATANA ")
    hardware_id = b'SEGA SEGAKATANA '
    ip_bin[0:16] = hardware_id

    # Maker ID
    maker_id = b'SEGA ENTERPRISES'
    ip_bin[16:32] = maker_id

    # Device info (CD-ROM identifier)
    device_info = b'GD-ROM1/1       '
    ip_bin[32:48] = device_info

    # Region (J=Japan, U=USA, E=Europe)
    area_symbols = b'JUE             '
    ip_bin[48:64] = area_symbols

    # Peripherals (controller support)
    peripherals = b'0000000         '
    ip_bin[64:80] = peripherals

    # Product number
    product_no = b'T0000           '
    ip_bin[80:96] = product_no

    # Version
    version = b'V1.000          '
    ip_bin[96:112] = version

    # Release date
    release_date = b'20240101        '
    ip_bin[112:128] = release_date

    # Boot filename
    boot_filename = b'1ST_READ.BIN    '
    ip_bin[128:144] = boot_filename

    # Software maker name
    sw_maker = b'RETROTEST       '
    ip_bin[144:160] = sw_maker

    # Game title
    game_title = b'RETROTEST HELLO                 '
    ip_bin[160:192] = game_title

    # Put identification in header area
    id_string = b'DREAMCAST RETROTEST - HELLO WORLD!'
    ip_bin[256:256 + len(id_string)] = id_string

    # Simple SH-4 bootstrap code (after header area)
    # This is just for mock core identification
    sh4_code_offset = 0x300

    # SH-4 assembly (little-endian):
    # mov.l addr, r0    ; Load address
    # mov.l val, r1     ; Load value
    # mov.l r1, @r0     ; Store value at address
    # bra loop          ; Loop forever
    # nop

    sh4_code = bytes([
        # mov.l @(PC+disp), r0  -> load 0x8C000100
        0x02, 0xD0,  # mov.l @(8, PC), r0
        # mov.l @(PC+disp), r1  -> load 0x52455452 ("RETR")
        0x02, 0xD1,  # mov.l @(8, PC), r1
        # mov.l r1, @r0
        0x12, 0x20,  # mov.l r1, @r0
        # bra $
        0xFE, 0xAF,  # bra $-2 (infinite loop)
        # nop
        0x09, 0x00,  # nop
        # padding
        0x00, 0x00,
        # address constant (0x8C000100 - DC main RAM)
        0x00, 0x01, 0x00, 0x8C,
        # value constant ("RETR" in little-endian)
        0x52, 0x45, 0x54, 0x52,
    ])

    ip_bin[sh4_code_offset:sh4_code_offset + len(sh4_code)] = sh4_code

    # Create 1ST_READ.BIN (main executable, minimal)
    first_read = bytearray(SECTOR_SIZE * 4)

    # Simple executable header
    exec_header = b'RETROTEST DC EXECUTABLE\x00'
    first_read[0:len(exec_header)] = exec_header

    # Put more code in executable
    first_read[0x100:0x100 + len(sh4_code)] = sh4_code

    # Combine into disc image
    # Simple layout:
    # Sectors 0-15: IP.BIN
    # Sectors 16-19: 1ST_READ.BIN
    # Padding to reasonable size

    disc_data = ip_bin + first_read

    # Pad to at least 1MB
    min_size = 1024 * 1024
    if len(disc_data) < min_size:
        disc_data = disc_data + bytes(min_size - len(disc_data))

    # Write BIN file
    with open(bin_path, 'wb') as f:
        f.write(disc_data)

    # Write CUE file
    bin_filename = os.path.basename(bin_path)
    cue_content = f'''FILE "{bin_filename}" BINARY
  TRACK 01 MODE1/2048
    INDEX 01 00:00:00
'''

    with open(cue_path, 'w') as f:
        f.write(cue_content)

    print(f"Generated Dreamcast disc image:")
    print(f"  BIN: {bin_path} ({len(disc_data)} bytes)")
    print(f"  CUE: {cue_path}")
    print(f"  Title: {game_title.decode().strip()}")
    print(f"  Hardware ID: {hardware_id.decode().strip()}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <base_name>")
        print(f"  Creates <base_name>.bin and <base_name>.cue")
        sys.exit(1)

    generate_dc_disc(sys.argv[1])
