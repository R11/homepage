(function () {
R11.setProperties(Number.prototype, {
    convertBase: function (a, b) {
        if (!(b < 2 || a < 2 || a > 36 || b > 36 || !a.isEven || !b.isEven)) {
            return parseInt(this * 1, a).toString(b);
        }
        else {
            return 0;
        }
    },
    square: function () {
        return this * this * 1;
    },
    pow: function (p) {
        var r = this * 1, i = 1;
        if (!p || p === 0) { return 1; }
        if (p === 1) {return r; }
        if (p < 0) {
            p *= -1;
        }
        for (; i < p; i += 1) {
            r *= this;
        }
        return r;
    },
    round: function () {
        return ~~(this + 0.5) * 1;
    },
    roundup: function () {
        return ~~(this + 0.9) * 1;
    },
    floor: function () {
        return ~~this * 1;
    },
    add: function () {
        var i = 0, sum = this * 1, l = arguments.length;
        for (; i < l; i +=1) {
            sum += arguments[i] * 1;
        }
        return sum;
    },
    factorial: function (n) {
        n = (n && n * 1) || this * 1;
        return (n > 0) ? n * (n - 1).factorial(): 1;
    }
})
})();