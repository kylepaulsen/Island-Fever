"use strict";

var helpers = require("./helpers");
var uiManager = require("./uiManager");
var uis = [
    require("./ui/mainMenu"),
    require("./ui/inGameMenu"),
    require("./ui/loadingScreen"),
    require("./ui/newMapScreen"),
    require("./ui/loadMapScreen"),
    require("./ui/deleteMapScreen")
];

var ui = function() {
    var allUi = uiManager();
    var t = uis.length;
    while (t-- > 0) {
        allUi.add(uis[t]);
    }

    helpers.get("#menuButton")[0].addEventListener(helpers.clickOrTouchEvent, function() {
        allUi.show("inGameMenu");
    });

    return allUi;
};

module.exports = ui;
