R11.ball = {
    sideCheck: function (x, l, r) {
        if (x > l + r) {
            return 1 - r;
        } else if (x < 1 - r) {
            return l + r - 1;
        } else {
            return x;
        }
    },
    update: (function () {
        var twopi = Math.PI * 2,
            oldx = 0, oldy = 0;
        return function (ctx, x, y, r) {
            ctx.clearRect(oldx - r - 50, oldy - r - 50, (r + 10) * 100, (r + 10) * 100);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, twopi, false);
            ctx.fill();
            ctx.lineWidth = 2;
     //       ctx.strokeStyle = "black";
            ctx.stroke();
            oldx = x;
            oldy = y;
       /*     // this is just a small shadow on the ball, change the state.gyroZ to something else like state.angleY or whatever for different effects
            ctx.beginPath();
            ctx.arc(x, y, r / 4, (state.gyroZ * 360 + 50) * R11.radians | 0, (state.gyroZ * 360 + 360) * R11.radians | 0, true);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            */
        }
    })()
}

R11.Ball = function (obj) {
    this.twoPI = Math.PI * 2;
    this.radians = Math.PI / 180;
    this.update(obj);
}

R11.Ball.prototype.update = function (obj) {
    this.x = obj.x || 100;
    this.y = obj.y || 100;
    this.r = obj.r || 30;
    this.color = obj.color || "black";
    this.shiftx = obj.shiftx || "accX";
    this.dx = obj.dx || 20;
    this.shifty = obj.shifty || "accZ";
    this.dy = obj.dy || 20;
    this.shadow = obj.shadow || "gyroZ";
    this.canvas = obj.canvas || document.createElement('canvas');
    this.ctx = this.canvas.init("ball", 20).ctx;
}
R11.Ball.prototype.draw = function () {
    var state = (window.wiiu) ? window.wiiu.gamepad.update() : {},
        touch = (state.tpTouch === 1) ? true : null,
        ctx = this.ctx,
        x = this.x,
        y = this.y,
        r = this.r;
    ctx.clearRect(x - r - 50, y - r - 50, (r + 10) * 100, (r + 10) * 100);
    x = (touch === true) ? state.contentX :
                R11.sideCheck(x - this.dx * state[this.shiftx], this.canvas.width, r);
    y = (touch === true) ? state.contentY :
                R11.sideCheck(y - this.dy * state[this.shifty], this.canvas.height, r);
    // ball
    ctx.beginPath();
    ctx.arc(x, y, r, 0, this.twoPI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
    // this is just a small shadow on the ball, change the state.gyroZ to something else like state.angleY or whatever for different effects
    ctx.beginPath();
    ctx.arc(x, y, r / 4, (state[this.shadow] * 360 + 50) * this.radians | 0, (state[this.shadow] * 360 + 360) * this.radians | 0, true);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    setInterval(this.draw, 20)
   // requestAnimationFrame(this.draw);
}