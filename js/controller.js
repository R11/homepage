R11.controller = {
    map: {},
    key: null,
    platform: (nwf && !window.wiiu) ? "wiiu" : (window.wiiu) ? "wiiuBrowser" : "pc",
    mapControls: function (a, b) {
        var idx, m = this.map;
        for (idx in a) {
            a[idx].hasOwnProperty && b[idx] &&
            (m[b[idx]] = a[idx]);
        }
        return this;
    },
    loadKeys: function (controls, keys) {
        this.mapControls(controls || {}, keys || R11.keys[this.platform]);
        return this;
    },
    events: {},
    loadEvents: function (evt) {
        this.events = (evt === false) ? {} : evt || this.events;
        return this;
    },
    compare: function () {
        var m = this.map, a, k = this.key;
        if (k && m[k]) {
            a = this.events;
            (typeof a[m[k]] === "function") &&
            a[m[k]]();
        }
        else {
            console.log((k || "no key") + " gets no action");
        }
        return this;
    },
    getKey: function (e) {
        e = e || {};
        this.key = e.button || e.keyCode || {};
        return this;
    },
    checkPlatform: function () {
        var p = this.platform;
        this["is" + p] &&
        this["is" + p]();
        return this;
    },
    check: function (e) {
        this.getKey(e).checkPlatform().compare();
        return this;
    },
    touch: function () {
    },
};