"use strict";

var helpers = require("./helpers");
var uiManager = require("./uiManager");
var uis = [
    require("./mainMenu"),
    require("./loadingScreen")
];

var ui = function() {
    var allUi = uiManager();
    var t = uis.length;
    while (t-- > 0) {
        allUi.add(uis[t]);
    }

    helpers.get("#menuButton")[0].addEventListener(helpers.clickOrTouchEvent, function() {
        allUi.show("mainMenu");
    });

    return allUi;
};

module.exports = ui;
