"use strict";

var fs = require("fs");
var _ = require("underscore");

var helpers = require("../helpers");

var selected;

var getSelectedEl = function() {
    if (selected) {
        var mapEntries = helpers.get("#loadMapList")[0].children;
        return _.find(mapEntries, function(entry){
            return helpers.sanitize(entry.dataset.name) === selected;
        });
    }
};

var selectMap = function(el) {
    var mapEntries = helpers.get("#loadMapList")[0].children;
    _.each(mapEntries, function(entry){
        entry.style.border = "2px solid rgba(102, 187, 255, 0)";
        entry.dataset.selected = "false";
    });
    el.style.border = "2px solid rgba(102, 187, 255, 1)";
    el.dataset.selected = "true";
    selected = helpers.sanitize(el.dataset.name);
};

var onOpen = function() {
    helpers.get("#screenCover")[0].style.display = "block";
    var mapsContainer = helpers.get("#loadMapList")[0];
    var mapEntryTemplate = fs.readFileSync("html/MapEntry.html");
    var html = "";
    window.app.db.mapInfo.getAll().then(function(results) {
        _.each(results, function(result) {
            html += _.template(mapEntryTemplate, result);
        });
        mapsContainer.innerHTML = html;
        if (selected) {
            selectMap(getSelectedEl());
        }
    });
    if (window.app.mapLoaded) {
        window.app.ui.setPreviousScreen("inGameMenu");
    } else {
        window.app.ui.setPreviousScreen("mainMenu");
    }
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/LoadMapScreen.html"));
};

var load = function() {
    if (selected) {
        window.app.loadGame(selected);
    }
};

var deleteMap = function() {
    if (selected) {
        window.app.ui.show("deleteMapScreen", [selected]);
    }
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    load: load,
    selectMap: selectMap,
    deleteMap: deleteMap
};
