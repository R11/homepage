//http://krazydad.com/tutorials/makecolors.php  -  fascinating

R11.colors = {
    canvas: R11.getCanvas("colors"),
    makeRange: function (obj) {
    !obj && (obj = {});
    var f1 = obj.f1 || 0,
        f2 = obj.f2 || 0,
        f3 = obj.f3 || 0,
        p1 = obj.p1 || 0,
        p2 = obj.p2 || 0,
        p3 = obj.p3 || 0,
        x = obj.x || 0,
        startx = x,
        y = obj.y || 0,
        w = obj.w || 200,
        h = obj.h || 200,
        thickx = 30,
        thicky = 40,
        center = obj.center || 128,
        len = obj.len || 50,
        width = obj.width || 127,
        ctx = obj.ctx || R11.getCanvas("HUD").ctx,
        i, r, g, b,
        rgbreset = "rgb(",
        rgb = rgbreset,
        sin = Math.sin;
        console.log(obj)
    for (i = 0; i < len; ++i) {
        rgb += (sin(f1*i + p1) * width + center | 0) + ",";
        rgb += (sin(f2*i + p2) * width + center | 0) + ",";
        rgb += (sin(f3*i + p3) * width + center | 0) + ")";
        ctx.fillStyle = rgb;
        console.log(rgb);
        ctx.fillRect(x, y, thickx, thicky);
        rgb = rgbreset;
        x += thickx;
        if (startx + w < x + thickx) {
            x = startx;
            y += thicky;
        }
    }
  }
}

