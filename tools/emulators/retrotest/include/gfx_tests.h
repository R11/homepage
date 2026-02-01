/**
 * RetroTest Graphics Test Protocol
 *
 * Cross-platform graphics test commands that mock cores interpret.
 * Each command is 16 bytes for easy parsing.
 */

#ifndef GFX_TESTS_H
#define GFX_TESTS_H

#include <stdint.h>

/* Command types */
#define GFX_CMD_END         0x00  /* End of command list */
#define GFX_CMD_CLEAR       0x01  /* Clear screen to color */
#define GFX_CMD_PIXEL       0x02  /* Draw single pixel */
#define GFX_CMD_LINE        0x03  /* Draw line */
#define GFX_CMD_RECT        0x04  /* Draw rectangle (outline) */
#define GFX_CMD_RECT_FILL   0x05  /* Draw filled rectangle */
#define GFX_CMD_CIRCLE      0x06  /* Draw circle (outline) */
#define GFX_CMD_CIRCLE_FILL 0x07  /* Draw filled circle */
#define GFX_CMD_TRI         0x08  /* Draw triangle (outline) */
#define GFX_CMD_TRI_FILL    0x09  /* Draw filled triangle */
#define GFX_CMD_SPRITE      0x0A  /* Draw sprite from pattern */
#define GFX_CMD_HLINE       0x0B  /* Optimized horizontal line */
#define GFX_CMD_VLINE       0x0C  /* Optimized vertical line */
#define GFX_CMD_POLY        0x0D  /* Draw polygon (N vertices) */
#define GFX_CMD_FRAME       0x0E  /* Advance frame (for multi-frame tests) */
#define GFX_CMD_GRADIENT    0x0F  /* Draw gradient rectangle */

/* 16-byte command structure */
typedef struct {
    uint8_t  cmd;       /* Command type */
    uint8_t  flags;     /* Command-specific flags */
    uint16_t color;     /* RGB565 color */
    int16_t  x1, y1;    /* First point / position */
    int16_t  x2, y2;    /* Second point / size */
    int16_t  x3, y3;    /* Third point (triangles) / extra params */
} gfx_cmd_t;

/* Flags for various commands */
#define GFX_FLAG_BLEND      0x01  /* Alpha blend */
#define GFX_FLAG_CLIP       0x02  /* Clip to screen bounds */
#define GFX_FLAG_AA         0x04  /* Anti-aliased (if supported) */
#define GFX_FLAG_DITHER     0x08  /* Dithered rendering */

/* Color helpers (RGB565) */
#define GFX_RGB565(r, g, b) (((r) >> 3) << 11 | ((g) >> 2) << 5 | ((b) >> 3))
#define GFX_BLACK   0x0000
#define GFX_WHITE   0xFFFF
#define GFX_RED     0xF800
#define GFX_GREEN   0x07E0
#define GFX_BLUE    0x001F
#define GFX_YELLOW  0xFFE0
#define GFX_CYAN    0x07FF
#define GFX_MAGENTA 0xF81F
#define GFX_GRAY    0x8410

/* Test suite IDs */
#define GFX_TEST_PRIMITIVES  0x01  /* Basic shapes */
#define GFX_TEST_LINES       0x02  /* Line rendering */
#define GFX_TEST_TRIANGLES   0x03  /* Triangle fill */
#define GFX_TEST_CLIPPING    0x04  /* Screen edge clipping */
#define GFX_TEST_BLEND       0x05  /* Alpha blending */
#define GFX_TEST_STRESS      0x06  /* Performance stress test */

/**
 * Software renderer context (for mock cores)
 */
typedef struct {
    uint16_t* framebuffer;
    int width;
    int height;
    int pitch;  /* In pixels */
} gfx_context_t;

/* Software renderer functions (implemented in gfx_soft.c) */
#ifdef GFX_IMPLEMENTATION

static inline void gfx_put_pixel(gfx_context_t* ctx, int x, int y, uint16_t color) {
    if (x >= 0 && x < ctx->width && y >= 0 && y < ctx->height) {
        ctx->framebuffer[y * ctx->pitch + x] = color;
    }
}

static inline uint16_t gfx_get_pixel(gfx_context_t* ctx, int x, int y) {
    if (x >= 0 && x < ctx->width && y >= 0 && y < ctx->height) {
        return ctx->framebuffer[y * ctx->pitch + x];
    }
    return 0;
}

