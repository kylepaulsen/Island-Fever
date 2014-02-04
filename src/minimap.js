"use strict";

var helpers = require("./helpers");

var minimap = function () {
    var ctx;
    var mapEl = helpers.get("#minimap")[0];
    if (!mapEl) {
        mapEl = helpers.html2Node("<canvas class='minimap'></canvas>");
        document.body.appendChild(mapEl);
    }
    ctx = mapEl.getContext("2d");

    var draw = function(data) {
        var heightmap = data.heightmap;
        var rows = data.rows;
        var cols = data.cols;
        var landAmplitude = data.landAmplitude;
        var sandHeight = data.sandHeight * landAmplitude;

        mapEl.width = cols;
        mapEl.height = rows;

        var x = cols;
        var y = rows;
        var height;
        var color;
        //var waterLevel = 0.3;
        while(x-- > 0) {
            while(y-- > 0) {
                height = heightmap[x * rows + y];
                color = 255 - height;
                height = Math.floor(landAmplitude * height / 255);
                if (height < sandHeight) {
                    ctx.fillStyle = "#000044";
                } else {
                    ctx.fillStyle = "rgb(0,"+color+",0)";
                }
                ctx.fillRect(x, y, 1, 1);
            }
            y = rows;
        }
    };

    return {
        draw: draw
    };
};

module.exports = minimap;
