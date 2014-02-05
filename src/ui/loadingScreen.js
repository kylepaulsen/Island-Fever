"use strict";

var fs = require("fs");

var helpers = require("../helpers");

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/LoadingScreen.html"));
};

var setText = function(text) {
    var el = helpers.get("#loadingScreenText")[0];
    el.innerHTML = text;
};

module.exports = {
    getNewEl: getNewEl,
    setText: setText
};