static void gfx_clear(gfx_context_t* ctx, uint16_t color) {
    for (int i = 0; i < ctx->height * ctx->pitch; i++) {
        ctx->framebuffer[i] = color;
    }
}

static void gfx_hline(gfx_context_t* ctx, int x1, int x2, int y, uint16_t color) {
    if (y < 0 || y >= ctx->height) return;
    if (x1 > x2) { int t = x1; x1 = x2; x2 = t; }
    if (x1 < 0) x1 = 0;
    if (x2 >= ctx->width) x2 = ctx->width - 1;
    for (int x = x1; x <= x2; x++) {
        ctx->framebuffer[y * ctx->pitch + x] = color;
    }
}

static void gfx_vline(gfx_context_t* ctx, int x, int y1, int y2, uint16_t color) {
    if (x < 0 || x >= ctx->width) return;
    if (y1 > y2) { int t = y1; y1 = y2; y2 = t; }
    if (y1 < 0) y1 = 0;
    if (y2 >= ctx->height) y2 = ctx->height - 1;
    for (int y = y1; y <= y2; y++) {
        ctx->framebuffer[y * ctx->pitch + x] = color;
    }
}

/* Bresenham line algorithm */
static void gfx_line(gfx_context_t* ctx, int x1, int y1, int x2, int y2, uint16_t color) {
    int dx = x2 - x1;
    int dy = y2 - y1;
    int sx = (dx > 0) ? 1 : -1;
    int sy = (dy > 0) ? 1 : -1;
    dx = (dx > 0) ? dx : -dx;
    dy = (dy > 0) ? dy : -dy;

    int err = dx - dy;
    int x = x1, y = y1;

    while (1) {
        gfx_put_pixel(ctx, x, y, color);
        if (x == x2 && y == y2) break;
        int e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx)  { err += dx; y += sy; }
    }
}

static void gfx_rect(gfx_context_t* ctx, int x, int y, int w, int h, uint16_t color) {
    gfx_hline(ctx, x, x + w - 1, y, color);
    gfx_hline(ctx, x, x + w - 1, y + h - 1, color);
    gfx_vline(ctx, x, y, y + h - 1, color);
    gfx_vline(ctx, x + w - 1, y, y + h - 1, color);
}

static void gfx_rect_fill(gfx_context_t* ctx, int x, int y, int w, int h, uint16_t color) {
    for (int row = y; row < y + h; row++) {
        gfx_hline(ctx, x, x + w - 1, row, color);
    }
}

/* Midpoint circle algorithm */
static void gfx_circle(gfx_context_t* ctx, int cx, int cy, int r, uint16_t color) {
    int x = r, y = 0;
    int err = 1 - r;

    while (x >= y) {
        gfx_put_pixel(ctx, cx + x, cy + y, color);
        gfx_put_pixel(ctx, cx - x, cy + y, color);
        gfx_put_pixel(ctx, cx + x, cy - y, color);
        gfx_put_pixel(ctx, cx - x, cy - y, color);
        gfx_put_pixel(ctx, cx + y, cy + x, color);
        gfx_put_pixel(ctx, cx - y, cy + x, color);
        gfx_put_pixel(ctx, cx + y, cy - x, color);
        gfx_put_pixel(ctx, cx - y, cy - x, color);
        y++;
        if (err < 0) {
            err += 2 * y + 1;
        } else {
            x--;
            err += 2 * (y - x) + 1;
        }
    }
}

static void gfx_circle_fill(gfx_context_t* ctx, int cx, int cy, int r, uint16_t color) {
    int x = r, y = 0;
    int err = 1 - r;

    while (x >= y) {
        gfx_hline(ctx, cx - x, cx + x, cy + y, color);
        gfx_hline(ctx, cx - x, cx + x, cy - y, color);
        gfx_hline(ctx, cx - y, cx + y, cy + x, color);
        gfx_hline(ctx, cx - y, cx + y, cy - x, color);
        y++;
        if (err < 0) {
            err += 2 * y + 1;
        } else {
            x--;
            err += 2 * (y - x) + 1;
        }
    }
}

/* Triangle outline */
static void gfx_triangle(gfx_context_t* ctx, int x1, int y1, int x2, int y2, int x3, int y3, uint16_t color) {
    gfx_line(ctx, x1, y1, x2, y2, color);
    gfx_line(ctx, x2, y2, x3, y3, color);
    gfx_line(ctx, x3, y3, x1, y1, color);
}

