R11.HUD = function (obj) {
    !obj && (obj = {});
    var that = this;

    this.canvas = obj.canvas || R11.getCanvas("HUD", 90);
    this.ctx = this.canvas.ctx || this.canvas.init().ctx;
    this.buttonSelected = false;
    this.buttons = {};  // the collection of things to be drawn
    this.idIncrement = 0;

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
    checkButtons: function (f, e) {
        var buttons = this.buttons,
            idx,
            checkF = this.checkF,
            x = e.pageX || 0,
            y = e.pageY || 0;
        for (idx in buttons) {
            if (buttons.hasOwnProperty(idx) && buttons[idx].on) {
                (this.contains(buttons[idx], x, y) && checkF(buttons[idx], f, e))
                || checkF(buttons[idx], "mouseout");
            }
        }
        return this;
    },
    addButton: function () {
        var l = arguments.length - 1,
            b = this.buttons,
            i, a;
        for (i = 0; i <= l; i += 1) {
            a = arguments[i];
            this.buttons[a.id || this.idIncrement++] = a;
            this.checkF(a, "load", a.canvas || this.canvas || R11.getCanvas("HUD", 99));
        }
        return this;
    },
    disableButton: function () {
        var l = arguments.length - 1,
            b = this.buttons,
            i, a;
        for (i = 0; i <= l; i += 1) {
            a = b[i];
            a.on = false;
            a.canvas.toggle(false);
        }
        return this;
    },
    toggleButton: function (button, toggle) {
        !toggle && (toggle = false);
        button.on = toggle;
        button.canvas.toggle(toggle);
        return this;
    },
    checkF: function (b, f, a) {
        if (f && b && b.on) {
            typeof b["on" + f] === "function" && b["on" + f](a);
            typeof b[f] === "function" && b[f](a);
        }
        return this;
    },
    addButton2: function () {
        var length = arguments.length, b;
        if (length > 0) {
            for (var l = length - 1; l >= 0; l--) {
                b = arguments[l];
                this.buttons.push(b);
                this.checkF(b, "onload", b.canvas || this.canvas);//.checkF(b, "load");
            }
        } else {
            b = arguments;
            this.buttons.push(b);
            this.checkF(b, "onload", b.canvas || this.canvas);//.checkF(b, "load");
        }
        return this;
    },
    checkButton: function (f, e) {
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
    deleteButtons: function () {
        this.buttons = null;
        this.buttons = {};
        return this;
    },
    contains: function (box, x, y) {
        return (box.x <= x) && (box.x + box.w >= x) &&
            (box.y <= y) && (box.y + box.h >= y);
    }
}


R11.hud = new R11.HUD;