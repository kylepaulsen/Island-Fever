"use strict";

var pinchFns = [];
var doubleSwipeFns = [];
var rotateFns = [];
var lastDistanceDelta;
var lastMidpoint;
var lastRotation;
var numTouches;
var dataBuffer;
var bufferTargetSize = 3;
var mode;

var twoPi = 2 * Math.PI;

var findDistance = function(x1, y1, x2, y2) {
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

var originPoint2Angle = function(x, y) {
    var ang = Math.atan2(y, x);
    return (ang > 0 ? ang : twoPi + ang) * 360 / twoPi;
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

    var newRotation = originPoint2Angle(newTouches[0].clientX - newTouches[1].clientX,
        -newTouches[0].clientY + newTouches[1].clientY);
    var rotationDelta;
    if (lastRotation) {
        rotationDelta = lastRotation - newRotation;
        var absRotationDelta = Math.abs(rotationDelta);
        if (absRotationDelta > 180) {
            rotationDelta = 360 - absRotationDelta;
        }
    }
    lastRotation = newRotation;

    return {
        distanceDelta: distanceDelta,
        midpointDelta: midpointDelta,
        rotationDelta: rotationDelta
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
    var totalRotationDelta = 0;
    var totalMidpointXDelta = 0;
    var totalMidpointYDelta = 0;

    var rotationWeight = 0.8;
    var distanceWeight = 10;
    var midpointWeight = 10;

    var t = dataBuffer.length;
    while(t-- > 0) {
        totalDistanceDelta += dataBuffer[t].distanceDelta;
        totalRotationDelta += dataBuffer[t].rotationDelta;
        totalMidpointXDelta += dataBuffer[t].midpointDelta.x;
        totalMidpointYDelta += dataBuffer[t].midpointDelta.y;
    }
    var averageDistanceDelta = totalDistanceDelta / bufferTargetSize;
    var averageRotationDelta = totalRotationDelta / bufferTargetSize;
    var averageMidpointXDelta = totalMidpointXDelta / bufferTargetSize;
    var averageMidpointYDelta = totalMidpointYDelta / bufferTargetSize;

    // used this console testing to find good weights.
    /*console.log(averageRotationDelta/0.8, " === ", averageDistanceDelta/10, " === ", averageMidpointXDelta/10,
        " === ", averageMidpointYDelta/10);*/

    var rotationScore = Math.abs(averageRotationDelta / rotationWeight);
    var distanceScore = Math.abs(averageDistanceDelta / distanceWeight);
    var midpointScore = Math.max(Math.abs(averageMidpointXDelta / midpointWeight),
        Math.abs(averageMidpointYDelta / midpointWeight));

    if (rotationScore > distanceScore && rotationScore > midpointScore) {
        mode = "rotate";
    } else if (midpointScore > rotationScore && midpointScore > distanceScore) {
        mode = "doubleSwipe";
    } else {
        mode = "pinch";
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
                } else if (mode === "rotate"){
                    callArrayOfFuncs(rotateFns, data);
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

var onRotate = function(func) {
    rotateFns.push(func);
};

module.exports = {
    setup: setup,
    onPinch: onPinch,
    onDoubleSwipe: onDoubleSwipe,
    onRotate: onRotate
};
