"use strict";

var THREE = require("three");

var overheadControls = function(camera) {

    var speed = 1;

    var pitchAngle = -Math.PI / 2;
    var rotationAngle = 0;
    var height = 10;
    var lastMousePos = {};
    var isMouseDown = false;
    var radiusOffset = 0;
    var usesTouchEvents = false;

    var container = new THREE.Object3D();
    container.add(camera);

    var setHeight = function(h) {
        height = h;
        camera.position.y = height;
        setPitch(pitchAngle);
    };

    var setRotation = function(r) {
        rotationAngle = r;
        camera.position.z = radiusOffset * Math.cos(rotationAngle);
        camera.position.x = radiusOffset * Math.sin(rotationAngle);
        camera.lookAt(new THREE.Vector3(0,0,0));
    };

    var setPitch = function(a) {
        pitchAngle = a;
        radiusOffset = height / Math.tan(pitchAngle);
        setRotation(rotationAngle);
    };

    var mouseDown = function(event) {
        if (usesTouchEvents) {
            event.preventDefault();
        }
        lastMousePos.x = event.clientX;
        lastMousePos.y = event.clientY;
        if (event.targetTouches) {
            lastMousePos.x = event.targetTouches[0].clientX;
            lastMousePos.y = event.targetTouches[0].clientY;
        }
        isMouseDown = true;
    };

    var mouseUp = function(event) {
        isMouseDown = false;
    };

    var mouseMove = function(event) {
        if(!isMouseDown) {
            return false;
        }
        if (usesTouchEvents) {
            event.preventDefault();
        }

        var x = event.clientX;
        var y = event.clientY;
        if (event.targetTouches) {
            x = event.targetTouches[0].clientX;
            y = event.targetTouches[0].clientY;
        }

        var mouseXDiff = x - lastMousePos.x;
        var mouseYDiff = y - lastMousePos.y;

        var deltaX = mouseXDiff / 10 * speed;
        var deltaY = mouseYDiff / 10 * speed;

        container.position.x += deltaX * Math.cos(rotationAngle);
        container.position.z -= deltaX * Math.sin(rotationAngle);

        container.position.z += deltaY * Math.cos(rotationAngle);
        container.position.x += deltaY * Math.sin(rotationAngle);

        lastMousePos.x = x;
        lastMousePos.y = y;
    };

    setHeight(height);
    setPitch(pitchAngle);

    if ("ontouchstart" in document.documentElement) {
        usesTouchEvents = true;
        document.addEventListener("touchstart", mouseDown);
        document.addEventListener("touchend", mouseUp);
        document.addEventListener("touchmove", mouseMove);
    } else {
        document.addEventListener("mousedown", mouseDown);
        document.addEventListener("mouseup", mouseUp);
        document.addEventListener("mousemove", mouseMove);
    }

    return {
        speed: speed,
        setPitch: setPitch,
        setHeight: setHeight,
        setRotation: setRotation,
        object: container
    };
};

module.exports = overheadControls;
