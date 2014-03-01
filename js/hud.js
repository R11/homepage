R11.HUD = function (obj) {
    !obj && (obj = {});
    var that = this;

    this.canvas = obj.canvas || R11.getCanvas("HUD", 90);
    this.ctx = this.canvas.ctx || this.canvas.init().ctx;
    this.buttonSelected = false;
    this.buttons = [];  // the collection of things to be drawn

    this.canvas.onmousedown = function (e) {
        that.checkButtons("mousedown", e);
    };
    this.canvas.onmousemove = function (e) {
        that.checkButtons("mousemove", e);
    };
    this.canvas.onmouseover = function (e) {
        that.checkButtons("mouseover", e);
    };
    this.canvas.onmouseup = function (e) {
        that.checkButtons("mouseup", e);
    };
    this.canvas.onmouseout = function (e) {
        that.checkButtons("mouseout", e);
    };
    this.canvas.ondblclick = function (e) {
        that.checkButtons("dblclick", e);
    };
    this.canvas.onkeydown = function (e) {
        that.checkButtons("keydown", e);
    };
    this.canvas.onkeyup = function (e) {
        that.checkButtons("keyup", e);
    };
    this.canvas.onmousewheel = function (e) {
        that.checkButtons("mousewheel", e);
    };
    if (window.wiiu) {
        window.setInterval(this.wiiu, 20);
    }
    return this;
}

R11.HUD.prototype = {
    loadButtons: function () {
        var button = this.buttons,
            b;
        for (var i = button.length - 1; i >= 0; i -= 1) {
            b = button[i];
            b.on && typeof b.onload === "function" && b.onload(this.ctx);
            b.on && typeof b.load === "function" && b.load();

        }
        return this;
    },
    checkButtons: function (f, e) {
        var button = this.buttons,
            b,
            func = "on" + f,
            x = e.pageX || 0,
            y = e.pageY || 0;
        if (button.length) {
            for (var i = button.length - 1; i >= 0; i -= 1) {
                b = button[i];
                if (b.on === 1 && this.contains(b, x, y)) {
                    b[func] && typeof b[func] === "function" && b[func](e);
                    b[f] && typeof b[f] === "function" && b[f](e);
                    this[func] = true;
                    this.buttonSelected = true;
                } else {
                    b.on && b["onmouseout"] && b["onmouseout"]();
                    this.buttonSelected = false;
                    this[func] = false;
                }
            }
        } else {
            console.log("no buttons")
        }
        return this;
    },
    addButton: function () {
        var length = arguments.length, b;
        if (length > 0) {
            for (var l = length - 1; l >= 0; l--) {
                b = arguments[l];
                this.buttons.push(b);
                b.on && typeof b.onload === "function" && b.onload(this.ctx);
                b.on && typeof b.load === "function" && b.load();
            }
        } else {
            b = arguments;
            this.buttons.push(b);
            b.on && typeof b.onload === "function" && b.onload(this.ctx);
            b.on && typeof b.load === "function" && b.load();
        }
        return this;
    },
    deleteButtons: function () {
        this.buttons = null;
        this.buttons = [];
        return this;
    },
    contains: function (box, x, y) {
        return (box.x <= x) && (box.x + box.w >= x) &&
            (box.y <= y) && (box.y + box.h >= y);
    }
}