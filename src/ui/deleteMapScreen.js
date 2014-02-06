"use strict";

var fs = require("fs");
var q = require("q");

var helpers = require("../helpers");
var loadingScreen = require("./loadingScreen");

var mapToDelete;
var onOpen = function(mapName) {
    mapToDelete = mapName;
    helpers.get("#screenCover")[0].style.display = "block";
    helpers.get("#deleteMapTitle")[0].innerHTML = mapName;
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/DeleteMapScreen.html"));
};

var deleteMap = function() {
    loadingScreen.setText("Deleting Map " + mapToDelete + " ...");
    window.app.ui.show("loadingScreen");
    q.all([
        window.app.db.maps.remove(mapToDelete),
        window.app.db.mapInfo.remove(mapToDelete)
    ]).then(function() {
        if (window.app.mapLoaded === mapToDelete) {
            window.app.ui.show("mainMenu");
        } else {
            window.app.ui.show("loadMapScreen");
        }
        if (window.app.mapLoaded) {
            window.app.ui.setPreviousScreen("inGameMenu");
        } else {
            window.app.ui.setPreviousScreen("mainMenu");
        }
    }).done();
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    deleteMap: deleteMap
};
