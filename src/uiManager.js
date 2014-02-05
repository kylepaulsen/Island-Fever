"use strict";

var helpers = require("./helpers");

var UIManager = function() {

    var uiElDictionary = {};
    var uiDictionary = {};
    var currentUi;
    var screenCover = helpers.get("#screenCover")[0];

    var add = function(uiObj) {
        var el = uiObj.getNewEl();
        el.style.display = "none";
        el.addEventListener(helpers.clickOrTouchEvent, function(evt) {
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
        uiDictionary[el.id] = uiObj;
        uiElDictionary[el.id] = el;
    };

    var hide = function() {
        if (currentUi) {
            currentUi.style.display = "none";
            screenCover.style.display = "none";
        }
    };

    var show = function(id) {
        var uiToShow = uiElDictionary[id];
        if (uiToShow) {
            hide();
            uiToShow.style.display = "block";
            if (uiDictionary[id].onOpen) {
                uiDictionary[id].onOpen();
            }
            currentUi = uiToShow;
        } else {
            console.error("No such ui: ", id);
        }
    };


    helpers.setProperty(window.app, "ui.add", add);
    helpers.setProperty(window.app, "ui.show", show);
    helpers.setProperty(window.app, "ui.hide", hide);

    return {
        add: add,
        show: show,
        hide: hide
    };
};

module.exports = UIManager;
