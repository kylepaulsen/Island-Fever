"use strict";

var THREE = require("../vendor/three");
var _ = require("underscore");

var helpers = require("./helpers");
var allUi = require("./ui");
var app = require("./app");
var islandGen = require("./islandGen");
var world = require("./world");
var overheadControls = require("./overheadControls");
var loadingScreen = require("./loadingScreen");

var ui;
var camera;
var cameraControls;
var island;
var scene;
var renderer;

var rendererWidth = window.innerWidth;
var rendererHeight = window.innerHeight;

var loadGame = function(name) {
    loadingScreen.setText("Loading Chunks...<br>0%");
    ui.show("loadingScreen");
    island.load(name).then(function() {
        ui.hide();
    }, function() {
        loadingScreen.setText("Error loading chunks!");
        console.error("Something went wrong...");
    }, function(progress) {
        loadingScreen.setText("Loading Chunks...<br>" + progress + "%");
    }).done();
};

var newGame = function(seed) {
    seed = seed || "1";
    console.log("Generating island...");
    loadingScreen.setText("Generating Island...");
    ui.show("loadingScreen");
    _.delay(function() {
        islandGen.generate("temp", seed).then(function(result) {
            console.log("Island saved!!!", result);
            loadGame("temp");
        }, function(err) {
            console.error("Could not save island...", err);
        }).done();
    }, 100);
};

var onWindowResize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

var setup = function() {
    camera = new THREE.PerspectiveCamera(75, rendererWidth/rendererHeight, 1, 10000);
    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog(0x888888, 1, 120);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x888888, 1);
    renderer.setSize(rendererWidth, rendererHeight);

    document.body.appendChild(renderer.domElement);
    // this hack makes sure the canvas never "scrolls" off the screen.
    renderer.domElement.style.position = "fixed";
    window.addEventListener("resize", onWindowResize, false);

    cameraControls = overheadControls(camera);
    cameraControls.setHeight(50);
    cameraControls.setRotation(helpers.toRad(135));
    cameraControls.setPitch(helpers.toRad(-40));
    cameraControls.setXZ(300, 300);
    window.lol = cameraControls;
    /*cameraControls.setHeight(200);
    cameraControls.setRotation(helpers.toRad(0));
    cameraControls.setPitch(helpers.toRad(-90));*/
    scene.add(cameraControls.object);

    var pointLight = new THREE.PointLight(0x666666);
    pointLight.position.x = -100;
    pointLight.position.y = 100;
    pointLight.position.z = 100;
    cameraControls.object.add(pointLight);

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    island = world(scene);

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
