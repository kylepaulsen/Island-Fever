"use strict";

var _ = require("underscore");

var helpers = require("./helpers");
var keyvalDB = require("./keyvalDB");
var loadTextures = require("./loadTextures");

require("../vendor/detectMobileBrowser.min");

var setupAndOpenDBs = function() {
    var db = keyvalDB("IslandFever", [
        {store: "maps", key: "name"},
        {store: "mapInfo", key: "name"}
    ], 2);
    helpers.setProperty(window.app, "db.context", db);
    helpers.setProperty(window.app, "db.maps", db.usingStore("maps"));
    helpers.setProperty(window.app, "db.mapInfo", db.usingStore("mapInfo"));

    return window.app.db.context.open();
};

var setup = function(moreFunctions) {
    moreFunctions = moreFunctions || {};
    window.app = {};
    window.app.mapLoaded = false;
    _.extend(window.app, moreFunctions);
    loadTextures();
    return setupAndOpenDBs();
};

module.exports = {
    setup: setup
};
