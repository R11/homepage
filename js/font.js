R11.fontFunction = {
    getLength: function (text, w, h, space) {
        var l = text && text.length - 1,
            i, total = 0,
            font = R11.font;
        for (i = 0; i <= l; i += 1) {
            t = text[i];
            font[t] && (total += font[t](w, h));
        }
        return total + (space || 0) * (l - 1);
    },
    centerText: function (obj, box) {
        !obj && (obj = {});
        !box && (box = {});
        var x = box.x || 0,
            y = box.y || 0,
            w = box.w || 0,
            h = box.h || 0,
            ratiow = obj.ratiow || 0,
            ratioh = obj.ratioh || 0,
            text = obj.text || "",
            l = text.length,
            length;
        obj.w =  w / l * ratiow;
        obj.h = ratioh * h;
        length = R11.fontFunction.getLength(text, obj.w, obj.h),
        obj.spacing = (w - (w * 0.05) - length) / (l - 1);
        obj.x = x + w * 0.1;
        obj.y = y + h / 4;
        obj.constrain = false;
        R11.fontFunction.drawText(obj);
        
    },
    drawText: function (obj) {
        !obj && (obj = {});
        obj.constrain && this.centerText(obj, obj.constrain);
        var text = obj.text || "",
            l = text && text.length - 1,
            i, lastLetter, newRow, t,
            x = obj.x || 0,
            y = obj.y || 0,
            startx = x,
            starty = y,
            w = obj.w || 20,
            h = obj.h || 20,
            space = obj.spacing || 10,
            lead = obj.leading || 20,
            ctx = obj.ctx,
            rows = text.split(/\/n/).length;
            font = R11.font;
        //   ctx.lineWidth = obj.lineWidth || 3;
        //     ctx.strokeStyle = obj.strokeStyle || "black";
        for (i = 0; i <= l; i += 1) {
            t = text[i];
            if (t && font[t]) {
                switch (t) {
                case "return":
                    y += h + lead;
                    x = startx;
                    rows += 1;
                    text += "\n";
                    // need to add linebreak to text
                    break;
                case "delete":
                    ll = l - 1;
                    lastLetter = text[ll];
                    if (lastLetter) {
                        text = text.slice(0, ll);
                        switch(lastLetter) {
                            case "\n":
                                rows -= 1;
                                y -= h + lead;
                                x = this.getLength(text.split(/\n/), w, h, space);
                                break;
                            default:
                                x -= font[lastLetter](h, w) + wspace;
                                ctx.clearRect(x, y, w, h);
                                break;
                        }
                    }
                    break;
                default:
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.beginPath();
                    x += (font[t](h, w, ctx) + space);
                    ctx.restore();
                    break;
                }
            }
        }
    }
}

