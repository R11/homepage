(function () {
    var mod = R11.modifyWith,
        platform = (nwf && !window.wiiu) ? "wiiu": (window.wiiu) ? "wiiuBrowser": "pc",
        hud = R11.hud,
        ctx = hud.ctx,
        canvas = hud.canvas,
        backgroundCanvas = R11.getCanvas("background", 1),
        backgroundCtx = backgroundCanvas.ctx,
        controller = R11.controller,
        flag = {
            mousedown: false,
            mouseup: true,
            click: false,
            mouseover: false,
            keydown: false,
            keypress: false,
            modifier: "",
            eraser: false
        };
    var saves = {};
    saves.retrieve = function (file) {
        return JSON.parse(localStorage.getItem(file)) || false;
    };
    saves.create = function (file, value) {
        return localStorage.setItem(file, JSON.stringify(value));
    };
    saves.clearAll = function () {
        return localStorage.clear();
    };
    saves.remove = function (file) {
        return localStorage.removeItem(file);
    };
    var makeButton = function (color, text) {
        var c = R11.getCanvas("buffer", 0, false),
            bctx = c.ctx,
            x = 0,
            y = 0,
            w = 400,
            h = 400,
            img = new Image();
        img.w = w;
        img.h = h;
        img.onload = function () {
        
        }
        bctx.clearRect(0, 0, 500, 500);
        bctx.fillStyle = color || "grey";
        bctx.fillRect(x, y, w, h);
        img.src = c.toDataURL();
        return img;
    };
    var Text = function () {};
    Text.prototype = {
        text: "",
        x: 0,
        y: 0,
        w: 50,
        h: 50,
        spacing: 15,
        leading: 15,
        strokeStyle: "black",
        ctx: ctx,
        lineWidth: 10,
    //    constrain: win,
        justify: "left",
        ratiow: 0.8,
        ratioh: 0.6
    };
    var DefaultButton = function () {};
    DefaultButton.prototype = {
        x: 0,
        y: 0,
        w: 50,
        h: 50,
        on: 1,
        hoverimg: makeButton("orange"),
        clickimg: makeButton("red"),
        idleimg: makeButton("blue"),
        textcoloridle: "red",
        textcolorhover: "black",
        textcolorclick: "white",
        textw: 0.7,
        texth: 0.7,
        canvas: canvas,
        ctx: ctx,
        id: "",
        drawText: function (style) {
            var w = this.w,
                h = this.h,
                text = this.text,
                l = text.length,
                length, space,
                newText = {
                    text: this.text,
                    w: (w / l) * this.textw,
                    h: h * this.texth,
                    ctx: this.ctx,
                    strokeStyle: this["textcolor" + style] || this.textcolor || "black",
                    lineWidth: this.lineWidth
                };
            length = R11.fontFunction.getLength(text, newText.w, newText.h),
            space = (w - (w * 0.05) - length) / (l - 1);
            newText.spacing = space > 1 ? space: 1;
            newText.x = this.x + w * 0.1,
            newText.y = this.y + newText.h / 4;
            ctx.save();
            this.rotate && ctx.rotate(this.rotate);
            this.rotate && ctx.translate(newText.x + newText.w, newText.y)
            R11.fontFunction.drawText(newText);
            ctx.restore();
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
        },
        onload: function (ctx) {
            var sfiles = saves.retrieve(this.id);
            
            this.ctx = ctx;
            this.ctx.lineWidth = this.lineWidth = 8;
            
            sfiles && mod(sfiles, this);
            
            
            this.setStyle("idle");
        }
    };


    var win = {
            x: 0,
            y: 0,
            w: window.innerWidth,
            h: window.innerHeight
        },
        homeButton = mod({
                text: "home",
                w: 200,
                mouseup: function () {
                    hud.deleteButtons();
                    controller.loadEvents(false);
                    ctx.clearAll();
                    hud.addButton(drawButton);
                 }
        }, new DefaultButton),
        drawSurface = function (c) {
            var grid = new R11.Grid(),
                w = grid.width,
                drawKeys = {
                    gridExpand: function () {
                        grid.update(1);
                        w = grid.width;
                    },
                    gridReduce: function () {
                        grid.update(-1);
                        w = grid.width;
                    },
                    toggleGrid: function (t) {
                        grid.canvas.toggle(t);
                    },
                    gridShift: function (){ //I need to learn to shift the grid itself
                        var x = grid.offsetx + 5;
                        grid.offsetx = (x > w) ? 0: x;
                        console.log('change');
                        grid.update();
                    },
                    drawLine: function () {
                        flag.modifier = "line";
                    },
                    save: (function () {
                        var n = 0, saves = localStorage.images || (localStorage.images = {}), img,
                            test = function () {
                                saves[n] && (n += 1) && test();
                            };
                       
                        return function () {
                            img = c.toDataURL();
                            test();
                            saves[n] = img;
                            console.log(n);
                        }
                    })(),
                    clearSaves: function () {
                        localStorage.clear();
                    },
                    eraser: function () {
                        flag.eraser = true;
                    }
                },
                gridUpButton = mod({
                    text: "+",
                    x: 0,
                    y: 200,
                    h: 50,
                    w: 50,
                    mouseup: function () {
                        drawKeys.gridExpand();
                    }
                }, new DefaultButton),

                gridDownButton = mod({
                    text: "-",
                    x: gridUpButton.x,
                    y: gridUpButton.y + gridUpButton.h + 200,
                    h: gridUpButton.h,
                    w: gridUpButton.w,
                    mouseup: function () {
                        drawKeys.gridReduce();
                    }
                }, new DefaultButton),
                gridToggleButton = mod({
                    text: "grid",
                    rotate: 90,
                    x: gridUpButton.x,
                    y: gridUpButton.y + gridUpButton.h,
                    w: gridUpButton.w,
                    h: gridDownButton.y - gridUpButton.y - gridUpButton.h,
                    mouseup: function () {
                        drawKeys.toggleGrid();
                    }
                }, new DefaultButton);
            return {
                x: 0,
                y: 0,
                w: window.innerWidth,
                h: window.innerHeight,
                load: function () {
                    controller.loadEvents(drawKeys).loadKeys(R11.drawKeys[platform]);
                    hud.addButton(gridUpButton, gridDownButton, gridToggleButton);
                },
                mousemove: function (e) {
                    !e && (e = {});
                    var x = e.pageX || 0 + grid.offsetx,
                        y = e.pageY || 0 + grid.offsety,
                        endx = this.mousedown.endx,
                        endy = this.mousedown.endy;
                    if (flag.mousedown) {
                        !flag.eraser && (backgroundCtx.fillStyle = "black");
                        flag.eraser && (backgroundCtx.fillStyle = 'white');
                        (Math.abs(x - endx) > w || Math.abs(y - endy) > w) ?
                            c.drawLine(x, endx, y, endy, w):
                            c.drawPixel(x, y, w);
                        this.mousedown.endx = x;
                        this.mousedown.endy = y;
                    }
                },
                mouseout: function (e) {
                    flag.mousedown = false;
                },
                mousedown: function (e) {
                    !e && (e = {});
                    var x = this.mousedown.endx = (e.pageX || 0) + grid.offsetx,
                        y = this.mousedown.endy = (e.pageY || 0) + grid.offsety;
                    flag.mousedown = true;
                    c.drawPixel(x, y, w);
                    nwf && console.log("x: "+e.screenX+", y: " + e.screenY);
                },
                mouseup: function (e) {
                   flag.mousedown = false;
                },
                mousewheel: (function () {
                    var d, i;
                    return function (e) {
                    !e && (e = {});
                    d = e.wheelDelta || -e.detail || 0;
                    i = (d === 0) ? 0:
                            (d > 0) ? 1: -1;
                    !e.shiftKey && grid.update(i);
                    e.shiftKey && c;
                    w = grid.width;
                    }
                })(),
                contextmenu: function () { return false; }
            }
        },
        drawingSurface = new R11.Button(drawSurface(backgroundCanvas)),
        initDrawing = {
            x: 50,
            y: 250,
            w: 300,
            h: 100,
            text: "draw",
            hoverimg: makeButton("orange"),
            clickimg: makeButton("red"),
            idleimg: makeButton("blue"),
            textcoloridle: "red",
            textcolorhover: "black",
            textcolorclick: "white",
            mouseup: function () {
                hud.deleteButtons();
                ctx.clearAll();
                hud.addButton(drawingSurface, homeButton);
            },
        },
        drawButton = mod(initDrawing, new DefaultButton);

    welcomeMessage = mod({x: 30, y: 100, text: "welcome to somegamesimade.com"}, new Text);
    hud.addButton(drawButton);
    R11.fontFunction.drawText(welcomeMessage);
    
    window.onkeydown = function (e) {
        flag.keydown = true;
        controller.check(e);
    };
    window.onkeyup = function (e) {
        flag.keydown = false;
        flag.eraser = false;
    };
    
})();