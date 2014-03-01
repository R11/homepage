
R11.app = R11.app || {};

R11.app.notePad = function () {
    var c = R11.getCanvas("notePad", 2),
        bc = R11.getCanvas("buffer", 1, false),
        cursorCanvas = R11.getCanvas("cursor", 3),
        cursorCtx = cursorCanvas.ctx,
        bctx = bc.ctx,
        ctx = c.ctx,
        startx = 5,
        x = startx,
        starty = 100,
        y = starty,
        w = 20,
        h = 20,
        cursorX = startx,
        cursorY = starty,
        cursorDraw = function () {
            cursorCtx.fillRect(x, y, ctx.lineWidth, h);
        },
        cursorClear = function () {
            cursorCtx.clearRect(x, y, ctx.lineWidth, h);
        },
        dx, dy,
        wspace = 5,
        hspace = 8,
        keys = R11.keyboard,
        font = R11.font,
        text = "",
        type = function (e) {
            !e && (e = {});
            var key = (e.keyCode || "");
            e.shiftKey && (key += "s");
            e.altKey && (key += "a");
            var k = keys[key],
                lastLetter, ll, dashCheck;
            cursorClear();
            if (!e.ctrlKey && k) {
                switch(k) {
                    case 'return':
                        y += h + hspace;
                        x = startx;
                        text += "\n";
                        // need to add linebreak to text
                        break;
                    case "delete":
                        ll = text.length - 1;
                        lastLetter = text[ll];
                        if (lastLetter) {
                            switch(lastLetter) {
                                case "\n":
                                    y -= h + hspace;
                                    x = 50;
                                    break;
                                default:
                                    x -= font[lastLetter](h, w) + wspace;
                                    ctx.clearRect(x, y, w, h);
                                    break;
                            }
                        text = text.slice(0, ll);
                        }
                        console.log(x);
                     //   text -= lastLetter;
                    //    ctx.clearRect(x - wspace / 2, y - hspace / 2, font[text[text.length - 1]](bctx, w, h), h + hspace);
                        break;
                    default:
                        if (font[k]) {
                            ctx.save();
                            ctx.translate(x, y);
                            ctx.beginPath();
                            dx = font[k](h, w, ctx) + wspace;
                            x += dx;
                            ctx.restore();
                            text += k;
                        }
                        break;
                }
            }
            cursorDraw();
       //     x += font[k](ctx, h, w);
        },
        cursorTick = 30,
        ticker = 0,
        drawCursor = function () {
            ticker === 60 && (ticker = 0);
            (ticker / cursorTick) === (ticker / cursorTick | 0) && cursorCanvas.toggle();
            ticker += 1;
            window.requestAnimationFrame(drawCursor);
        };
    ctx.lineWidth = font.lineWidth = bctx.lineWidth = cursorCtx.lineWidth = 2;
    cursorDraw();
    window.requestAnimationFrame(drawCursor);
    ctx.lineWidth = font.lineWidth = 2;
    window.onkeydown = type;
}

R11.app.notePadOld = function () {
    var c = document.createElement('canvas'),
        bc = document.createElement('canvas'),
        bctx = bc.init('buffer', 1, false).ctx,
        ctx = c.init('notepad', 2).ctx,
        startx = 5,
        x = startx,
        starty = 5,
        y = starty,
        w = 20,
        h = 20,
        wspace = 5,
        hspace = 8,
        keys = R11.keyboard,
        font = R11.font,
        fontImg = {},
        text = "",
        k,
        img, idx,
        type = function (e) {
            k = keys[e.keyCode || ""];
            switch(k) {
                case 'return':
                    y += h + hspace;
                    x = startx;
                    // need to add linebreak to text
                    break;
                case "delete":
                //    ctx.clearRect(x - wspace / 2, y - hspace / 2, font[text[text.length - 1]](bctx, w, h), h + hspace);
                    break;
                default:
                    if (fontImg[k]) {
                        ctx.save();
                        ctx.translate(x, y);
                        ctx.beginPath();
                        ctx.drawImage(fontImg[k], 0, 0);
                        ctx.restore();
                        x += fontImg[k].w + wspace;
                        text += k;
                        console.log(x)
                    }
                    break;
            }
        };
    ctx.lineWidth = 2;
    bctx.lineWidth = 2;
    for (idx in font) {
        if (font.hasOwnProperty(idx)) {
            
            fontImg[idx] = new Image();
            bctx.clearRect(0, 0, w + 10, h + 10);
            fontImg[idx].w = font[idx](bctx, w, h);
            fontImg[idx].onload = function () {
                
            }
            fontImg[idx].src = bc.toDataURL();
        }
    }
    window.onkeydown = type;
}