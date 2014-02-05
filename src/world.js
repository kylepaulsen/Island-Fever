"use strict";

var THREE = require("../vendor/three");
var _ = require("underscore");

var chunk = require("./chunk");
var minimap = require("./minimap");

var world = function(scene) {
    // chunkSize * chunkSize = number of voxels per chunk.
    var chunkSize = 32;
    // openGL length of one side of voxel;
    var voxelSize = 1;
    // chunkGroupSize * chunkGroupSize = number of chunks that must be loaded
    // centered on the middle chunk.
    var chunkGroupSize = 5;
    // noLoadZoneSize * noLoadZoneSize = area of chunks that a setMiddleChunk
    // must be out of to trigger a load of more chunks.
    var noLoadZoneSize = 1;
    // keepZoneSize * keepZoneSize = area of chunks that will stay loaded.
    var keepZoneSize = window.isMobile ? 13 : 21;
    // How much height variation the land has.
    var landAmplitude = 60;
    // the percentage height where other block types show up.
    var waterHeight = 0.3;
    var sandHeight = 0.32;
    var rockHeight = 1;
    var snowHeight = 1;

    var mapData;
    var smallMap = minimap();
    var heightmap;
    var middleChunk;
    var loadedChunks = {};
    var waterMesh;

    var makeWaterLevel = function(rows, cols) {
        var extraWaterSize = 300;
        rows += extraWaterSize;
        cols += extraWaterSize;
        var waterRows = rows * voxelSize;
        var waterCols = cols * voxelSize;
        var waterTexture = window.app.textures.water;
        waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
        waterTexture.repeat.set(rows, cols);

        var waterGeometry = new THREE.PlaneGeometry(waterCols, waterRows);
        var waterMesh1 = new THREE.Mesh(waterGeometry,
            new THREE.MeshBasicMaterial({map: waterTexture, transparent: true, opacity: 0.7}));
        var waterMesh2 = new THREE.Mesh(waterGeometry,
            new THREE.MeshBasicMaterial({map: waterTexture, transparent: true, opacity: 0.7}));
        var waterMesh3 = new THREE.Mesh(waterGeometry,
            new THREE.MeshBasicMaterial({map: waterTexture}));
        waterMesh1.rotateX(-Math.PI/2);
        waterMesh1.position.y = landAmplitude * waterHeight - (voxelSize / 2);
        waterMesh1.position.x = cols * voxelSize / 2 - extraWaterSize / 2;
        waterMesh1.position.z = rows * voxelSize / 2 - extraWaterSize / 2;
        waterMesh2.position.z = -1;
        waterMesh3.position.z = -2;
        waterMesh1.add(waterMesh2);
        waterMesh1.add(waterMesh3);
        return waterMesh1;
    };

    var load = function(name) {
        // remove all chunks
        findAndRemoveChunksOutsideKeepZone(Infinity, Infinity);
        window.app.db.maps.get(name).then(function(result) {
            mapData = result;
            if (waterMesh) {
                scene.remove(waterMesh);
            }
            waterMesh = makeWaterLevel(mapData.rows, mapData.cols);
            scene.add(waterMesh);
            heightmap = new Uint8Array(mapData.data);
            middleChunk = {x: 0, y: 0};
            smallMap.draw({
                heightmap: heightmap,
                rows: mapData.rows,
                cols: mapData.cols,
                waterHeight: waterHeight,
                landAmplitude: landAmplitude
            });
        }, function(e) {
            console.error("Failed to load map: "+name, e);
        }).done();
    };

    var parseChunkCoords = function(id) {
        var coords = id.split(",");
        return {
            x: coords[0],
            z: coords[1]
        };
    };

    var getChunkGroup = function(x, z) {
        var chunks = [];
        var half = Math.floor(chunkGroupSize / 2);
        var max = chunkGroupSize-half-1;
        var min = -half;
        for (var dx = min; dx <= max; ++dx) {
            for (var dz = min; dz <= max; ++dz) {
                chunks.push((x + dx) + "," + (z + dz));
            }
        }
        return chunks;
    };

    var findAndRemoveChunksOutsideKeepZone = function(activeChunkX, activeChunkZ) {
        var loadedChunkKeys = _.keys(loadedChunks);
        var t = loadedChunkKeys.length;
        var keepZone = keepZoneSize / 2;
        while(t-- > 0) {
            var chunkId = loadedChunkKeys[t];
            var chunkCoords = parseChunkCoords(chunkId);
            if (Math.abs(chunkCoords.x - activeChunkX) > keepZone ||
                Math.abs(chunkCoords.z - activeChunkZ) > keepZone) {
                scene.remove(loadedChunks[chunkId]);
                delete loadedChunks[chunkId];
            }
        }
    };

    var makeUnmadeChunks = function(chunksToMake) {
        if (chunksToMake.length <= 0) {
            return;
        }
        var chunkId = chunksToMake.pop();
        if (!loadedChunks[chunkId]) {
            //console.log("Making new chunk: " + chunkId);
            var newChunkCoord = parseChunkCoords(chunkId);
            var newChunk = chunk({
                chunkX: newChunkCoord.x,
                chunkZ: newChunkCoord.z,
                chunkSize: chunkSize,
                voxelSize: voxelSize,
                landAmplitude: landAmplitude,
                sandHeight: sandHeight,
                rockHeight: rockHeight,
                snowHeight: snowHeight,
                heightmap: heightmap,
                heightmapRows: mapData.rows,
                heightmapCols: mapData.cols
            });
            newChunk.position.x = newChunkCoord.x * chunkSize * voxelSize;
            newChunk.position.z = newChunkCoord.z * chunkSize * voxelSize;
            scene.add(newChunk);
            loadedChunks[chunkId] = newChunk;
            setTimeout(function() {
                makeUnmadeChunks(chunksToMake);
            }, 50);
        } else {
            makeUnmadeChunks(chunksToMake);
        }
    };

    var setMiddleChunk = function(x, z) {
        if (!heightmap) {
            // need a heightmap first.
            return;
        }
        var chunkx = Math.floor(x / chunkSize);
        var chunkz = Math.floor(z / chunkSize);
        if (Math.abs(chunkx - middleChunk.x) < (noLoadZoneSize / 2) &&
            Math.abs(chunkz - middleChunk.z) < (noLoadZoneSize / 2)) {
            // we are in the "no-load" zone.
            return;
        }
        middleChunk.x = chunkx;
        middleChunk.z = chunkz;

        var activeChunks = getChunkGroup(chunkx, chunkz);

        findAndRemoveChunksOutsideKeepZone(chunkx, chunkz);
        makeUnmadeChunks(activeChunks);
    };

    return {
        setMiddleChunk: setMiddleChunk,
        chunkSize: chunkSize,
        load: load
    };
};

module.exports = world;
