R11.Button = function (obj) {
    this.x = obj.x || 0;
    this.y = obj.y || 0;
    this.w = obj.w || 100;
    this.h = obj.h || 100;
    this.r = obj.r || null;
    this.text = (typeof obj.text === "function") ? obj.text():
                (obj.text) ? obj.text:
                false;
    this.textcolor = this.textcoloridle = obj.textcoloridle || obj.textcolor || "black";
    this.textcolorhover = obj.textcolorhover || this.textcolor;
    this.textcolorclick = obj.textcolorclick || this.textcolor;
    this.textw = obj.textw || 0.7;
    this.texth = obj.texth || 0.7;
    
    this.hoverimg = obj.hoverimg || false;
    this.clickimg = obj.clickimg || false;
    this.idleimg = obj.idleimg || false;

 //   this.canvas = obj.canvas || R11.getCanvas("HUD", 99);
 //   this.ctx = this.canvas.ctx || this.canvas.init().ctx;    
    this.on = (obj.on === 0) ? 0: 1;
    this.pressed = 0;
    
    this.canvas = obj.canvas || R11.getCanvas("HUD", 99);
    this.ctx = this.canvas.ctx;
    
    this.onload = function (ctx) {
        this.ctx = ctx;
        this.ctx.lineWidth = this.lineWidth = 8;
        this.setStyle("idle");
    },
    
    this.click = obj.click || null;
    this.dblclick = obj.dblclick || null;
    this.load = obj.load || function () {return};
    this.mousedown = obj.mousedown || null;
    this.mouseup = obj.mouseup || null;
    this.mousemove = obj.mousemove || null;
    this.mouseout = obj.mouseout || null;
    this.mouseover = obj.mouseover || null;
    this.mousewheel = obj.mousewheel || null;
    this.contextmenu = obj.contextmenu || window.oncontextmenu || null;
    return this;
}

R11.Button.prototype = {
    drawText: function (style) {
        var w = this.w,
            h = this.h,
            text = this.text,
            l = text.length,
            length,
            newText = {
                text: this.text,
                w: (w / l) * this.textw,
                h: h * this.texth,
                ctx: this.ctx,
                strokeStyle: this["textcolor" + style] || this.textcolor || "black",
                lineWidth: this.lineWidth
            };
        length = R11.fontFunction.getLength(text, newText.w, newText.h),
        newText.spacing = (w - (w * 0.05) - length) / (l - 1);
        newText.x = this.x + w * 0.1,
        newText.y = this.y + newText.h / 4;
        R11.fontFunction.drawText(newText);
        
    },
    placeImg: function (img) {
        var ctx = this.ctx;
        ctx.drawImage(img, img.x, img.y, img.w || 100, img.h || 100, this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.strokeStyle || "black";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    },
    setStyle: function (style) {
        this[style + "img"] && this.placeImg(this[style + "img"]);
        this.text && this.drawText(style);
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
    }
}
