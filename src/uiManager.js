"use strict";

var helpers = require("./helpers");

var UIManager = function() {

    var uiElDictionary = {};
    var uiDictionary = {};
    var currentUi;
    var previousUi;
    var screenCover = helpers.get("#screenCover")[0];

    var handleAction = function(parentEl, target, uiObj) {
        var action = target.dataset.action;
        if (action) {
            if (action === "back" && previousUi) {
                show(previousUi);
            } else if (uiObj[action]) {
                uiObj[action](target);
            } else {
                console.error("No action '"+action+"' in:", uiObj);
            }
        } else {
            if (target !== parentEl && target.parentNode) {
                handleAction(parentEl, target.parentNode, uiObj);
            }
        }
    };

    var add = function(uiObj) {
        var el = uiObj.getNewEl();
        el.style.display = "none";
        el.addEventListener(helpers.clickOrTouchEvent, function(evt) {
            handleAction(el, evt.target, uiObj);
        });
        document.body.appendChild(el);
        uiDictionary[el.id] = uiObj;
        uiElDictionary[el.id] = el;
    };

    var hide = function() {
        if (currentUi) {
            previousUi = currentUi.id;
            currentUi.style.display = "none";
            screenCover.style.display = "none";
        }
    };

    var show = function(id, args) {
        var uiToShow = uiElDictionary[id];
        if (uiToShow) {
            hide();
            uiToShow.style.display = "block";
            if (uiDictionary[id].onOpen) {
                uiDictionary[id].onOpen.apply(null, args);
            }
            currentUi = uiToShow;
        } else {
            console.error("No such ui: ", id);
        }
    };

    var setPreviousScreen = function(id) {
        var ui = uiElDictionary[id];
        if (ui) {
            previousUi = id;
        } else {
            console.error("No such ui: ", id);
        }
    };

    var pub = {
        add: add,
        show: show,
        hide: hide,
        setPreviousScreen: setPreviousScreen
    };

    window.app.ui = pub;

    return pub;
};

module.exports = UIManager;
