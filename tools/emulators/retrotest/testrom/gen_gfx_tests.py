#!/usr/bin/env python3
"""
Graphics Test ROM Generator

Creates test ROMs containing graphics commands for cross-platform testing.
Each test suite exercises different rendering primitives.
"""

import struct
import sys
import os
from dataclasses import dataclass
from typing import List
from enum import IntEnum

class GfxCmd(IntEnum):
    END = 0x00
    CLEAR = 0x01
    PIXEL = 0x02
    LINE = 0x03
    RECT = 0x04
    RECT_FILL = 0x05
    CIRCLE = 0x06
    CIRCLE_FILL = 0x07
    TRI = 0x08
    TRI_FILL = 0x09
    SPRITE = 0x0A
    HLINE = 0x0B
    VLINE = 0x0C
    POLY = 0x0D
    FRAME = 0x0E
    GRADIENT = 0x0F

class GfxColor:
    BLACK = 0x0000
    WHITE = 0xFFFF
    RED = 0xF800
    GREEN = 0x07E0
    BLUE = 0x001F
    YELLOW = 0xFFE0
    CYAN = 0x07FF
    MAGENTA = 0xF81F
    GRAY = 0x8410
    ORANGE = 0xFD20
    PURPLE = 0x8010

    @staticmethod
    def rgb565(r, g, b):
        return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)

@dataclass
class Command:
    cmd: int
    flags: int = 0
    color: int = 0
    x1: int = 0
    y1: int = 0
    x2: int = 0
    y2: int = 0
    x3: int = 0
    y3: int = 0

    def pack(self) -> bytes:
        return struct.pack('<BBHhhhhhh',
            self.cmd, self.flags, self.color,
            self.x1, self.y1, self.x2, self.y2, self.x3, self.y3)

class GfxTestROM:
    MAGIC = b'GFXTEST\x00'

    def __init__(self, width=320, height=240, test_id=1):
        self.width = width
        self.height = height
        self.test_id = test_id
        self.version = 1
        self.commands: List[Command] = []

    def clear(self, color):
        self.commands.append(Command(GfxCmd.CLEAR, color=color))

    def pixel(self, x, y, color):
        self.commands.append(Command(GfxCmd.PIXEL, x1=x, y1=y, color=color))

    def line(self, x1, y1, x2, y2, color):
        self.commands.append(Command(GfxCmd.LINE, x1=x1, y1=y1, x2=x2, y2=y2, color=color))

    def hline(self, x1, x2, y, color):
        self.commands.append(Command(GfxCmd.HLINE, x1=x1, x2=x2, y1=y, color=color))

    def vline(self, x, y1, y2, color):
        self.commands.append(Command(GfxCmd.VLINE, x1=x, y1=y1, y2=y2, color=color))

    def rect(self, x, y, w, h, color):
        self.commands.append(Command(GfxCmd.RECT, x1=x, y1=y, x2=w, y2=h, color=color))

    def rect_fill(self, x, y, w, h, color):
        self.commands.append(Command(GfxCmd.RECT_FILL, x1=x, y1=y, x2=w, y2=h, color=color))

    def circle(self, cx, cy, r, color):
        self.commands.append(Command(GfxCmd.CIRCLE, x1=cx, y1=cy, x2=r, color=color))

    def circle_fill(self, cx, cy, r, color):
        self.commands.append(Command(GfxCmd.CIRCLE_FILL, x1=cx, y1=cy, x2=r, color=color))

    def triangle(self, x1, y1, x2, y2, x3, y3, color):
        self.commands.append(Command(GfxCmd.TRI, x1=x1, y1=y1, x2=x2, y2=y2, x3=x3, y3=y3, color=color))

    def triangle_fill(self, x1, y1, x2, y2, x3, y3, color):
        self.commands.append(Command(GfxCmd.TRI_FILL, x1=x1, y1=y1, x2=x2, y2=y2, x3=x3, y3=y3, color=color))

    def frame(self):
        """Mark end of frame (for multi-frame tests)"""
        self.commands.append(Command(GfxCmd.FRAME))

    def end(self):
        self.commands.append(Command(GfxCmd.END))

    def build(self) -> bytes:
        # Ensure END command
        if not self.commands or self.commands[-1].cmd != GfxCmd.END:
            self.end()

        # Header
        header = struct.pack('<8sBBHHH',
            self.MAGIC,
            self.version,
            self.test_id,
            len(self.commands),
            self.width,
            self.height
        )

        # Commands
        cmd_data = b''.join(cmd.pack() for cmd in self.commands)

        return header + cmd_data

    def save(self, filename):
        data = self.build()
        with open(filename, 'wb') as f:
            f.write(data)
        return len(data)


