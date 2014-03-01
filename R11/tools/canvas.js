(function () {
R11.setProperties(HTMLCanvasElement.prototype, {
    init: function (id, z, hide) {
        if (!this.ctx) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.ctx = this.getContext('2d');
            this.ctx.clearAll = function () {
                this.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
      //      this.ctx.imageSmoothingEnabled = false;
            this.id = (this.id && this.id !== "") ? this.id: id || "blankID";
            var style = this.style;
            style.zIndex = z || 1;
            style.display = (hide !== false) ? "": "none";
            style.left = "0";
            style.top = "0";
            style.position = "absolute";
            document.body.appendChild(this);
        }
        return this;
    },
    resize: function () {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    },
    toggle: function (t) {// chrome bug (windows) - toggle doesn't take place until you click on screen
        if (this.style) {
            this.style.display = (t) ? '':
                    (t === 0 || t === false) ? 'none':
                    (this.style.display === '') ? 'none':
                                    '';
        }
        return this;
    },
    drawPixel: (function () {
        var f = Math.floor;
        return function (x, y, w, offx, offy) {
            !w && (w = 1);
            this.ctx.fillRect(f(x/w)*w + (offx || 0), f(y/w)*w + (offy || 0), w, w);
            return this;
        }
    })(),
    drawRangeX: function (slope, b, start, end, w, opty) {
        var i;
        for (i = start; i <= end; i += w) {
            this.drawPixel(i, opty || slope * i + b, w);
        }
    },
    drawRangeY: function (slope, b, start, end, w, optx) {
        var i;
        for (i = start; i <= end; i += w) {
            this.drawPixel(optx || ((i - b) / slope), i, w);
        }
    },
    drawLine: (function () {
        var slope, b, dx, dy,
            abs = Math.abs;
        return function (x1, x2, y1, y2, w) {
                dx = x1 - x2;
                dy = y1 - y2;
                slope = dy / dx;
                b = y1 - x1 * slope;
                (abs(slope) > 1) ?
                    (dy > 0) ? this.drawRangeY(slope, b, y2, y1, w, dx === 0 && x1):
                                this.drawRangeY(slope, b, y1, y2, w, dx === 0 && x1):
                    (dx > 0) ? this.drawRangeX(slope, b, x2, x1, w):
                                this.drawRangeX(slope, b, x1, x2, w);
                return this;
            }
    })(),
    save: function () {
        localStorage[this.id].lastSave = this.toDataURL();
        console.log(this.id + "  saved");
        return this;
    },
    initDrawing: function () {
        
    }
})
})();