R11.font = {
    "lineWidth": 2,
    "a": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
             lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
             a1 = ws * 0.25,
             a2 = ws * 0.2,
             x = 0,
             x2 = a1,
             x3 = ws - a1 - a2,
             x4 = x + x3 + a1,
             y = hs,
             y2 = hs * 0.5,
             y3 = lw,
             y4 = hs * 0.6;
        if (ctx) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y2);
        ctx.lineTo(x2, y3);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y2);
        ctx.lineTo(x4, y);
        ctx.moveTo(x4, y4);
        ctx.lineTo(x, y4);
        ctx.stroke();
        }
        return x4;
    },
    "b": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.25,
           x = lw,
           x2 = ws - a1,
           x3 = ws * 0.55,
           y = hs - lw,
           y2 = hs * 0.5,
           y3 = lw;
    if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x, y3);
      ctx.closePath();
      ctx.moveTo(x, y2);
      ctx.lineTo(x3, y2);
      ctx.stroke();
    }
      return x2;
    },
    "c": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = ws - a1,
           x2 = ws * 0.2,
           x3 = lw,
           y = lw,
           y2 = hs * 0.3,
           y3 = hs - y2,
           y4 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x2, y4);
      ctx.lineTo(x, y4);
      ctx.stroke();
           }
      return x;
    },
    "d": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = lw,
           x2 = ws * 0.5,
           x3 = ws - a1,
           y = lw,
           y2 = hs * 0.2,
           y3 = hs - y2,
           y4 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x2, y4);
      ctx.lineTo(x, y4);
      ctx.closePath();
      ctx.stroke();
           }
      return x3;
    },
    "e": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           a2 = ws * 0.2,
           x = ws - a1,
           x2 = lw,
           x3 = ws - a1 - a2,
           y = lw,
           y2 = hs - lw,
           y3 = hs * 0.45;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x, y2);
      ctx.moveTo(x2, y3);
      ctx.lineTo(x3, y3);
      ctx.stroke();
           }
      return x;
    },
    "f": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = lw,
           x3 = ws * 0.5,
           y = lw,
           y2 = hs,
           y3 = hs * 0.5;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x2, y3);
      ctx.lineTo(x3, y3);
      ctx.stroke();
           }
      return x;
    },
    "g": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.3,
           x = ws - a1,
           x2 = lw,
           x3 = x - ws * 0.35,
           y = hs * 0.1,
           y2 = lw,
           y3 = hs - lw,
           y4 = hs * 0.5;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.lineTo(x, y4);
      ctx.lineTo(x3, y4);
      ctx.stroke();
           }
      return x;
    },
    "h": function (h, w, ctx) {
        var hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.2,
            x = lw,
            x2 = ws - a1,
            y = 0,
            y2 = hs,
            y3 = hs * 0.45;
        if (ctx) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y2);
            ctx.moveTo(x, y3);
            ctx.lineTo(x2, y3);
            ctx.moveTo(x2, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
      return x2 + x;
    },
    "i": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = 0,
           x2 = ws - a1,
           x3 = x2 * 0.5,
           y = lw,
           y2 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x3, y2);
      ctx.lineTo(x3, y);
      ctx.stroke();
           }
      return x2;
    },
    "j": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.3,
           a2 = ws * 0.2,
           x = ws - a1,
           x2 = x - a2 * 2,
           x3 = x - a2,
           x4 = lw,
           y = lw,
           y2 = hs - lw,
           y3 = hs * 0.6;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.moveTo(x3, y);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x4, y2);
      ctx.lineTo(x4, y3);
      ctx.stroke();
           }
      return x;
    },
    "k": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           a2 = 0.5,
           x = lw,
           x2 = ws - a1,
           y = 0,
           y2 = hs * a2,
           y3 = hs;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y3);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y3);
      ctx.stroke();
           }
      return x2;
    },
    "l": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.3,
           x = lw,
           x2 = ws - a1,
           y = 0,
           y2 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
           }
      return x2;
    },
    "m": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.3,
            x = lw,
            x2 = x + a1,
            x3 = x + a1 * 2,
            y = hs,
            y2 = lw * 2,
            y3 = hs * 0.5;
        if (ctx) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y2);
            ctx.lineTo(x2, y3);
            ctx.lineTo(x3, y2);
            ctx.lineTo(x3, y);
            ctx.stroke();
        }
        return x3;
    },
    "n": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           a2 = 0,
           x = lw,
           x2 = ws - a1,
           y = 0,
           y2 = a2,
           y4 = hs ;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y4);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y4);
      ctx.moveTo(x2, y);
      ctx.lineTo(x2, y4);
      ctx.stroke();
           }
      return x2;
    },
    "o": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.2,
            a2 = ws * 0.1,
            x = lw,
            x2 = a1,
            x3 = ws - a1 - a2,
            x4 = x3 + a1 - x,
            y = a1,
            y2 = lw,
            y3 = hs - y,
            y4 = hs - lw;
        if (ctx) {
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y2);
            ctx.lineTo(x4, y);
            ctx.lineTo(x4, y3);
            ctx.lineTo(x3, y4);
            ctx.lineTo(x2, y4);
            ctx.lineTo(x, y3);
            ctx.closePath();
            ctx.stroke();
        }
        return x4;
    },
    "p": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = lw,
           x2 = ws - a1,
           y = hs,
           y2 = lw,
           y3 = hs * 0.4;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.stroke();
           }
      return x2;
    },
    "q": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           a2 = ws * 0.1,
           a3 = ws * 0.3,
           x = lw,
           x2 = a1,
           x3 = ws - a1 - a2,
           x4 = ws - a2,
           x5 = ws - a3 - a2,
           x6 = ws * 0.55,
           y = a1,
           y2 = lw,
           y3 = hs - y,
           y4 = hs - lw,
           y5 = hs - a3,
           y6 = hs * 0.6;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x4, y);
      ctx.lineTo(x4, y5);
      ctx.lineTo(x5, y4);
      ctx.lineTo(x2, y4);
      ctx.lineTo(x, y3);
      ctx.closePath();
      ctx.moveTo(x6, y6);
      ctx.lineTo(x4, y4);
      ctx.stroke();
           }
      return x4;
    },
    "r": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = lw,
           x2 = ws - a1,
           x3 = ws * 0.25,
           x4 = x2 + ws * 0.05,
           y = hs,
           y2 = lw,
           y3 = hs * 0.5,
           y4 = y - hs * 0.025;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
           }
      return x2;
    },
    "s": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = lw,
           y = lw,
           y2 = hs * 0.45,
           y3 = hs - lw;
           if (ctx) {
      ctx.moveTo(x + lw, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x, y2);
      ctx.lineTo(x, y3);
      ctx.lineTo(x2 - lw, y3);
      ctx.stroke();
    }
      return x;
    },
    "t": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.3 - lw,
           x = 0,
           x2 = ws - a1,
           x3 = x2 / 2,
           y = lw,
           y2 = hs;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.moveTo(x3, y);
      ctx.lineTo(x3, y2);
      ctx.stroke();
           }
      return x2;
    },
    "u": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.15,
           a2 = ws * 0.25,
           a3 = a1,
           x = lw,
           x2 = a1,
           x3 = ws - a1 - a2,
           x4 = ws - a2,
           y = 0,
           y2 = hs - a3,
           y3 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y2);
      ctx.lineTo(x4, y);
      ctx.stroke();
           }
      return x4;
    },
    "v": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = 0,
           x3 = ws - a1,
           x2 = x3 / 2,
           y = 0,
           y2 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x3, y);
      ctx.stroke();
           }
      return x3;
    },
    "w": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = 0,
           x2 = a1,
           x3 = a1 * 2,
           x4 = a1 * 3,
           x5 = a1 * 4,
           y = 0,
           y2 = hs;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x3, y);
      ctx.moveTo(x3, y);
      ctx.lineTo(x4, y2);
      ctx.moveTo(x4, y2);
      ctx.lineTo(x5, y);
      ctx.stroke();
           }
      return x5;
    },
    "x": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = 0,
           x2 = ws - a1,
           y = lw,
           y2 = hs;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y);
      ctx.closePath();
      ctx.stroke();
           }
      return x2;
    },
    "y": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = 0,
           x2 = ws - a1,
           x3 = x2 / 2,
           y = lw / 2,
           y2 = hs * 0.6,
           y3 = h;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x3, y2);
      ctx.lineTo(x2, y);
      ctx.moveTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
           }
      return x2;
    },
    "z": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.2,
           x = 0,
           x2 = ws - a1,
           y = lw,
           y2 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.moveTo(x2, y);
      ctx.lineTo(x, y2);
      ctx.moveTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
           }
      return x2;
    },
    ".": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           a1 = ws / 10,
           x = a1,
           y = hs - a1 / 2;
           if (ctx) {
      ctx.arc(x, y, a1, 0, Math.PI * 2, false);
      ctx.fill();
           }
      return a1 * 2;
    },
    ",": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth),
           a1 = hs / 10,
           x = a1,
           y = hs - a1 / 2 - lw;
           if (ctx) {
      ctx.arc(x, y, a1, Math.PI * 1.75 , Math.PI / 2, false);
      ctx.stroke();
           }
      return a1 * 2;
    },
    "'": function (h, w, ctx) {
      var hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = hs / 10,
           x = a1,
           y = a1 + lw;
           if (ctx) {
      ctx.arc(x, y, a1, Math.PI * 1.5, Math.PI / 2.6, false);
      ctx.stroke();
           }
      return a1 * 2;
    },
    ":": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           a1 = ws / 10,
           a2 = hs * 0.05,
           x = a1,
           y = a1 + a2,
           y2 = hs - a1 - a2;
           if (ctx) {
      ctx.arc(x, y, a1, 0, Math.PI * 2, false);
      ctx.arc(x, y2, a1, 0, Math.PI * 2, false);
      ctx.fill();
           }
      return a1 * 2;
    },
    "!": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = hs / 10,
           x = a1,
           y = lw,
           y2 = hs * 0.7,
           y3 = hs - lw * 2;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.closePath();
      ctx.stroke();
      ctx.arc(x, y3, a1 * 0.75, 0, Math.PI * 2, false);
      ctx.fill();
           }
      return a1 * 2;
    },
    "+": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           a1 = hs * 0.2,
           x = 0,
           x2 = ws - a1 * 2,
           x3 = x2 / 2,
           y = hs / 2,
           y2 = a1,
           y3 = hs - a1;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.moveTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
           }
      return x2;
    },
    "-": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           a1 = ws * 0.2,
           x = 0,
           x2 = ws - a1,
           y = hs / 2;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.closePath();
      ctx.stroke();
           }
      return x2;
    },
    "<": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
      x = ws * 0.8,
      x2 = 0,
      y = 0,
      y2 = hs * 0.5,
      y3 = hs * 0.8;
      if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x, y3);
      ctx.stroke();
      }
      return x;
    },
    "1": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.4,
            x = 0,
            x2 = ws - a1,
            x3 = x2 / 2 | 0,
            x4 = x,
            y = hs - lw,
            y2 = lw,
            y3 = lw;
            if (ctx) {
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y);
        ctx.moveTo(x3, y);
        ctx.lineTo(x3, y2);
        ctx.lineTo(x4, y3);
        ctx.stroke();
            }
        return x2;
    },
    "2": function (h, w, ctx) {
        var hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.4,
            x = 0,
            x2 = ws - a1,
            x3 = lw,
            y = lw,
            y2 = hs * 0.5,
            y3 = hs - lw;
            if (ctx) {
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x2, y3);
        ctx.stroke();
            }
        return x2;
    },
    "3": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
            a1 = ws * 0.4,
            x = 0,
            x2 = ws - a1,
            x3 = ws * 0.3,
            y = lw,
            y2 = hs - lw,
            y3 = hs * 0.54;
            if (ctx) {
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x, y2);
        ctx.moveTo(x2, y3);
        ctx.lineTo(x3, y3);
        ctx.stroke();
            }
      return x2;
    },
    "4": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = lw,
           y = 0,
           y2 = hs,
           y3 = hs * 0.5;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.moveTo(x2, y);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.stroke();
           }
      return x;
    },
    "5": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = lw,
           y = lw,
           y2 = hs * 0.5,
           y3 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x, y2);
      ctx.lineTo(x, y3);
      ctx.lineTo(x2, y3);
      ctx.stroke();
           }
      return x;
    },
    "6": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = lw,
           y = lw,
           y2 = hs * 0.55,
           y3 = hs - lw;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
           }
      return x;
    },
    "7": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = 0,
           x2 = ws - a1,
           y = lw,
           y2 = hs;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
           }
      return x2;
    },
    "8": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = 0,
           x2 = ws - a1,
           y = lw,
           y2 = hs - lw,
           y3 = hs * 0.52;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x, y2);
      ctx.lineTo(x, y - lw);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.stroke();
           }
      return x2;
    },
    "9": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = ws - a1,
           x2 = 0,
           y = hs,
           y2 = lw,
           y3 = hs * 0.5;
           if (ctx) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y3);
      ctx.lineTo(x, y3);
      ctx.stroke();
           }
      return x;
    },
    "0": function (h, w, ctx) {
        var  hs = h || 20, ws = w || h || 20,
           lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws * 0.4,
           x = lw,
           x2 = ws - a1,
           y = lw,
           y2 = hs - lw;
           if (ctx) {
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x, y2);
        ctx.lineTo(x, y - lw);
        ctx.stroke();
           }
        return x2;
    },
    " ": function (h, w, ctx) {
      var  s = w || 20;
      return s * 0.5;
    },
    "space": function (h, w, ctx) {
      var  s = w || 20;
      return s * 0.5;
    },
    "@": function (h, w, ctx) {
      var  hs = h || 20, ws = w || h || 20,
            lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           a1 = ws,
           a2 = ws * 0.05,
           r = a1 / 2 - lw,
           r2 = r / 2 - lw,
           //lw = ((ctx && ctx.lineWidth) || this.lineWidth) / 2,
           x = r,
           x2 = x + r2 + a2 * 2 + lw * 2,
           y = hs - r,
           y2 = y + r2 + a2 + lw,
           y3 = y + r2;
           if (ctx) {
      ctx.arc(x, y, r, Math.PI * 2.4, Math.PI * 2.22, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x, y3);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r2, 0, Math.PI * 2, false);
      ctx.stroke();
           }
      return x + r;
    },
    "return": function () {
        
    },
    "delete": function () {
        
    },
    "error": function (h, w, ctx) {
           h = h || 20; w = w || h || 20;
           ctx && ctx.fillRect(0, 0, w, h);
           return w;
      }
};

