"use strict";

var fs = require("fs");

var helpers = require("../helpers");

var onOpen = function() {
    helpers.get("#screenCover")[0].style.display = "block";
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/MainMenu.html"));
};

var newGame = function() {
    window.app.ui.show("newMapScreen");
};
var loadGame = function() {
    window.app.loadGame("temp");
};
var options = function() {
    window.app.ui.show("options");
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    newGame: newGame,
    loadGame: loadGame,
    options: options
};
