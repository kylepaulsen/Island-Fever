"use strict";

var _ = require("underscore");

var get = function(query) {
    return document.querySelectorAll(query);
};

var clickOrTouchEvent = "ontouchstart" in document.documentElement ? "touchstart" : "click";

var createEl = function(name) {
    return document.createElement(name);
};

var html2Node = function(HTMLstring) {
    var temp = createEl("div");
    temp.innerHTML = HTMLstring;
    return temp.children[0];
};

var setProperty = function(object, dotPath, value) {
    if (!dotPath || !_.isObject(object)) {
        return object;
    }
    var dotPathParts = dotPath.split(".");
    var walk = object;
    for (var q = 0, len = dotPathParts.length - 1; q < len; ++q) {
        if (!_.isObject(walk[dotPathParts[q]])) {
            walk[dotPathParts[q]] = {};
        }
        walk = walk[dotPathParts[q]];
    }
    walk[dotPathParts.pop()] = value;
    return object;
};

var isJsObject = function(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
};

var toRad = function(ang) {
    return ang * Math.PI / 180;
};

// I'm trying to get as much performance out of this code as possible - Chrome and JSperf used.
var makeZeroFillMatrix = function(width, height) {
    var mat = [];
    mat.length = width;
    var x = 0;
    var y;
    while (x < width) {
        mat[x] = [];
        mat[x].length = height;
        y = 0;
        while (y < height) {
            mat[x][y] = 0;
            ++y;
        }
        ++x;
    }
    return mat;
};

var makeRandomString = function(len) {
    len = len || 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var possibleLen = possible.length;
    var t = len;
    while (t-- > 0) {
        text += possible.charAt(Math.floor(Math.random() * possibleLen));
    }
    return text;
};

var sanitize = function(str) {
    str = str.replace("<", "&lt;");
    str = str.replace(">", "&gt;");
    str = str.replace("\"", "&quot;");
    return str;
};

module.exports = {
    get: get,
    clickOrTouchEvent: clickOrTouchEvent,
    createEl: createEl,
    html2Node: html2Node,
    setProperty: setProperty,
    isJsObject: isJsObject,
    toRad: toRad,
    makeZeroFillMatrix: makeZeroFillMatrix,
    makeRandomString: makeRandomString,
    sanitize: sanitize
};
