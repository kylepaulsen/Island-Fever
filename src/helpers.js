"use strict";

var createEl = function(name) {
    return document.createElement(name);
};

var html2Node = function(HTMLstring) {
    var temp = createEl("div");
    temp.innerHTML = HTMLstring;
    return temp.children[0];
};

var listen = function(el, type, func) {
    el.addEventListener(type, func, false);
};

module.exports = {
    createEl: createEl,
    html2Node: html2Node,
    listen: listen
};
