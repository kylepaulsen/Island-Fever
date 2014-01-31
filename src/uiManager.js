"use strict";

var helpers = require("./helpers");

var UIManager = function() {

    var uiDictionary = {};
    var currentUi;

    var add = function(uiObj) {
        var el = uiObj.el;
        helpers.listen(el, "click", function(evt) {
            var target = evt.target;
            var action = target.dataset.action;
            if (action) {
                if (uiObj[action]) {
                    uiObj[action](evt);
                } else {
                    console.error("No action '"+action+"' in:", uiObj);
                }
            }
        });
        document.body.appendChild(el);
        uiDictionary[el.id] = el;
    };

    var show = function(id) {
        if (currentUi) {
            currentUi.style.display = "none";
        }
        var uiToShow = uiDictionary[id];
        if (uiToShow) {
            uiToShow.style.display = "block";
        } else {
            console.error("No such ui: ", id);
        }
        currentUi = uiToShow;
    };

    helpers.setProperty(window.app, "ui.add", add);
    helpers.setProperty(window.app, "ui.show", show);

    return {
        add: add,
        show: show
    };
};

module.exports = UIManager;
