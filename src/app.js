"use strict";

var _ = require("underscore");

var setup = function(moreFunctions) {
    moreFunctions = moreFunctions || {};
    window.app = {};
    _.extend(window.app, moreFunctions);
};

module.exports = {
    setup: setup
};
