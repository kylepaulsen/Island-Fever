"use strict";

var fs = require("fs");

var helpers = require("../helpers");

var onOpen = function() {
    helpers.get("#screenCover")[0].style.display = "block";
    helpers.get("#newMapName")[0].value = "Untitled";
    helpers.get("#newMapSeed")[0].value = helpers.makeRandomString(16);
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/NewMapScreen.html"));
};

var generate = function() {
    var mapName = helpers.sanitize(helpers.get("#newMapName")[0].value);
    var seed = helpers.sanitize(helpers.get("#newMapSeed")[0].value);
    window.app.newGame(mapName, seed);
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    generate: generate
};
