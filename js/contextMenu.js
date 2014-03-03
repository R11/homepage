R11.ContextMenu = function () {
    return this;
};

R11.ContextMenu.prototype = {
    init: function (canvas) {
        this.canvas = canvas || R11.getCanvas("HUD");
        this.ctx = this.canvas.ctx;
    },
    draw: function (x, y, w) {
        !w && (w = 100);
        !x && (x = 300);
        !y && (y = 300);


    }
}