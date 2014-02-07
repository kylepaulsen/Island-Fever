"use strict";

var helpers = {
    click: function(el) {
        var evt = document.createEvent("TouchEvent");
        evt.initUIEvent("touchstart", true, true);

        evt.view = window;
        evt.altKey = false;
        evt.ctrlKey = false;
        evt.shiftKey = false;
        evt.metaKey = false;

        el.dispatchEvent(evt);
    }
};

module.exports = helpers;
