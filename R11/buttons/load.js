R11.buttonTest = function () {
    var hud = new R11.HUD();
    hud.addButton(new R11.Button({
        x: 0,
        y: 0,
        w: 300,
        h: 300,
        style: 2,
        mousedown: function () {
            console.log('down')
        },
        ctx: hud.canvas.ctx
    }));
    hud.loadButtons();
    console.log('loaded')
}