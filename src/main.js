"use strict";

var THREE = require("three");

var helpers = require("./helpers");
var allUi = require("./ui");
var app = require("./app");
var islandGen = require("./islandGen");
var world = require("./world");
var overheadControls = require("./overheadControls");

var ui;
var camera;
var cameraControls;
var island;
var scene;
var renderer;

var rendererWidth = window.innerWidth;
var rendererHeight = window.innerHeight;

var newGame = function() {
    console.log("Generating island...");
    islandGen.generate("temp", "1").then(function(result) {
        console.log("Island saved!!!", result);
        island.load("temp");
    }, function(err) {
        console.error("Could not save island...", err);
    }).done();
};

var loadGame = function(name) {
    island.load(name);
};

var onWindowResize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

var setup = function() {
    camera = new THREE.PerspectiveCamera(75, rendererWidth/rendererHeight, 1, 10000);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x888888, 1, 120);

    cameraControls = overheadControls(camera);
    cameraControls.setHeight(30);
    cameraControls.setRotation(helpers.toRad(45));
    cameraControls.setPitch(helpers.toRad(-40));
    /*cameraControls.setHeight(200);
    cameraControls.setRotation(helpers.toRad(0));
    cameraControls.setPitch(helpers.toRad(-90));*/
    scene.add(cameraControls.object);

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 100;
    pointLight.position.y = 100;
    pointLight.position.z = -100;
    cameraControls.object.add(pointLight);

    var ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    island = world(scene);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x888888, 1);
    renderer.setSize(rendererWidth, rendererHeight);

    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);

    app.setup({
        newGame: newGame,
        loadGame: loadGame
    }).then(function () {
        ui = allUi();
        ui.show("mainMenu");
    }, function(err) {
        // something went wrong.
        console.err(err);
    }).done();
};

var render = function() {
    // note: three.js includes requestAnimationFrame shim
    window.requestAnimationFrame(render);

    // set middle chunk so we can load new chunks if needed.
    var camPos = cameraControls.object.position;
    island.setMiddleChunk(camPos.x, camPos.z);

    renderer.render(scene, camera);
};

setup();
render();
