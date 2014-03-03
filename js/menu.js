/**
 * Created by Rudger on 3/2/14.
 */

R11.Menu = function () {
    return this;
}

R11.Menu.prototype = {
    options: {},
    hud: R11.hud,
    space: 0,
    orientation: 0,
    draw: function (mx, my) {
        var hud = this.hud,
            canvas = this.hud.canvas,
            ctx = canvas.ctx,
            opt = this.options,
            x = mx,
            y = my,
            mod = R11.modifyWith,
            orientation = this.orientation,
            idx, o;
        for (idx in opt) {
            if (opt.hasOwnProperty(idx)) {
                o = opt[idx];
                hud.addButton(mod({x: x, y: 5}, new R11.Button()));
                if (orientation) {
                    x += 5
                }
            }
        }

    }
}