# =============================================================================
# Test Suites
# =============================================================================

def test_primitives(width=320, height=240):
    """Test 1: Basic primitives - pixels, lines, rectangles, circles"""
    rom = GfxTestROM(width, height, test_id=1)

    # Clear to dark blue
    rom.clear(GfxColor.rgb565(0, 0, 64))

    # Draw pixel grid in top-left
    for i in range(10):
        for j in range(10):
            color = GfxColor.rgb565(i * 25, j * 25, 128)
            rom.pixel(10 + i * 4, 10 + j * 4, color)

    # Horizontal and vertical lines
    rom.hline(60, 150, 20, GfxColor.RED)
    rom.hline(60, 150, 30, GfxColor.GREEN)
    rom.hline(60, 150, 40, GfxColor.BLUE)
    rom.vline(60, 50, 100, GfxColor.YELLOW)
    rom.vline(150, 50, 100, GfxColor.CYAN)

    # Diagonal lines
    rom.line(170, 20, 250, 80, GfxColor.WHITE)
    rom.line(170, 80, 250, 20, GfxColor.MAGENTA)

    # Rectangles
    rom.rect(10, 120, 60, 40, GfxColor.RED)
    rom.rect_fill(80, 120, 60, 40, GfxColor.GREEN)
    rom.rect(150, 120, 60, 40, GfxColor.BLUE)
    rom.rect_fill(155, 125, 50, 30, GfxColor.CYAN)

    # Circles
    rom.circle(50, 200, 30, GfxColor.YELLOW)
    rom.circle_fill(120, 200, 25, GfxColor.ORANGE)
    rom.circle(190, 200, 35, GfxColor.MAGENTA)
    rom.circle_fill(190, 200, 15, GfxColor.WHITE)

    # Small circles
    for i in range(5):
        rom.circle(250 + i * 12, 200, 5, GfxColor.rgb565(255, i * 50, 0))

    return rom


def test_lines(width=320, height=240):
    """Test 2: Line rendering - various angles and lengths"""
    rom = GfxTestROM(width, height, test_id=2)

    rom.clear(GfxColor.BLACK)

    cx, cy = width // 2, height // 2

    # Radial lines from center
    import math
    for i in range(36):
        angle = i * 10 * math.pi / 180
        x2 = int(cx + 100 * math.cos(angle))
        y2 = int(cy + 100 * math.sin(angle))
        hue = i * 10
        # Simple HSV to RGB (approximate)
        if hue < 60:
            r, g, b = 255, int(hue * 4.25), 0
        elif hue < 120:
            r, g, b = int((120 - hue) * 4.25), 255, 0
        elif hue < 180:
            r, g, b = 0, 255, int((hue - 120) * 4.25)
        elif hue < 240:
            r, g, b = 0, int((240 - hue) * 4.25), 255
        elif hue < 300:
            r, g, b = int((hue - 240) * 4.25), 0, 255
        else:
            r, g, b = 255, 0, int((360 - hue) * 4.25)
        color = GfxColor.rgb565(r, g, b)
        rom.line(cx, cy, x2, y2, color)

    # Border
    rom.rect(0, 0, width, height, GfxColor.WHITE)

    return rom


