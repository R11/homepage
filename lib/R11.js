var document = document || window.document,
    nwf = nwf || null,
    R11 = {};
R11 = {
    blankString: "",
    blankArray: [],
    blankObject: {},
    twoPI: Math.PI * 2,
    makeFlags: function () {
        var arg = arguments,
            l = arg.length - 1,
            i, pow = Math.pow;
        for (i = 0; i <= l; i += 1) {
            arg[i] = pow(2, i);
        }
    },
    getCanvas: function (id, zindex, display) {
        var c = document.getElementById(id) || document.createElement("canvas");
        c.init(id, zindex, display);
        return c;
    },
    modifyWith: function (obj1, obj2) {
        var idx;
        for (idx in obj1) {
            obj1.hasOwnProperty(idx) &&
                (obj2[idx] = obj1[idx]);
        }
        return obj2;
    },
    contains: function (x, y, box) {
        return x && y && box && x >= box.x && x <= box.w + box.x &&
                y >= box.y && y <= box.y + box.h;
    },
    getPixel: function (x,y,w) {
            return (x + y * w) * 4;
    },
    setProperty: function (obj, name, func) {
        Object.defineProperty(obj, name, {
            value: func,
            writable: false,
            enumerable: false,
            configureable: false
        })
    },
    setProperties: function (obj1, obj2) {
        var idx;
        for (idx in obj2) {
            obj2.hasOwnProperty(idx) &&
                this.setProperty(obj1, idx, obj2[idx]);
        }
    },
    loadScript: function () {
        var arg = arguments,
            script, i, len = arg.length - 1,
            frag = document.createDocumentFragment();
        if (len < 0) {
            return;
        }
        for (i = 0; i <= len; i += 1) {
            script = document.createElement("script");
            script.src = "js/" + arg[i] + ".js";
            frag.appendChild(script);
        }
        document.body.appendChild(frag);
    }
};


