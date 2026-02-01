/**
 * RetroForge Memory Management
 *
 * Cross-platform memory allocation and management.
 * Handles the unique memory architectures of retro consoles.
 */

#ifndef RETROFORGE_MEMORY_H
#define RETROFORGE_MEMORY_H

#include "../types/types.h"

/* ==========================================================================
   Memory Pool Types

   Retro consoles have multiple memory regions with different characteristics.
   This abstraction lets code request memory by type rather than address.
   ========================================================================== */

typedef enum {
    /* Main working memory - largest, general purpose */
    RF_MEM_MAIN,

    /* Fast memory - lower latency, often smaller */
    RF_MEM_FAST,

    /* Video memory - accessible by graphics hardware */
    RF_MEM_VIDEO,

    /* Audio memory - accessible by sound hardware */
    RF_MEM_AUDIO,

    /* Scratch memory - temporary, high-speed (cache, scratchpad) */
    RF_MEM_SCRATCH,

    RF_MEM_TYPE_COUNT
} rf_mem_type_t;

/* ==========================================================================
   Memory Region Info
   ========================================================================== */

typedef struct {
    void*    base;       /* Base address of region */
    uint32_t size;       /* Total size in bytes */
    uint32_t used;       /* Currently allocated bytes */
    uint32_t alignment;  /* Required alignment for this region */
    const char* name;    /* Human-readable name */
} rf_mem_region_t;

/* ==========================================================================
   Allocator Interface
   ========================================================================== */

/**
 * Initialize memory system
 * Must be called before any allocations
 */
void rf_mem_init(void);

/**
 * Shutdown memory system
 * Frees all allocations
 */
void rf_mem_shutdown(void);

/**
 * Allocate memory from specified pool
 *
 * @param type    Memory type to allocate from
 * @param size    Size in bytes
 * @param align   Alignment (0 for default)
 * @return        Pointer to allocated memory, or NULL on failure
 */
void* rf_alloc(rf_mem_type_t type, uint32_t size, uint32_t align);

/**
 * Free previously allocated memory
 */
void rf_free(void* ptr);

/**
 * Allocate and zero memory
 */
void* rf_calloc(rf_mem_type_t type, uint32_t count, uint32_t size, uint32_t align);

/**
 * Get info about a memory region
 */
const rf_mem_region_t* rf_mem_get_region(rf_mem_type_t type);

/**
 * Get total free space in a region
 */
uint32_t rf_mem_available(rf_mem_type_t type);

/* ==========================================================================
   Stack Allocator (Fast, LIFO)

   For temporary allocations within a frame or function.
   Very fast: just bump a pointer. Must free in reverse order.
   ========================================================================== */

typedef struct {
    uint8_t* base;
    uint8_t* current;
    uint8_t* end;
} rf_stack_alloc_t;

/**
 * Initialize a stack allocator with given buffer
 */
void rf_stack_init(rf_stack_alloc_t* stack, void* buffer, uint32_t size);

/**
 * Allocate from stack (returns NULL if out of space)
 */
void* rf_stack_alloc(rf_stack_alloc_t* stack, uint32_t size, uint32_t align);

/**
 * Get current stack position (for later reset)
 */
void* rf_stack_mark(rf_stack_alloc_t* stack);

/**
 * Reset stack to a previous position (frees everything after)
 */
void rf_stack_reset(rf_stack_alloc_t* stack, void* mark);

/**
 * Reset stack to beginning
 */
void rf_stack_clear(rf_stack_alloc_t* stack);

/* ==========================================================================
   Pool Allocator (Fixed-size blocks)

   For allocating many objects of the same size (entities, particles, etc.)
   O(1) alloc and free, no fragmentation.
   ========================================================================== */

typedef struct rf_pool_block {
    struct rf_pool_block* next;
} rf_pool_block_t;

typedef struct {
    rf_pool_block_t* free_list;
    void*     buffer;
    uint32_t  block_size;
    uint32_t  block_count;
    uint32_t  used_count;
} rf_pool_alloc_t;

/**
 * Initialize a pool allocator
 *
 * @param pool        Pool structure to initialize
 * @param buffer      Memory buffer for the pool
 * @param block_size  Size of each block (minimum sizeof(void*))
 * @param block_count Number of blocks
 */
void rf_pool_init(rf_pool_alloc_t* pool, void* buffer,
                  uint32_t block_size, uint32_t block_count);

/**
 * Allocate a block from the pool
 */
void* rf_pool_alloc(rf_pool_alloc_t* pool);

/**
 * Free a block back to the pool
 */
void rf_pool_free(rf_pool_alloc_t* pool, void* ptr);

/**
 * Check if pool has available blocks
 */
bool rf_pool_available(rf_pool_alloc_t* pool);

/* ==========================================================================
   Memory Copy/Set (Optimized per-platform)
   ========================================================================== */

/**
 * Copy memory (may use DMA on supported platforms)
 */
void rf_memcpy(void* dst, const void* src, uint32_t size);

/**
 * Set memory to value
 */
void rf_memset(void* dst, uint8_t value, uint32_t size);

/**
 * Zero memory
 */
void rf_memzero(void* dst, uint32_t size);

/**
 * Async DMA copy (returns immediately, use rf_dma_wait to sync)
 * Falls back to rf_memcpy on platforms without DMA
 */
void rf_dma_copy(void* dst, const void* src, uint32_t size);

/**
 * Wait for all pending DMA transfers to complete
 */
void rf_dma_wait(void);

#endif /* RETROFORGE_MEMORY_H */
