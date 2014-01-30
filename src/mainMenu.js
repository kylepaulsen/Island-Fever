"use strict";

var fs = require("fs");

var helpers = require("./helpers");

var el = helpers.html2Node(fs.readFileSync("html/MainMenu.html"));

var newGame = window.app.newGame;
var loadGame = function() {
    window.app.ui.show("loadGame");
};
var options = function() {
    window.app.ui.show("options");
};

module.exports = {
    el: el,
    newGame: newGame,
    loadGame: loadGame,
    options: options
};
