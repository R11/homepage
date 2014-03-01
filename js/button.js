R11.Button = function () {
};
R11.Button.prototype = {
    x: 0,
    y: 0,
    w: 500,
    h: 500,
    on: 1,
    textw: 0.7,
    texth: 0.7,
    default: true,
    id: "",
    makeButton: function (style) {
        var w = 500,
            h = 500,
            x = 0,
            y = 0,
            text = this.text || false,
            l = text.length,
            canvas = R11.getCanvas("scratchPad", 0, false),
            ctx = canvas.ctx,
            newText,
            img = new Image();
        img.w = w;
        img.h = h;
        ctx.fillStyle = (!style || style === "idle") ? "blue" :
            (style === "hover") ? "orange" :
                "red";
        ctx.fillRect(x, y, w, h);

        if (text) {
            newText = {
                text: text,
                w: (w * this.textw) / l,
                h: h * this.texth,
                ctx: ctx
            };
            ctx.lineWidth = 10;
            ctx.strokeStyle = (!style || style === "idle") ? "red" :
                (style === "hover") ? "black" :
                    "white";
            newText.spacing = w * 0.1;
            newText.x = x + w * 0.1,
                newText.y = y + newText.h / 4;
            ctx.save();
            this.rotate && ctx.rotate(this.rotate);
            this.rotate && ctx.translate(newText.x + newText.w, newText.y)
            R11.fontFunction.drawText(newText);
            ctx.restore();
        }
        img.onload = function () {

        }
        img.src = canvas.toDataURL();
        return img;
    },
    placeImg: function (img) {
        var ctx = this.ctx;
        ctx.drawImage(img, img.x, img.y, img.w || 100, img.h || 100, this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.strokeStyle || "black";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    },
    setStyle: function (style) {
        if (this[style + "img"]) {
            this.placeImg(this[style + "img"]);
        } else if (this.default) {
            this[style + "img"] = this.makeButton(style);
        }
        return this;
    },
    onclick: function () {
    },
    ondblclick: function () {
    },
    onmousedown: function () {
        this.setStyle("click");
        this.pressed = 1;
    },
    onmouseup: function () {
        if (this.pressed === 1 && this.hover) {
            this.setStyle("hover");
        } else if (!this.hover) {
            this.setStyle("idle");
        }
        this.pressed = 0;
    },
    onmousemove: function () {
        if (!this.hover) {
            this.setStyle("hover");
            this.hover = true;
        }
    },
    onmouseout: function () {
        if (this.hover) {
            this.setStyle("idle");
            this.hover = false;
        }
    },
    onmouseover: function () {
        if (!this.hover) {
            this.setStyle("hover");
            this.hover = true;
        }
    },
    onmousewheel: function () {

    },
    onload: function (ctx) {
        var sfiles = R11.saveSystem.retrieve(this.id);

        this.ctx = ctx;
        this.ctx.lineWidth = this.lineWidth = 8;

        sfiles && R11.modifyWith(sfiles, this);

        this.setStyle("idle").setStyle("hover").setStyle("click").setStyle("idle");
    }
};