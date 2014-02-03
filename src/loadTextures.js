"use strict";

var THREE = require("three");

var helpers = require("./helpers");

var loadTextures = function() {
    var terrainTexture = THREE.ImageUtils.loadTexture("textures/terrain.png");
    terrainTexture.magFilter = THREE.NearestFilter;
    terrainTexture.minFilter = THREE.NearestFilter;
    helpers.setProperty(window.app, "textures.terrain", terrainTexture);
    helpers.setProperty(window.app, "textures.water",
        THREE.ImageUtils.loadTexture("textures/water.png"));
};

module.exports = loadTextures;
