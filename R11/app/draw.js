R11.app = R11.app || {};

R11.app.draw = function () {
    var c = document.createElement("canvas"),
    ctx = c.init("1", 1).ctx,
    grid = new R11.Grid(),
    endx, endy, gp0, ev, bce, wr1, tp,
    w = grid.width,
    bObj = R11.blankObject,
    platform = (nwf && !window.wiiu) ? "wiiu": (window.wiiu) ? "wiiuBrowser": "pc",
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
    keyFunctions = {
        gridExpand: function () {
            grid.update(1);
            w = grid.width;
        },
        gridReduce: function () {
            grid.update(-1);
            w = grid.width;
        },
        toggleGrid: function () {
            grid.canvas.toggle();
        },
        ballOn: function () {
            flag.ball = true;
        },
        ballOff: function () {
            flag.ball = false;
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
    controller = R11.controller.loadEvents(keyFunctions).loadKeys(R11.drawKeys[platform]),
    touch = controller.touch,
    mouseEvents = {
        onmousemove: function (e) {
            !e && (e = bObj);
            var x = e.pageX || 0,
                y = e.pageY || 0;
            if (flag.mousedown) {
            e.button === 2 && (ctx.fillStyle = "red");
            e.button === 1 && (ctx.fillStyle = "green");
            e.button === 0 && (ctx.fillStyle = "black");
            e.shiftKey && (ctx.fillStyle = "white");
            flag.eraser && (ctx.fillStyle = 'white');
                (Math.abs(x - endx) > w || Math.abs(y - endy) > w) ?
                    c.drawLine(x, endx, y, endy, w):
                    c.drawPixel(x, y, w);
                endx = x;
                endy = y;
            }
        },
        onmousedown: function (e) {
            !e && (e = bObj);
            var x = endx = e.pageX || 0,
                y = endy = e.pageY || 0;
            flag.mousedown = true;

            c.drawPixel(x, y, w);
            nwf && console.log("x: "+e.screenX+", y: " + e.screenY);
        },
        onmouseup: function (e) {
            flag.mousedown = false;
        },
        onmousewheel: (function () {
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
        })()
    };
    window.oncontextmenu = function () { return false; };
    R11.modifyWith(mouseEvents, window);
    switch(platform) {
    case "pc":
        R11.modifyWith({
            onkeydown: function (e) {
                flag.keydown = true;
                controller.check(e);
            },
            onkeyup: function (e) {
                flag.keydown = false;
                modifier = false;
                flag.eraser = false;
            }
        }, window);
        
        break;
    case "wiiu":
        nwf.system.Memory.requestGC();
        gp0 = nwf.input.WiiUGamePad.getController();
        tp = gp0.touchPanel,
        ev = nwf.events;
        bce = ev.ButtonControlEvent;
        tp.controller.sensorBarEnabled = true;
        wr1 = nwf.input.WiiRemote.getController();
//            tpEvent = ev.TouchControlEvent, self = this;
        gp0.buttons.addEventListener(bce.PRESS, controller.check, controller);
        wr1.buttons.addEventListener(bce.PRESS, controller.check, controller);
   //     gp0.leftStick.addEventListener(ev.MovementControlEvent.MOVE, stickMove, self);
   //     gp0.rightStick.addEventListener(ev.MovementControlEvent.MOVE, stickMove, self);
//        tp.addEventListener(tpEvent.TOUCH_START, function () {}, this);
  //      tp.addEventListener(tpEvent.UPDATE, function () {}, this);
    //    tp.addEventListener(tpEvent.TOUCH_END, function () {}, this);
        break;
    case "wiiuBrowser":
        break;
    }
}
//    R11.modifyWith(events, window);

/*
    else if (window.wiiu) {
        var ballCanvas = document.createElement('canvas'),
            ballCtx = ballCanvas.init("ball", 20).ctx, oldx, oldy,
            ballx = 50,
            bally = 50,
            ballr = 2,
            rball = R11.ball,
            ball = new R11.Ball(),
            oldx = ball.x,
            oldy = ball.y,
            tx, ty,
            ballUpdate = rball.update,
            sideCheck = rball.sideCheck,
            gp = window.wiiu.gamepad,
            wiiuGo = function () {
                var state = gp.update();
                controller.check({button: state.hold });
                if (flag.ball) {
                  /*
                    if (state.tpTouch) {
                        tx = state.contextX;
                        ty = state.contextY;
                    } else {
                        ballx = sideCheck(ballx - 20 * state.accX, ballCanvas.width, ballr);
                        bally = sideCheck(bally - 20 * state.accY, ballCanvas.height, ballr);
                    }
                    ballUpdate(ballCtx, ballx, bally, ballr * w);
                    c.drawLine(ballx, oldx, bally, oldy, w);
                    oldx = ballx;
                    oldy = bally;
                    */
  /*                alert('hey');
                    ball.draw();
                    c.drawLine(ball.x, oldx, ball.y, oldy, w);
                    oldx = ballx;
                    oldy = bally;
                } else {
                    if (state.tpTouch) {
                        c.drawLine(state.contextX, oldx || state.contextX, state.contextY, oldy || state.contentY);
                        oldy = state.contextY;
                        oldx = state.contextX;
                    } else {
                        oldx = 0;
                        oldy = 0;
                    }
                }
            };
        window.setInterval(wiiuGo, 100);
    }
}

*/