R11.colorChart = {
    bit32: function (bit) {
        !bit && (bit = 8);
        var canvas = R11.getCanvas("colorImg", 0, false),
            ctx = canvas.ctx,
            w = canvas.width,
            h = canvas.height,
            img = new Image(),
            imgData = ctx.getImageData(0, 0, w, h),
            data = imgData.data,
            buf = new ArrayBuffer(data.length),
            buf8 = new Uint8ClampedArray(buf),
            buf32 = new Uint32Array(buf),
            x, y,
            hex = 0xff000000;
        for (x = 0; x < w; x += 1) {
            for (y = 0; y < h; y += 1) {
                hex += bit;
                buf32[y * w + x] = hex;
                //    (255   << 24) |
                //    (value << 12) |
                //    (value << 8)  |
                //     value;
            }
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
        return canvas;
    },
    make: function (bit, ashift) {
        !bit && (bit = 16);
        !ashift && (ashift = 1);
        var colorArray = [],
            ir, ig, ib,
            rgbreset = "rgba(",
            comma = ",",
            close = ", " + ashift + ")",
            rgb = rgbreset,
            r = 0, g = 0, b = 0;
        for (ir = 0; ir <= 255; ir += bit) {
            for (ig = 0; ig <= 255; ig += bit) {
                for (ib = 0; ib <= 255; ib += bit) {
                    rgb += ir + comma;
                    rgb += ig + comma;
                    rgb += ib + close;
                    colorArray.push(rgb);
                    rgb = rgbreset;
                }
            }
        }
        console.log(colorArray.length)
        return colorArray;
    },
    create: function (colorArray, can, x, y, w, h) {
        
        var colors = colorArray,
            len = colors.length - 1,
            i,
            sx = x,
            sy = y,
            bc = document.createElement("canvas"),
            bctx = bc.getContext("2d"),
            canvas = can || R11.getCanvas("chart"),
            ctx = canvas.ctx || canvas.getContext('2d'),
            s = w * h / len | 0,
            dx = 1;
        console.log(s)
        for (i = 0; i < len; i += 1) {
            bctx.fillStyle = colors[i];
            bctx.fillRect(x, y, dx, dx);
            x += dx;
            if (x > sx + w) {
                x = sx;
                y += dx;
            }
        }
        ctx.drawImage(bc, 0, 0)
    }
}


R11.colors.chart = (function () {
    var canvas = R11.getCanvas("chart", 100, false),
        ctx = canvas.ctx,
        img = new Image(),
        makeImg = function (src, name) {
            img.src = src;
            img.id = name || src;
            img.onload = function () {
                return img;
            }
            return img;
        },
        palette = [
            makeImg("charts/NES.png", "NES"),
            makeImg("charts/6bits.png", "6 bits"),
            makeImg("charts/9bits.png", "9 bits"),
            makeImg("charts/12bits.png", "12 bits"),
            makeImg("charts/15bits.png", "15 bits"),
            makeImg("charts/18bits.png", "18 bits"),
            makeImg("charts/24bits.png", "24 bits")
            
        ],
        plength = palette.length,
        pchart = (plength > 0) ? plength - 1: 0,
        cchart = 0,
        nchart = (plength > 0) ? plength + 1: 0;


    return {
        toggle: canvas.toggle,
        nextChart: function () {
            prevImage = chooseImage;
            chooseImage =
                (chooseImage < imageLen) ? (chooseImage + 1):
                0;
                
            colorCharts.showChart();
        },
        prevChart: function () {
            prevImage = chooseImage;
            chooseImage =
                (chooseImage > 0) ? chooseImage - 1:
                imageLen;
                
            chooseImage = (chooseImage < 0) ? 0: chooseImage;
            colorCharts.showChart();
        },
        check: function(x, y) {
            var curPixel = getPixel(x, y);
            if (flag.mousedown === 1) {
                if (ctx.open === 1) {
                    if (x >= closeX && x <= closeX + closeW && y >= closeY && y <= closeY + closeH) {
                        flag.mousedown = 0;
                        colorCharts.close();
                        return;
                    } else if (colorPixel[curPixel + 3] !== 0) {
                        flag.chartover = 1;
                        flag.draw = 0;
                            curColor.splice(0, 4, colorPixel[curPixel], colorPixel[curPixel + 1], colorPixel[curPixel + 2], colorPixel[curPixel + 3])
                            updateFill();
                            colorCharts.curColor();
                        return;
                    }
                } else if (x >= 0 && x <= closeW && y >= closeY && y <= closeY + closeH) {
                    colorCharts.open();
                
                    flag.draw = 0;
                    flag.mousedown = 0;
                    flag.chartover = 0;
                }
            }
            flag.draw = 1;
            flag.chartover = 0;
        },
        ctxOpen: function () {
            return ctx.open;
        },
        curColor: function () {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 50, 50);
            ctx.fillStyle = fillStyle;
            ctx.fillRect(4, 4, 42, 42);
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, 50, 50);
            ctx.closePath();
            ctx.stroke();
        },
        showChart: function () {
            var ph, pw, c2 = charts[prevImage];
           // palette.src = (palettes[chooseImage][0]) ? palettes[chooseImage][0]: palettes[0][0];
            //palette.name = (palettes[chooseImage][1]) ? palettes[chooseImage][1]: "error";
          //  ph = palette.height;
          //  pw = palette.width;
            c = charts[chooseImage];
            pw = c.width * 1.5;
            ph = c.height * 2;
            ctx.clearRect(0, 0, w, h);
          //  ctx.fillRect(chartX, chartY, chartW, chartH - arrowH);
         //   ctx.drawImage(palette, 0, 0, pw, ph, chartX, chartY, chartW, ph*2);
         ctx.fillStyle = "white";
         ctx.fillRect(chartX - strokeW, chartY - strokeW, pw + strokeW * 2, ph + strokeW * 2);
         ctx.strokeStyle = "black";
            ctx.lineWidth = strokeW;
            ctx.strokeRect(chartX - strokeW, chartY - strokeW, pw + strokeW * 2, ph + strokeW * 2)
            ctx.drawImage(c, 0, 0, c.width, c.height, chartX, chartY, pw, ph)
            colorPixel = getImage("chart").data;
            this.curColor();
        //    this.updateName(c.name);
        },
        updateName: function (name){
            /*
            ctx.fillStyle = "white";
            ctx.fillRect(arrowX + arrowW + strokeW, arrowY, boxW - arrowW * 2 - strokeW * 3, arrowH - strokeW);
            ctx.font = "25px sans-serif";
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.fillText(""+ name +"", arrowX + arrowW + strokeW + 30, arrowY + arrowH - arrowH/3);
            ctx.closePath();
            ctx.fill();
            */
            text(""+name+"", ctx, 700, 500, "black", 18, 0, 5, 1.5, true);
            console.log(name)
        },
        arrows: function () {
        },
        open: function () {
            ctx.open = 1;
            ctx.fillStyle = "white";
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeStyle = "black";
            ctx.lineWidth = strokeW;
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.stroke();
            flag.eraser = 0;
            colorCharts.arrows();
            colorCharts.showChart();
    
        },
        close: function () {
            ctx.open = 0;
            ctx.clearRect(0,0,w,h);
        //    xBox(ctx, 0, closeY);
            colorCharts.curColor();
        }
    }
})();