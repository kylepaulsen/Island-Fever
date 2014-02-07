"use strict";

var testHelpers = require("../testHelpers");
var uiManager = require("../../src/uiManager");

var ui;
var mockUi;

var d0 = {
    nothing: function(){}
};

var setup = function() {
    window.innerHTML = "";
    ui = uiManager();
    mockUi = {
        getNewEl: function() {
            var el = document.createElement("div");
            el.id = "woo";
            el.dataset.action = "cool";
            return el;
        },
        cool: function(e){ d0.nothing(e); }
    };
};

beforeEach(setup);

describe("add()", function() {
    it("should append the element created from the getNewEl function to the body.", function() {
        ui.add(mockUi);
        var el = document.getElementById("woo");
        expect(el.nodeName).toEqual("DIV");
        expect(el.id).toEqual("woo");
    });

    it("should call the action function on the clicked element.", function() {
        spyOn(d0, "nothing");
        ui.add(mockUi);
        var el = document.getElementById("woo");
        testHelpers.click(el);
        expect(d0.nothing).toHaveBeenCalledWith(el);
    });

});