/* Filled triangle using scanline algorithm */
static void gfx_triangle_fill(gfx_context_t* ctx, int x1, int y1, int x2, int y2, int x3, int y3, uint16_t color) {
    /* Sort vertices by Y */
    if (y1 > y2) { int t; t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; }
    if (y1 > y3) { int t; t = x1; x1 = x3; x3 = t; t = y1; y1 = y3; y3 = t; }
    if (y2 > y3) { int t; t = x2; x2 = x3; x3 = t; t = y2; y2 = y3; y3 = t; }

    if (y1 == y3) {
        /* Degenerate triangle */
        int minx = x1 < x2 ? (x1 < x3 ? x1 : x3) : (x2 < x3 ? x2 : x3);
        int maxx = x1 > x2 ? (x1 > x3 ? x1 : x3) : (x2 > x3 ? x2 : x3);
        gfx_hline(ctx, minx, maxx, y1, color);
        return;
    }

    /* Compute inverse slopes */
    int dy12 = y2 - y1;
    int dy13 = y3 - y1;
    int dy23 = y3 - y2;
    int dx12 = x2 - x1;
    int dx13 = x3 - x1;
    int dx23 = x3 - x2;

    /* Rasterize upper part (y1 to y2) */
    for (int y = y1; y < y2; y++) {
        int xa = x1 + dx13 * (y - y1) / dy13;
        int xb = x1 + dx12 * (y - y1) / dy12;
        if (xa > xb) { int t = xa; xa = xb; xb = t; }
        gfx_hline(ctx, xa, xb, y, color);
    }

    /* Rasterize lower part (y2 to y3) */
    for (int y = y2; y <= y3; y++) {
        int xa = x1 + dx13 * (y - y1) / dy13;
        int xb = (dy23 != 0) ? x2 + dx23 * (y - y2) / dy23 : x2;
        if (xa > xb) { int t = xa; xa = xb; xb = t; }
        gfx_hline(ctx, xa, xb, y, color);
    }
}

/* Execute a command list */
static int gfx_execute_commands(gfx_context_t* ctx, const gfx_cmd_t* cmds, int max_cmds) {
    int frames = 1;
    for (int i = 0; i < max_cmds; i++) {
        const gfx_cmd_t* c = &cmds[i];
        switch (c->cmd) {
            case GFX_CMD_END:
                return frames;
            case GFX_CMD_CLEAR:
                gfx_clear(ctx, c->color);
                break;
            case GFX_CMD_PIXEL:
                gfx_put_pixel(ctx, c->x1, c->y1, c->color);
                break;
            case GFX_CMD_LINE:
                gfx_line(ctx, c->x1, c->y1, c->x2, c->y2, c->color);
                break;
            case GFX_CMD_RECT:
                gfx_rect(ctx, c->x1, c->y1, c->x2, c->y2, c->color);
                break;
            case GFX_CMD_RECT_FILL:
                gfx_rect_fill(ctx, c->x1, c->y1, c->x2, c->y2, c->color);
                break;
            case GFX_CMD_CIRCLE:
                gfx_circle(ctx, c->x1, c->y1, c->x2, c->color);
                break;
            case GFX_CMD_CIRCLE_FILL:
                gfx_circle_fill(ctx, c->x1, c->y1, c->x2, c->color);
                break;
            case GFX_CMD_TRI:
                gfx_triangle(ctx, c->x1, c->y1, c->x2, c->y2, c->x3, c->y3, c->color);
                break;
            case GFX_CMD_TRI_FILL:
                gfx_triangle_fill(ctx, c->x1, c->y1, c->x2, c->y2, c->x3, c->y3, c->color);
                break;
            case GFX_CMD_HLINE:
                gfx_hline(ctx, c->x1, c->x2, c->y1, c->color);
                break;
            case GFX_CMD_VLINE:
                gfx_vline(ctx, c->x1, c->y1, c->y2, c->color);
                break;
            case GFX_CMD_FRAME:
                frames++;
                break;
            default:
                /* Unknown command, skip */
                break;
        }
    }
    return frames;
}

#endif /* GFX_IMPLEMENTATION */

#endif /* GFX_TESTS_H */
