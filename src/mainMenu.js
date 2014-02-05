"use strict";

var fs = require("fs");

var helpers = require("./helpers");

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/MainMenu.html"));
};

var newGame = function() {
    window.app.newGame();
};
var loadGame = function() {
    window.app.loadGame("temp");
};
var options = function() {
    window.app.ui.show("options");
};

module.exports = {
    getNewEl: getNewEl,
    newGame: newGame,
    loadGame: loadGame,
    options: options
};
