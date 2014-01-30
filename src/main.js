"use strict";

var THREE = require("three");

var app = require("./app");

var ui;
var camera;
var scene;
var renderer;

var rendererWidth = window.innerWidth;
var rendererHeight = window.innerHeight;

var setup = function() {
    camera = new THREE.PerspectiveCamera(75, rendererWidth/rendererHeight, 1, 10000);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x888888, 1);
    renderer.setSize(rendererWidth, rendererHeight);

    document.body.appendChild(renderer.domElement);

    ui = require("./ui");
    ui.show("mainMenu");
};

var render = function() {
    // note: three.js includes requestAnimationFrame shim
    window.requestAnimationFrame(render);

    renderer.render(scene, camera);
};

app.setup({
    newGame: function() {
        console.log("NEW GAME");
    }
});

setup();
render();