def test_triangles(width=320, height=240):
    """Test 3: Triangle rendering - outlines and fills"""
    rom = GfxTestROM(width, height, test_id=3)

    rom.clear(GfxColor.rgb565(32, 32, 32))

    # Row 1: Outline triangles
    rom.triangle(20, 60, 60, 10, 100, 60, GfxColor.RED)
    rom.triangle(120, 60, 160, 10, 200, 60, GfxColor.GREEN)
    rom.triangle(220, 60, 260, 10, 300, 60, GfxColor.BLUE)

    # Row 2: Filled triangles
    rom.triangle_fill(20, 140, 60, 90, 100, 140, GfxColor.YELLOW)
    rom.triangle_fill(120, 140, 160, 90, 200, 140, GfxColor.CYAN)
    rom.triangle_fill(220, 140, 260, 90, 300, 140, GfxColor.MAGENTA)

    # Row 3: Mixed triangles (filled with outline)
    rom.triangle_fill(40, 220, 80, 160, 120, 220, GfxColor.rgb565(128, 0, 128))
    rom.triangle(40, 220, 80, 160, 120, 220, GfxColor.WHITE)

    rom.triangle_fill(160, 220, 200, 160, 240, 220, GfxColor.rgb565(0, 128, 128))
    rom.triangle(160, 220, 200, 160, 240, 220, GfxColor.WHITE)

    # Degenerate triangles (flat)
    rom.triangle_fill(260, 200, 300, 200, 280, 200, GfxColor.RED)

    return rom


def test_clipping(width=320, height=240):
    """Test 4: Screen edge clipping"""
    rom = GfxTestROM(width, height, test_id=4)

    rom.clear(GfxColor.rgb565(0, 32, 0))

    # Lines extending beyond screen
    rom.line(-50, 50, 100, 50, GfxColor.RED)       # Left overflow
    rom.line(width - 50, 100, width + 50, 100, GfxColor.GREEN)  # Right overflow
    rom.line(160, -30, 160, 50, GfxColor.BLUE)     # Top overflow
    rom.line(200, height - 30, 200, height + 30, GfxColor.YELLOW)  # Bottom overflow

    # Diagonal crossing corners
    rom.line(-20, -20, 80, 80, GfxColor.CYAN)
    rom.line(width + 20, -20, width - 80, 80, GfxColor.MAGENTA)
    rom.line(-20, height + 20, 80, height - 80, GfxColor.WHITE)
    rom.line(width + 20, height + 20, width - 80, height - 80, GfxColor.ORANGE)

    # Rectangles partially off-screen
    rom.rect_fill(-30, 120, 60, 50, GfxColor.RED)
    rom.rect_fill(width - 30, 120, 60, 50, GfxColor.GREEN)
    rom.rect_fill(120, -20, 80, 50, GfxColor.BLUE)
    rom.rect_fill(120, height - 30, 80, 50, GfxColor.YELLOW)

    # Circles at corners
    rom.circle_fill(0, 0, 40, GfxColor.rgb565(128, 128, 0))
    rom.circle_fill(width - 1, 0, 40, GfxColor.rgb565(0, 128, 128))
    rom.circle_fill(0, height - 1, 40, GfxColor.rgb565(128, 0, 128))
    rom.circle_fill(width - 1, height - 1, 40, GfxColor.rgb565(128, 128, 128))

    # Center marker
    cx, cy = width // 2, height // 2
    rom.circle(cx, cy, 20, GfxColor.WHITE)
    rom.line(cx - 30, cy, cx + 30, cy, GfxColor.WHITE)
    rom.line(cx, cy - 30, cx, cy + 30, GfxColor.WHITE)

    return rom


def test_stress(width=320, height=240):
    """Test 5: Stress test with many primitives"""
    rom = GfxTestROM(width, height, test_id=5)

    rom.clear(GfxColor.BLACK)

    # Many rectangles
    for i in range(50):
        x = (i * 17) % (width - 30)
        y = (i * 23) % (height - 30)
        w = 10 + (i % 20)
        h = 10 + (i % 15)
        color = GfxColor.rgb565((i * 5) % 256, (i * 7) % 256, (i * 11) % 256)
        if i % 2 == 0:
            rom.rect_fill(x, y, w, h, color)
        else:
            rom.rect(x, y, w, h, color)

    # Many circles
    for i in range(30):
        cx = 30 + (i * 31) % (width - 60)
        cy = 30 + (i * 37) % (height - 60)
        r = 5 + (i % 20)
        color = GfxColor.rgb565((i * 13) % 256, (i * 17) % 256, (i * 19) % 256)
        if i % 2 == 0:
            rom.circle_fill(cx, cy, r, color)
        else:
            rom.circle(cx, cy, r, color)

    # Many lines
    for i in range(100):
        x1 = (i * 7) % width
        y1 = (i * 11) % height
        x2 = (i * 13 + 50) % width
        y2 = (i * 17 + 30) % height
        color = GfxColor.rgb565((i * 3) % 256, (i * 5) % 256, (i * 7) % 256)
        rom.line(x1, y1, x2, y2, color)

    return rom


