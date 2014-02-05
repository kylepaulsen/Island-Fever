"use strict";

var fs = require("fs");

var helpers = require("../helpers");

var onOpen = function() {
    helpers.get("#screenCover")[0].style.display = "block";
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/InGameMenu.html"));
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
var resume = function() {
    window.app.ui.hide();
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    newGame: newGame,
    loadGame: loadGame,
    options: options,
    resume: resume
};
