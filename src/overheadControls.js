"use strict";

var THREE = require("../vendor/three");

var overheadControls = function(camera) {

    var speed = 1;

    var pitchAngle = -Math.PI / 2;
    var rotationAngle = 0;
    var height = 10;
    var lastMousePos = {};
    var isLeftMouseDown = false;
    var isRightMouseDown = false;
    var radiusOffset = 0;
    var usesTouchEvents = false;
    var mouseButtons = {
        left: 1,
        middle: 2,
        right: 3
    };

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

    var mouseWheelHandler = function(e) {
        // delta will be -1 when you scroll towards yourself and 1 when you scroll away.
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        var newHeight = height - delta;
        newHeight = Math.max(Math.min(newHeight, 120), 10);
        setHeight(newHeight);
    };

    var disableContextMenu = function(e) {
        e.preventDefault();
        return false;
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
            isLeftMouseDown = true;
        }
        if (event.which === mouseButtons.left) {
            isLeftMouseDown = true;
        } else if (event.which === mouseButtons.right) {
            isRightMouseDown = true;
        }
    };

    var mouseUp = function(event) {
        isLeftMouseDown = false;
        isRightMouseDown = false;
    };

    var mouseMove = function(event) {
        if(!isLeftMouseDown && !isRightMouseDown) {
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

        if (isLeftMouseDown) {
            container.position.x += deltaX * Math.cos(rotationAngle);
            container.position.z -= deltaX * Math.sin(rotationAngle);

            container.position.z += deltaY * Math.cos(rotationAngle);
            container.position.x += deltaY * Math.sin(rotationAngle);
        } else if (isRightMouseDown) {
            var rotationAmount = mouseXDiff / 100;
            setRotation(rotationAngle + rotationAmount);
        }

        lastMousePos.x = x;
        lastMousePos.y = y;
    };

    var setup = function() {
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

            document.addEventListener("mousewheel", mouseWheelHandler, false);
            document.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
            document.addEventListener("contextmenu", disableContextMenu, false);

            /*
            document.addEventListener("keydown", function(e) {
                if (e.which === 189 || e.which === 79) {
                    setHeight(height + 1);
                } else if (e.which === 187 || e.which === 80) {
                    setHeight(height - 1);
                } else if (e.which === 49) {
                    window.app.newGame(Math.random());
                }
            });
            */
        }
    };

    setup();

    return {
        speed: speed,
        setPitch: setPitch,
        setHeight: setHeight,
        setRotation: setRotation,
        object: container
    };
};

module.exports = overheadControls;
