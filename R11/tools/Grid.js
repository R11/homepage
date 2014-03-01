R11.Grid = function (obj) {
    obj && R11.modifyWith(obj, this);
    this.init();
}

R11.Grid.prototype = {
    canvas: false,
    ctx: false,
    offsetx: 0,
    offsety: 0,
    x: 0,
    y: 0,
    w: window.innerWidth,
    h: window.innerHeight,
    max: 8,
    min: 0,
    zoom: 4,
    canvasZoom: 4,
    width: 8,
    zIndex: 3,
    id: "grid",
    init: function () {
        !this.canvas &&
            (this.canvas = R11.getCanvas("grid", 80));//new R11.Canvas({ id: this.id, zIndex: this.zIndex, buffer: false}));
        !this.ctx &&
            (this.ctx = this.canvas.ctx || this.canvas.init().ctx);
        this.update();
        return this;
    },
    color: "black",
    setColor: function (color) {
        this.ctx.fillStyle = color || this.color || "black";
        return this;
    },
    update: function (z) {
        var f, e,
            t = 0.6,
            ctx = this.ctx,
            x = f = this.x,
            y = e = this.y,
            w = this.w,
            h = this.h,
            width = this.width = this.setBit(z || 0);
        ctx.fillStyle = this.setColor();
        ctx.clearRect(x, y, w, h);
        if (width >= 2) {
            for (; f <= w; f += width) {
                ctx.fillRect(f, y, t, h);
            }
            for (; e <= h; e += width) {
                ctx.fillRect(x, e, w, t);
            }
        }
        return this;
    },
    setBit: function (t) {
        var g = this.zoom + t,
            min = this.min,
            max = this.max;
        this.zoom = (!g || g <= min) ? min:
                        (g >= max) ? max:
                            g;
        return Math.pow(2, this.zoom);
    },
    reset: function () {
        this.zoom = this.canvasZoom || this.zoom;
        this.update();
        return this;
    }
};

R11.grid = function (c) {
    !c && (c = {});
    var canvas = R11.getCanvas("grid" + (c.id || "blank"), ((c.style && c.style.zIndex) || 50) + 1),
        ctx = canvas.ctx,
        x = c.x || 0,
        y = c.y || 0,
        w = c.width || 100,
        h = c.height || 100,
        t = 0.6,
        update = function (z) {
            var dx = x, dy = y,
                t = 0.6,
                width = this.width = this.setBit(z || 0);
            ctx.clearRect(x, y, w, h);
            if (width >= 2) {
                for (; dx <= w; dx += width) {
                    ctx.fillRect(dx, y, t, h);
                }
                for (; dy <= h; dy += width) {
                    ctx.fillRect(x, dy, w, t);
                }
            }
            return this;
        };
    return {
        max: 8,
        min: 0,
        zoom: 4,
        canvasZoom: 4,
        width: 8,
        zIndex: 3,
        id: "grid",
        update: update,
        setBit: function (t) {
            var g = this.zoom + t,
                min = this.min,
                max = this.max;
            this.zoom = (!g || g <= min) ? min:
                            (g >= max) ? max:
                                g;
            return Math.pow(2, this.zoom);
        },
        reset: function () {
            this.zoom = this.canvasZoom || this.zoom;
            this.update();
            return this;
        }
    }
}