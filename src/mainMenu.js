"use strict";

var fs = require("fs");

var helpers = require("./helpers");

var el = helpers.html2Node(fs.readFileSync("html/MainMenu.html"));

var newGame = function() {
    window.app.newGame();
    window.app.ui.hide();
};
var loadGame = function() {
    //window.app.ui.show("loadGame");
    window.app.loadGame("temp");
    window.app.ui.hide();
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
