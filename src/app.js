"use strict";

var _ = require("underscore");

var helpers = require("./helpers");
var keyvalDB = require("./keyvalDB");

var setupAndOpenDBs = function() {
    var db = keyvalDB("IslandFever", [
        {store: "maps", key: "name"}
    ], 1);
    helpers.setProperty(window.app, "db.context", db);
    helpers.setProperty(window.app, "db.maps", db.usingStore("maps"));
    return window.app.db.context.open();
};

var setup = function(moreFunctions) {
    moreFunctions = moreFunctions || {};
    window.app = {};
    _.extend(window.app, moreFunctions);
    return setupAndOpenDBs();
};

module.exports = {
    setup: setup
};