def test_all(width=320, height=240):
    """Test 6: Combined test with all primitives"""
    rom = GfxTestROM(width, height, test_id=6)

    rom.clear(GfxColor.rgb565(16, 16, 32))

    # Checkerboard background in corner
    for i in range(8):
        for j in range(8):
            if (i + j) % 2 == 0:
                rom.rect_fill(10 + i * 10, 10 + j * 10, 10, 10, GfxColor.rgb565(64, 64, 64))

    # Color bars
    colors = [GfxColor.RED, GfxColor.GREEN, GfxColor.BLUE, GfxColor.YELLOW,
              GfxColor.CYAN, GfxColor.MAGENTA, GfxColor.WHITE]
    bar_width = 30
    for i, c in enumerate(colors):
        rom.rect_fill(100 + i * bar_width, 10, bar_width - 2, 70, c)

    # Concentric circles
    cx, cy = 60, 160
    for r in range(50, 5, -10):
        color = GfxColor.rgb565(r * 5, 255 - r * 5, 128)
        rom.circle_fill(cx, cy, r, color)

    # Triangle fan
    import math
    fcx, fcy = 200, 160
    for i in range(6):
        a1 = i * 60 * math.pi / 180
        a2 = (i + 1) * 60 * math.pi / 180
        x1 = int(fcx + 50 * math.cos(a1))
        y1 = int(fcy + 50 * math.sin(a1))
        x2 = int(fcx + 50 * math.cos(a2))
        y2 = int(fcy + 50 * math.sin(a2))
        color = GfxColor.rgb565(i * 40, 255 - i * 40, 128)
        rom.triangle_fill(fcx, fcy, x1, y1, x2, y2, color)

    # Grid lines
    for x in range(0, width, 20):
        rom.vline(x, height - 30, height, GfxColor.GRAY)
    for y in range(height - 30, height, 5):
        rom.hline(0, width, y, GfxColor.GRAY)

    # Border
    rom.rect(0, 0, width, height, GfxColor.WHITE)

    return rom


# =============================================================================
# Main
# =============================================================================

TEST_SUITES = {
    'primitives': (test_primitives, "Basic primitives (pixels, lines, rects, circles)"),
    'lines': (test_lines, "Line rendering (radial pattern)"),
    'triangles': (test_triangles, "Triangle rendering (outlines and fills)"),
    'clipping': (test_clipping, "Screen edge clipping"),
    'stress': (test_stress, "Stress test (many primitives)"),
    'all': (test_all, "Combined test (all primitives)"),
}

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <output_dir> [width] [height]")
        print(f"\nGenerates all graphics test ROMs to <output_dir>/")
        print(f"\nAvailable tests:")
        for name, (_, desc) in TEST_SUITES.items():
            print(f"  {name}: {desc}")
        sys.exit(1)

    output_dir = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 320
    height = int(sys.argv[3]) if len(sys.argv) > 3 else 240

    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating graphics tests ({width}x{height}):")
    for name, (gen_func, desc) in TEST_SUITES.items():
        rom = gen_func(width, height)
        filename = os.path.join(output_dir, f"gfx_{name}.gfx")
        size = rom.save(filename)
        print(f"  {name}: {filename} ({size} bytes, {len(rom.commands)} cmds)")

    print(f"\nGenerated {len(TEST_SUITES)} test ROMs")


if __name__ == '__main__':
    main()
