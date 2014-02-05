"use strict";

var helpers = require("./helpers");

var seededRandom = require("../vendor/seedRandom");
var perlinNoise = require("../vendor/perlinNoise");

// This file has some weird code, I know. Performance is the #1 thing on my mind.

// ISLAND GEN STATIC VARS ================
var numElevationChangers = 5000;
var elevationChangerLife = 100;
var tileMat;
var numColumns = 960;
var numRows = 960;
var numTileColumns = Math.floor(numColumns / 8);
var numTileRows = Math.floor(numRows / 8);
var elevationChangerMinXStartPos = Math.floor(3 * numTileColumns / 16);
var elevationChangerMinYStartPos = Math.floor(3 * numTileRows / 16);
var elevationChangerMaxXStartPos = Math.floor(13 * numTileColumns / 16);
var elevationChangerMaxYStartPos = Math.floor(13* numTileRows / 16);
var elevationChangers;
var moveChoices = [
    {x: -1, y: 0},
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: 1, y: 0}
];
var numMoveChoices = moveChoices.length;
// ISLAND GEN STATIC VARS ================

var randomGenerator;
var heightNoise;

var randInt = function(low, high){
    return Math.floor(randomGenerator.random()*(high-low+1))+low;
};

// using prototype for performance.
var ElevationChanger = function(life) {
    this.life = life;
    this.pos = {
        x: randInt(elevationChangerMinXStartPos, elevationChangerMaxXStartPos),
        y: randInt(elevationChangerMinYStartPos, elevationChangerMaxYStartPos)
    };
    // inc initial spot.
    ++tileMat[this.pos.x][this.pos.y];
};

ElevationChanger.prototype.isValidMove = function(x, y, currentVal) {
    if (x < 0 || y < 0) {
        return false;
    }
    if (x >= numTileColumns || y >= numTileRows) {
        return false;
    }
    if (tileMat[x][y] > currentVal) {
        return false;
    }
    return true;
};

ElevationChanger.prototype.findPossibleMovements = function() {
    var ans = [];
    var t = numMoveChoices;
    while (t-- > 0) {
        var move = moveChoices[t];
        if (this.isValidMove(this.pos.x + move.x, this.pos.y + move.y, tileMat[this.pos.x][this.pos.y])) {
            ans.push(move);
        }
    }
    return ans;
};

ElevationChanger.prototype.move = function() {
    if (this.life <= 0) {
        return;
    }
    var possibleMoves = this.findPossibleMovements();
    if (possibleMoves.length === 0) {
        this.life = 0;
        return;
    }
    var moveToMake = possibleMoves[randInt(0, possibleMoves.length-1)];
    this.pos.x += moveToMake.x;
    this.pos.y += moveToMake.y;
    ++tileMat[this.pos.x][this.pos.y];
    --this.life;
};

var findMinMax = function() {
    var tileMin = Infinity;
    var tileMax = -Infinity;
    var x = 0;
    var y;
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            tileMin = Math.min(tileMat[x][y], tileMin);
            tileMax = Math.max(tileMat[x][y], tileMax);
            ++y;
        }
        ++x;
    }
    return {
        min: tileMin,
        max: tileMax
    };
};

var normalizeAndAddNoise = function() {
    var tiles = findMinMax();
    var range = tiles.max - tiles.min;
    var x = 0;
    var y;
    x = 0;
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            tileMat[x][y] = ((tileMat[x][y] - tiles.min) / range) * heightNoise.getHeight(x, y);
            ++y;
        }
        ++x;
    }
    tiles = findMinMax();
    var coef = 1 / tiles.max;
    x = 0;
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            tileMat[x][y] = tileMat[x][y] * coef;
            ++y;
        }
        ++x;
    }
};

var enlarge = function() {
    var oldTileMat = tileMat;
    var x = 0;
    var y;
    tileMat = helpers.makeZeroFillMatrix(numTileColumns * 2, numTileRows * 2);
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            var twox = x * 2;
            var twoy = y * 2;
            tileMat[twox][twoy] = oldTileMat[x][y];
            tileMat[twox+1][twoy] = oldTileMat[x][y];
            tileMat[twox][twoy+1] = oldTileMat[x][y];
            tileMat[twox+1][twoy+1] = oldTileMat[x][y];
            ++y;
        }
        ++x;
    }

    numTileColumns = numTileColumns * 2;
    numTileRows = numTileRows * 2;
};

var isInBounds = function(x, y) {
    if (x < 0 || y < 0) {
        return false;
    }
    if (x >= numTileColumns || y >= numTileRows) {
        return false;
    }
    return true;
};

var boxBlur = function(px, py) {
    var height = tileMat[px][py];
    var blurRadius = Math.floor((1 - height) * 4) + 2;
    var sum = 0;
    var num = 0;
    var lowerBound = -blurRadius+1;
    var upperBound = blurRadius;

    var x = lowerBound;
    var y;
    while (x < upperBound) {
        y = lowerBound;
        while (y < upperBound) {
            if (isInBounds(px + x, py + y)) {
                sum += tileMat[px + x][py + y];
                ++num;
            }
            ++y;
        }
        ++x;
    }
    return sum/num;
};

var blurMap = function() {
    var newTileMat = helpers.makeZeroFillMatrix(numTileColumns, numTileRows);
    var x = 0;
    var y;
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            newTileMat[x][y] = boxBlur(x, y);
            ++y;
        }
        ++x;
    }
    tileMat = newTileMat;
};

var packLevelData = function() {
    var elevationArray = new Uint8Array(numTileRows * numTileColumns);
    var idx = 0;
    var x = 0;
    var y;
    while (x < numTileColumns) {
        y = 0;
        while (y < numTileRows) {
            elevationArray[idx] = Math.floor(255 * tileMat[x][y]);
            ++idx;
            ++y;
        }
        ++x;
    }
    return elevationArray;
};

var storeIsland = function(name, seed) {
    var data = packLevelData();
    var mapInfo = {
        seed: seed,
        created: Date.now(),
        data: data.buffer,
        rows: numTileRows,
        cols: numTileColumns
    };
    return window.app.db.maps.upsert(name, mapInfo);
};

var generateIsland = function(name, seed) {
    randomGenerator = seededRandom(seed);
    heightNoise = perlinNoise(randomGenerator, 20, 20);
    numTileColumns = Math.floor(numColumns / 8);
    numTileRows = Math.floor(numRows / 8);
    tileMat = helpers.makeZeroFillMatrix(numTileColumns, numTileRows);
    elevationChangers = [];
    elevationChangers.length = numElevationChangers;
    var t = 0;
    while (t < numElevationChangers) {
        elevationChangers[t] = new ElevationChanger(elevationChangerLife);
        ++t;
    }
    var life = 0;
    var eleChanger;
    while (life < elevationChangerLife) {
        eleChanger = 0;
        while (eleChanger < numElevationChangers) {
            elevationChangers[eleChanger].move();
            ++eleChanger;
        }
        ++life;
    }
    normalizeAndAddNoise();
    t = 0;
    // zoom, enhance, zoom, enhance
    while (t < 3) {
        enlarge();
        blurMap();
        ++t;
    }
    return storeIsland(name, seed);
};

module.exports = {
    generate: generateIsland
};
