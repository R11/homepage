var nwf = nwf || {};

R11.Tileset = function (obj) {
    obj = obj || {};
    var id;
    this.id = obj.id || "tilesetDefault";
    id = this.id;
    this.canvas = obj.canvas || document.getElementById(id) || new R11.Canvas({id: id, hide: obj.show || null});
    this.canvas.id = id;
    if (obj.show) {
     //   document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.ctx || this.canvas.getContext("2d");
    this.ctx.lineWidth = obj.lineWidth || 5;
    this.w = obj.w || 32;
    this.h = obj.h || null;
    
    this.img = obj.img || new Image();
    this.font = obj.font || R11.FONT;
    if (typeof this.img === "string") {
        this.typeOut(this.img);
    }
    else {
        this.ctx.drawImage(this.img, 0, 0);
    }
    

   // this.make(this.w, this.h);
};

R11.Tileset.prototype = {
    make: function (w, h) {

    },
    row: 0,
    column: 0,
    defaultText: "**",
    typeOut: function (text) {
        text = text || this.defaultText;
        var i, pos, x, y,
            w = this.w,
            h = this.h,
            canvas = this.canvas.canvas,
            width = canvas.width,
            height = canvas.height,
            ctx = this.ctx,
            low = text.toLowerCase(),
            chr = low.split(""),
            num = chr.length;
   /*     for (i = 0; i < num; i+= 1) {
            ctx.save();
            x = i * w;
            if (x > width) {
                this.rows += 1;
                x = 0;
            }
            ctx.translate(x, ctx.lineWidth / 2 + h * this.row);
            ctx.beginPath();
            if (this.font[chr[i]]) {
                pos = this.font[chr[i]](ctx, h, w);
            }
            ctx.restore();
        }
        */
        var font = this.font;
        var idx, ix = 0, iy = 0;
        for (idx in font) {
            if (font.hasOwnProperty(idx)){
                ctx.save();
                x = this.column * w;
                if (x > width - w) {
                    this.row += 1;
                    x = 0;
                    this.column = 1;
                }
                else {
                    this.column += 1;
                }
                y = h * this.row;
                if (y > height - h) {
                    console.log(this.id + "  tileset is out of bounds")
                }
                ctx.translate(x, y);
                ctx.beginPath();
                pos = font[idx](ctx, h, w);
                ctx.restore();
            }
        }
    }
};

R11.go = function () {
    var img = new Image(),
        nums = {img: "1234567890:", w: 100, h: 110, id: "clock", show: true},
        tileset = new R11.Tileset(nums);
}
window.onload = R11.go;