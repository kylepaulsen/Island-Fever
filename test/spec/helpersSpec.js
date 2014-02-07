"use strict";

var helpers = require("../../src/helpers");

describe("createEl()", function() {
    it("should create an element with the given tag name", function() {
        var el = helpers.createEl("div");
        expect(el.nodeName).toEqual("DIV");
    });
});
