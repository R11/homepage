R11.Shapes = function (obj) {
if (obj.ctx !== undefined) {
    var x1, x2, x3, y1, y2, y3, a1, a2, a3,
        x = obj.x, y = obj.y, w = obj.w, h = obj.h,
        ctx = obj.ctx,
        text = (typeof obj.text === "function") ? obj.text():
                (obj.text) ? obj.text:
                "",
        h = obj.h || 100,
        color = obj.curColor || "black";
    ctx.fillStyle = (obj) ? obj.background: "white";
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = obj.borderColor || "black";
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = color;
    switch (text) {
    case "+": 
            a1 = 0.2,
            a2 = 1 - a1,
            x1 = x + w * a1,
            x2 = x + w * 0.5,
            x3 = x + w * a2,
            y1 = y + h * a1,
            y2 = y + h * 0.5,
            y3 = y + h * a2;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(x1, y2);
        ctx.lineTo(x3, y2);
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y3);
        ctx.closePath();
        ctx.stroke();
        break;
    case "-":
            x1 = x + w * 0.2,
            x2 = x + w * 0.5,
            x3 = x + w * 0.8,
            y1 = y + h * 0.2,
            y2 = y + h * 0.5,
            y3 = y + h * 0.8;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(x1, y2);
        ctx.lineTo(x3, y2);
        ctx.closePath();
        ctx.stroke();
        break;
    default:
        ctx.font = obj.font || ""+ h * 0.8 +"px sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + w * 0.5, y + h * 0.58, w - w * 0.2);
        break;
    }
}
}
