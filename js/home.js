(function () {
    var mod = R11.modifyWith,
        platform = (nwf && !window.wiiu) ? "wiiu": (window.wiiu) ? "wiiuBrowser": "pc",
        hud = new R11.HUD,
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
            eraser: false,
            drawing: false,
            drawingAllowed: true
        };
    var saveSystem = R11.saveSystem;
    var Text = function () {
    };
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

    var homeButton = mod({
            text: "home",
            w: 50,
            h: 50,
            mouseup: function () {
                hud.deleteButtons();
                controller.loadEvents(false);
                ctx.clearAll();
                hud.addButton(drawButton);
            }
        }, new R11.Button),
        drawSurface = function (c) {
            var grid = new R11.Grid(),
                w = grid.width,
                abs = Math.abs,
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
                    mouseover: function () {
                        "use strict";
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mousedown: function () {
                        "use strict";
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mouseout: function () {
                        "use strict";
                        flag.drawing && (flag.drawingAllowed = true);
                    },
                    mouseup: function () {
                        !flag.drawing && drawKeys.gridExpand();
                        flag.drawingAllowed = true;
                    }
                }, new R11.Button),

                gridDownButton = mod({
                    text: "-",
                    x: gridUpButton.x,
                    y: gridUpButton.y + gridUpButton.h + 200,
                    h: gridUpButton.h,
                    w: gridUpButton.w,
                    mouseover: function () {
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mousedown: function () {
                        "use strict";
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mouseout: function () {
                        "use strict";
                        flag.drawing && (flag.drawingAllowed = true);
                    },
                    mouseup: function () {
                        !flag.drawing && drawKeys.gridReduce();
                        flag.drawingAllowed = true;
                    }
                }, new R11.Button),
                gridToggleButton = mod({
                    text: "grid",
                    rotate: 90,
                    x: gridUpButton.x,
                    y: gridUpButton.y + gridUpButton.h,
                    w: gridUpButton.w,
                    h: gridDownButton.y - gridUpButton.y - gridUpButton.h,
                    mouseover: function () {
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mousedown: function () {
                        "use strict";
                        !flag.drawing && (flag.drawingAllowed = false);
                    },
                    mouseout: function () {
                        "use strict";
                        flag.drawing && (flag.drawingAllowed = true);
                    },
                    mouseup: function () {
                        !flag.drawing && drawKeys.toggleGrid();
                        flag.drawingAllowed = true;
                    }
                }, new R11.Button);
            return {
                x: 0,
                y: 0,
                w: window.innerWidth,
                h: window.innerHeight,
                id: c.id + "DrawingSurface",
                default: false,
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
                    if (flag.drawing && flag.drawingAllowed) {
                        !flag.eraser && (backgroundCtx.fillStyle = "black");
                        flag.eraser && (backgroundCtx.fillStyle = 'white');
                        (abs(x - endx) > w || abs(y - endy) > w) ?
                            c.drawLine(x, endx, y, endy, w):
                            c.drawPixel(x, y, w);
                        this.mousedown.endx = x;
                        this.mousedown.endy = y;
                    }
                },
                mouseout: function (e) {
                    flag.mousedown = false;
                    flag.drawing = false;
                },
                mousedown: function (e) {
                    !e && (e = {});
                    var b = e.button || 0;
                    if (b === 1) {
                        drawKeys.toggleGrid();
                    } else if (b === 0 && flag.drawingAllowed) {
                        var x = this.mousedown.endx = (e.pageX || 0) + grid.offsetx,
                            y = this.mousedown.endy = (e.pageY || 0) + grid.offsety;
                        flag.mousedown = true;
                        flag.drawing = true;
                        c.drawPixel(x, y, w);
                        nwf && console.log("x: " + e.screenX + ", y: " + e.screenY);
                    }
                },
                mouseup: function (e) {
                    flag.mousedown = false;
                    flag.drawing = false;
                },
                mousewheel: (function () {
                    var d, i;
                    return function (e) {
                        !e && (e = {});
                        d = e.wheelDelta || -e.detail || 0;
                        i = (d === 0) ? 0 :
                            (d > 0) ? 1: -1;
                        !e.shiftKey && grid.update(i);
                        w = grid.width;
                    }
                })()
            }
        },
        drawingSurface = mod(drawSurface(backgroundCanvas), new R11.Button),
        initDrawing = {
            x: 50,
            y: 250,
            w: 300,
            h: 100,
            text: "draw",
            default: true,
            id: "initDrawButton",
            mouseup: function () {
                hud.deleteButtons();
                ctx.clearAll();
                hud.addButton(drawingSurface, homeButton);
            }
        },
        drawButton = mod(initDrawing, new R11.Button);
    backgroundCtx.lineWidth = 12;
    welcomeMessage = mod({x: 30, y: 100, ctx: backgroundCtx, text: "welcome to somegamesimade.com"}, new Text);
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
    window.oncontextmenu = function () {
        return false;
    };
})();

/// I want to make right-click create a context menu. give the option to edit canvas, clear, etc.
//// after that I need to figure out how to layer.