"use strict";

var uiManager = require("./uiManager");
var mainMenu = require("./mainMenu");

var ui = function() {
    var allUi = uiManager();
    allUi.add(mainMenu);

    return allUi;
};

module.exports = ui;
