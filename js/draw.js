R11.drawSurface = function (c) {
    var grid = new R11.Grid(),
        w = grid.width,
        abs = Math.abs,
        hud = R11.hud,
        platform = (nwf && !window.wiiu) ? "wiiu" : (window.wiiu) ? "wiiuBrowser" : "pc",
        mod = R11.modifyWith,
        backgroundCtx = c.ctx,
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
        },
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
            gridShift: function () { //I need to learn to shift the grid itself
                var x = grid.offsetx + 5;
                grid.offsetx = (x > w) ? 0 : x;
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
                };
            }()),
            clearSaves: function () {
                localStorage.clear();
            },
            eraser: function () {
                flag.eraser = true;
            }
        },
        gridBase = {
            mouseover: function () {
                !flag.drawing && (flag.drawingAllowed = false);
            },
            mousedown: function () {
                !flag.drawing && (flag.drawingAllowed = false);
            },
            mouseout: function () {
                flag.drawing && (flag.drawingAllowed = true);
            }
        },
        gridUpButton = mod({
            text: "+",
            x: 0,
            y: 200,
            h: 50,
            w: 50,
            id: "gridUp",
            mousover: gridBase.mouseover,
            mousedown: gridBase.mousedown,
            mouseout: gridBase.mouseout,
            mouseup: function () {
                !flag.drawing && drawKeys.gridExpand();
                flag.drawingAllowed = true;
            }
        }, new R11.Button()),
        gridDownButton = mod({
            text: "-",
            x: gridUpButton.x,
            y: gridUpButton.y + gridUpButton.h + 200,
            h: gridUpButton.h,
            w: gridUpButton.w,
            id: "gridDown",
            mousover: gridBase.mouseover,
            mousedown: gridBase.mousedown,
            mouseout: gridBase.mouseout,
            mouseup: function () {
                !flag.drawing && drawKeys.gridReduce();
                flag.drawingAllowed = true;
            }
        }, new R11.Button()),
        gridToggleButton = mod({
            text: "grid",
            rotate: 90,
            x: gridUpButton.x,
            y: gridUpButton.y + gridUpButton.h,
            w: gridUpButton.w,
            h: gridDownButton.y - gridUpButton.y - gridUpButton.h,
            id: "gridToggle",
            mousover: gridBase.mouseover,
            mousedown: gridBase.mousedown,
            mouseout: gridBase.mouseout,
            mouseup: function () {
                !flag.drawing && drawKeys.toggleGrid();
                flag.drawingAllowed = true;
            }
        }, new R11.Button());
    return {
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight,
        id: c.id + "DrawingSurface",
        defaultButton: false,
        load: function () {
            R11.controller.loadEvents(drawKeys).loadKeys(R11.drawKeys[platform]);
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
                    c.drawLine(x, endx, y, endy, w) :
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
                    (d > 0) ? 1 : -1;
                !e.shiftKey && grid.update(i);
                w = grid.width;
            };
        }()),
        unload: function () {
            R11.controller.loadEvents(false);
            hud.disableButton(gridDownButton.id, gridToggleButton.id, gridUpButton.id);
        }
    };
};