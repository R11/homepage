(function () {
    var mod = R11.modifyWith,
        platform = (nwf && !window.wiiu) ? "wiiu": (window.wiiu) ? "wiiuBrowser": "pc",
        hud = R11.hud,
        ctx = hud.ctx,
        canvas = hud.canvas,
        backgroundCanvas = R11.getCanvas("background", 1),
        backgroundCtx = backgroundCanvas.ctx,
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
        justify: "left",
        ratiow: 0.8,
        ratioh: 0.6
    };

    var homeButton = mod({
            text: "home",
            w: 50,
            h: 50,
            id: "homeButton",
            mouseup: function () {
                hud.deleteButtons();
                R11.controller.loadEvents(false);
                ctx.clearAll();
                hud.addButton(editButton);
            }
        }, new R11.Button()),
        drawingSurface = mod(R11.drawSurface(backgroundCanvas), new R11.Button()),
        initDrawing = {
            x: 50,
            y: 250,
            w: 300,
            h: 100,
            text: "draw",
            id: "initDrawButton",
            mouseup: function () {
                hud.deleteButtons();
                ctx.clearAll();
                hud.addButton(drawingSurface, homeButton);
            }
        },
        editButton = mod(initDrawing, new R11.Button()),
        layers = 0,
        addCanvasButton = mod(R11.getCanvas("layer: " + (layers += 1), new R11.Button()),
            welcomeMessage = mod({x: 30, y: 100, lineWidth: 12, ctx: backgroundCtx, text: "welcome to somegamesimade.com"}, new Text()));

    hud.addButton(editButton);
    R11.fontFunction.drawText(welcomeMessage);

    window.onkeydown = function (e) {
        flag.keydown = true;
        R11.controller.check(e);
    };
    window.onkeyup = function (e) {
        flag.keydown = false;
        flag.eraser = false;
    };
    window.oncontextmenu = function () {
        return false;
    };
}());

/// I want to make right-click create a context menu. give the option to edit canvas, clear, etc.
//// after that I need to figure out how to layer.