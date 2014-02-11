"use strict";

var fs = require("fs");

var helpers = require("../helpers");

var onOpen = function() {
    helpers.get("#screenCover")[0].style.display = "block";
};

var getNewEl = function() {
    return helpers.html2Node(fs.readFileSync("html/HelpScreen.html"));
};

var resume = function() {
    window.app.ui.hide();
};

module.exports = {
    getNewEl: getNewEl,
    onOpen: onOpen,
    resume: resume
};
