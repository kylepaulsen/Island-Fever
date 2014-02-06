"use strict";

var pinchFns = [];
var doubleSwipeFns = [];
var lastDistanceDelta;
var lastMidpoint;
var numTouches;
var dataBuffer;
var bufferTargetSize = 3;
var mode;

var findDistance = function(x1, y1, x2, y2) {
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

var analyseTouchs = function(e) {
    var newTouches = e.targetTouches;

    var newDistanceDelta = findDistance(newTouches[0].clientX, newTouches[0].clientY,
        newTouches[1].clientX, newTouches[1].clientY);
    var distanceDelta;
    if (lastDistanceDelta !== null) {
        distanceDelta = lastDistanceDelta - newDistanceDelta;
    }
    lastDistanceDelta = newDistanceDelta;

    var newMidpoint = {x: (newTouches[0].clientX + newTouches[1].clientX)/2,
        y: (newTouches[0].clientY + newTouches[1].clientY)/2};
    var midpointDelta = {};
    if (lastMidpoint.x) {
        midpointDelta.x = lastMidpoint.x - newMidpoint.x;
        midpointDelta.y = lastMidpoint.y - newMidpoint.y;
    }
    lastMidpoint = newMidpoint;

    return {
        distanceDelta: distanceDelta,
        midpointDelta: midpointDelta
    };
};

var callArrayOfFuncs = function(arr, arg) {
    var t = arr.length;
    while (t-- > 0) {
        arr[t](arg);
    }
};

var setMode = function() {
    var totalDistanceDelta = 0;
    var t = dataBuffer.length;
    while(t-- > 0) {
        totalDistanceDelta += dataBuffer[t].distanceDelta;
    }
    var averageDistanceDelta = totalDistanceDelta / bufferTargetSize;
    if (Math.abs(averageDistanceDelta) > 5) {
        mode = "pinch";
    } else {
        mode = "doubleSwipe";
    }
};

var touchStart = function(e) {
    lastMidpoint = {};
    lastDistanceDelta = null;
    mode = null;
    dataBuffer = [];
    numTouches = e.targetTouches.length;
};

var touchMove = function(e) {
    e.preventDefault();
    if (numTouches > 1) {
        var data = analyseTouchs(e);
        if (data.distanceDelta) {
            if (dataBuffer.length < bufferTargetSize) {
                dataBuffer.push(data);
            } else {
                if (!mode) {
                    setMode();
                }
                if (mode === "pinch") {
                    callArrayOfFuncs(pinchFns, data);
                } else {
                    callArrayOfFuncs(doubleSwipeFns, data);
                }
            }
        }
    }
};

var touchEnd = function(e) {
    numTouches = e.targetTouches.length;
};

var setup = function(el) {
    if ("ontouchstart" in document.documentElement) {
        el.addEventListener("touchstart", touchStart);
        el.addEventListener("touchend", touchEnd);
        el.addEventListener("touchmove", touchMove);
    }
};

var onPinch = function(func) {
    pinchFns.push(func);
};

var onDoubleSwipe = function(func) {
    doubleSwipeFns.push(func);
};

module.exports = {
    setup: setup,
    onPinch: onPinch,
    onDoubleSwipe: onDoubleSwipe
};
