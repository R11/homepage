!R11.app && (R11.app = {});

R11.hud = new R11.HUD();

R11.app.home = function () {
    var bObj = R11.blankObject,
        platform = (nwf && !window.wiiu) ? "wiiu": (window.wiiu) ? "wiiuBrowser": "pc",
        hud = R11.hud,
        ctx = hud.ctx,
        canvas = hud.canvas,
        backgroundCanvas = R11.getCanvas("background", 1),
        backgroundCtx = backgroundCanvas.ctx,
        bufferCanvas = R11.getCanvas("buffer", 0, false),
        bufferCtx = bufferCanvas.ctx,
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
        },
        makeButton = function (color, text) {
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
        },
        cChart = {
            x: window.innerWidth - 500,
            y: 100,
            w: 500,
            h: 500,
            ctx: backgroundCtx,
            f1: 2.4,
            f2: 2.4,
            f3: 2.4,
            p1: 0,
            p2: 2,
            p3: 4,
            center: 127.5,
            width: 127.5,
            len: 50,
            hoverimg: makeButton("grey"),
            clickimg: makeButton("black"),
            idleimg: makeButton("pink"),
            mouseup: function () {
                hud.deleteButtons();
                controller.loadEvents(false);
                ctx.clearAll();
                R11.colors.makeRange(cChart);
                hud.addButton(homeButton).loadButtons();
            },
            mouseover: function(e) {
                
            }
        },
        colorChart = new R11.Button(cChart),
        homeButton = new R11.Button({
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            hoverimg: makeButton("orange"),
            clickimg: makeButton("red"),
            idleimg: makeButton("blue"),
            textcoloridle: "red",
            textcolorhover: "black",
            textcolorclick: "white",
            text: "home",
            mouseup: function () {
                hud.deleteButtons();
                controller.loadEvents(false);
                ctx.clearAll();
                hud.addButton(initDrawing, initTyping, colorChart).loadButtons();
            },
        }),
        hudData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight),
        getPixel = function (x, y, w) {
            return (x + y * w) * 4;
        },
        charts = {
            x: window.innerWidth - 50,
            y: 100,
            w: 50,
            h: 100,
            hoverimg: homeButton.hoverimg,
            clickimg: homeButton.clickimg,
            idleimg: homeButton.idleimg,
            mouseup: function () {
                var drawChart = function (img) {
                        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, this.x, this.y, this.w, this.h);
                    },
                    chartsurface = {
                        x: this.x - 300,
                        y: this.y,
                        w: 250,
                        h: 200,
                        ctx: ctx,
                        load: function () {
                            console.log('load')
                            var makeImg = function (src, name) {
                                var img = new Image();
                                img.src = src;
                                img.id = name || src;
                                img.onload = function () {
                                    
                                   // return img;
                                }
                                return img;
                            };
                            this.palette = [
                                makeImg("charts/NES.png", "NES"),
                                makeImg("charts/6bits.png", "6 bits"),
                                makeImg("charts/9bits.png", "9 bits"),
                                makeImg("charts/12bits.png", "12 bits"),
                                makeImg("charts/15bits.png", "15 bits"),
                                makeImg("charts/18bits.png", "18 bits"),
                                makeImg("charts/24bits.png", "24 bits")
                                
                            ];
                            drawChart(this.palette[0]);
                        },
                        mouseup: function (e) {
                            !e && (e = {});
                  //          var p = getPixel(e.pageX || 0, e.pageY || 0, canvas.width);
                            drawChart(this.palette[1]);
                        }
                    },
                    chartSurfaceButton = new R11.Button(chartsurface);
                console.log(this.x);
                ctx.clearAll();
              //  this.on = false;
                hud.addButton(chartSurfaceButton).loadButtons();
            }
        },
        chartsButton = new R11.Button(charts),
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
                };
            controller.loadEvents(drawKeys).loadKeys(R11.drawKeys[platform]);
            return new R11.Button({
                x: 0,
                y: 0,
                w: window.innerWidth,
                h: window.innerHeight,
                mousemove: function (e) {
                    !e && (e = bObj);
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
                mousedown: function (e) {
                    !e && (e = bObj);
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
                    !e && (e = bObj);
                    d = e.wheelDelta || -e.detail || 0;
                    i = (d === 0) ? 0:
                            (d > 0) ? 1: -1;
                    !e.shiftKey && grid.update(i);
                    e.shiftKey && c;
                    w = grid.width;
                    }
                })(),
                contextmenu: function () { return false; }
            })
        },
        initDrawing = new R11.Button({
            x: 50,
            y: 50,
            w: 300,
            h: 100,
            text: "draw",
            hoverimg: homeButton.hoverimg,
            clickimg: homeButton.clickimg,
            idleimg: homeButton.idleimg,
            textcoloridle: homeButton.textcoloridle,
            textcolorhover: homeButton.textcolorhover,
            textcolorclick: homeButton.textcolorclick,
            mouseup: function () {
                hud.deleteButtons();
                ctx.clearAll();
                hud.addButton(drawSurface(backgroundCanvas), chartsButton, homeButton).loadButtons();
            },
        }),
        initTyping = new R11.Button({
            x: 50,
            y: 200,
            w: 300,
            h: 100,
            hoverimg: homeButton.hoverimg,
            clickimg: homeButton.clickimg,
            idleimg: homeButton.idleimg,
            textcoloridle: homeButton.textcoloridle,
            textcolorhover: homeButton.textcolorhover,
            textcolorclick: homeButton.textcolorclick,
            text: "type",
            mouseup: function () {
                hud.deleteButtons();
                ctx.clearAll();
                R11.app.notePad();
                hud.addButton(homeButton).loadButtons();
            },
        });
    window.onkeydown = function (e) {
        flag.keydown = true;
        controller.check(e);
    };
    window.onkeyup = function (e) {
        flag.keydown = false;
        flag.eraser = false;
    };
    hud.addButton(initDrawing, initTyping, colorChart).loadButtons();
    console.log('loaded')
    
    
}

R11.app.DrawingCanvas = function (c) {
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
            gridShift: function (){
                console.log('change');
                grid.offsetx += 5;
                console.log('change');
                grid.update();
            },
            toggleGrid: function (t) {
                grid.canvas.toggle(t);
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
        controller = R11.controller.loadEvents(drawKeys).loadKeys(R11.drawKeys[platform]),
        drawSurface = new R11.Button({
            x: 0,
            y: 0,
            w: window.innerWidth,
            h: window.innerHeight,
            mousemove: function (e) {
                !e && (e = bObj);
                var x = e.pageX || 0,
                    y = e.pageY || 0,
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
            mousedown: function (e) {
                !e && (e = bObj);
                var x = this.mousedown.endx = e.pageX || 0,
                    y = this.mousedown.endy = e.pageY || 0;
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
                !e && (e = bObj);
                d = e.wheelDelta || -e.detail || 0;
                i = (d === 0) ? 0:
                        (d > 0) ? 1: -1;
                !e.shiftKey && grid.update(i);
                e.shiftKey && c;
                w = grid.width;
                }
            })(),
            contextmenu: function () { return false; }
        });
}
