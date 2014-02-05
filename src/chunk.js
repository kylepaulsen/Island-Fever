"use strict";

var THREE = require("../vendor/three");

var chunk = function(data) {
    var chunkX = data.chunkX;
    var chunkZ = data.chunkZ;
    var chunkSize = data.chunkSize;
    var heightmap = data.heightmap;
    var heightmapRows = data.heightmapRows;
    var heightmapCols = data.heightmapCols;
    var voxelSize = data.voxelSize;
    var landAmplitude = data.landAmplitude;
    var sandHeight = data.sandHeight * landAmplitude;
    var rockHeight = data.rockHeight * landAmplitude;
    var snowHeight = data.snowHeight * landAmplitude;

    // current voxel's position in the chunk.
    var blockPosInChunk = {x: chunkSize, z: chunkSize};

    var geom = new THREE.Geometry();
    var vertIndices = {};
    vertIndices.length = 0;

    var putVert = function(x, y, z) {
        var vertId = x+","+y+","+z;
        if (vertIndices[vertId] === undefined) {
            vertIndices[vertId] = vertIndices.length++;
            geom.vertices.push(new THREE.Vector3(x, y, z));
        }
        return vertIndices[vertId];
    };

    var addFace = function(corners, normal) {
        var face = new THREE.Face3(corners[0], corners[1], corners[2]);
        face.normal.set(normal[0], normal[1], normal[2]);
        geom.faces.push(face);
        face = new THREE.Face3(corners[1], corners[3], corners[2]);
        face.normal.set(normal[0], normal[1], normal[2]);
        geom.faces.push(face);
    };

    var applyTexture = function(id, flip) {
        var step = 0.0625;
        var u = (id % 16) * step;
        var v = 1 - (Math.floor(id / 16) * step);
        var corners = [];
        corners[0] = new THREE.Vector2(u, v-step);
        corners[1] = new THREE.Vector2(u, v);
        corners[2] = new THREE.Vector2(u+step, v-step);
        corners[3] = new THREE.Vector2(u+step, v);
        if (flip) {
            geom.faceVertexUvs[0].push([corners[1], corners[0], corners[3]]);
            geom.faceVertexUvs[0].push([corners[0], corners[2], corners[3]]);
        } else {
            geom.faceVertexUvs[0].push([corners[0], corners[1], corners[2]]);
            geom.faceVertexUvs[0].push([corners[1], corners[3], corners[2]]);
        }
    };

    var getBlockTextureType = function(x, z, wall) {
        var y = getHeight(x, z);
        var textureTypes = {
            grass: 0,
            //dirt: 126,
            dirt: 3,
            sand: 18,
            rock: 19,
            snow: 66
        };
        var wallConversions = {};
        wallConversions[textureTypes.grass] = textureTypes.dirt;

        var textureType = textureTypes.grass;

        if (y < sandHeight) {
            textureType = textureTypes.sand;
        }
        if (y > rockHeight) {
            textureType = textureTypes.rock;
        }
        if (y > snowHeight) {
            textureType = textureTypes.snow;
        }

        /*if (rocksNoise.getHeight(x, z) > 0.8) {
            textureType = textureTypes.rock;
        }*/

        if (wall && wallConversions[textureType]) {
            textureType = wallConversions[textureType];
        }
        return textureType;
    };

    var getHeight = function(x, z) {
        if (x < 0 || z < 0) {
            return 0;
        }
        if (x >= heightmapCols || z >= heightmapRows) {
            return 0;
        }
        var height = heightmap[x * heightmapRows + z] || 0;
        //return (height >> 3) * voxelSize; // this is like: 32 * height / 256
        return Math.floor(landAmplitude * height / 255) * voxelSize;
    };

    var createMesh = function() {
        /*jshint maxstatements: 100 */
        while (blockPosInChunk.z-- > 0) {
            while (blockPosInChunk.x-- > 0) {
                var corners = [];
                var normalDirection;
                var textureType = 0;

                // x, z coords of block in the grid of blocks of the world (whole numbers)
                var blockPosInWorld = {x: chunkX * chunkSize + blockPosInChunk.x,
                    z: chunkZ * chunkSize + blockPosInChunk.z};
                // y coord of block in global opengl space
                var curHeight = getHeight(blockPosInWorld.x, blockPosInWorld.z);
                // x, z coords of block in chunk opengl space
                var blockPosInOGL = {x: blockPosInChunk.x * voxelSize, z: blockPosInChunk.z * voxelSize};

                // main surface
                corners[0] = putVert(blockPosInOGL.x, curHeight, blockPosInOGL.z);
                corners[1] = putVert(blockPosInOGL.x, curHeight, blockPosInOGL.z + voxelSize);
                corners[2] = putVert(blockPosInOGL.x + voxelSize, curHeight, blockPosInOGL.z);
                corners[3] = putVert(blockPosInOGL.x + voxelSize, curHeight, blockPosInOGL.z + voxelSize);

                addFace(corners, [0, 1, 0]);
                applyTexture(getBlockTextureType(blockPosInWorld.x, blockPosInWorld.z));

                // south wall
                var sHeight = getHeight(blockPosInWorld.x, blockPosInWorld.z + 1);
                if (sHeight !== curHeight) {
                    corners[0] = putVert(blockPosInOGL.x, curHeight, blockPosInOGL.z + voxelSize);
                    corners[1] = putVert(blockPosInOGL.x, sHeight, blockPosInOGL.z + voxelSize);
                    corners[2] = putVert(blockPosInOGL.x + voxelSize, curHeight, blockPosInOGL.z + voxelSize);
                    corners[3] = putVert(blockPosInOGL.x + voxelSize, sHeight, blockPosInOGL.z + voxelSize);

                    if (sHeight > curHeight) {
                        normalDirection = -1;
                        textureType = getBlockTextureType(blockPosInWorld.x, blockPosInWorld.z + 1, true);
                    } else {
                        normalDirection = 1;
                        textureType = getBlockTextureType(blockPosInWorld.x, blockPosInWorld.z, true);
                    }
                    addFace(corners, [0, 0, normalDirection]);
                    applyTexture(textureType, sHeight < curHeight);
                }

                // east wall
                var eHeight = getHeight(blockPosInWorld.x + 1, blockPosInWorld.z);
                if (eHeight !== curHeight) {
                    corners[0] = putVert(blockPosInOGL.x + voxelSize, curHeight, blockPosInOGL.z + voxelSize);
                    corners[1] = putVert(blockPosInOGL.x + voxelSize, eHeight, blockPosInOGL.z + voxelSize);
                    corners[2] = putVert(blockPosInOGL.x + voxelSize, curHeight, blockPosInOGL.z);
                    corners[3] = putVert(blockPosInOGL.x + voxelSize, eHeight, blockPosInOGL.z);

                    if (eHeight > curHeight) {
                        normalDirection = -1;
                        textureType = getBlockTextureType(blockPosInWorld.x + 1, blockPosInWorld.z, true);
                    } else {
                        normalDirection = 1;
                        textureType = getBlockTextureType(blockPosInWorld.x, blockPosInWorld.z, true);
                    }
                    addFace(corners, [normalDirection, 0, 0]);
                    applyTexture(textureType, eHeight < curHeight);
                }

                // add other features to this block
                /*
                if (curHeight >= sandHeight && randomGenerator.random() < 0.005) {
                    var treePos = {
                        x: blockPosInWorld.x * voxelSize + voxelSize / 2,
                        y: curHeight,
                        z: blockPosInWorld.z * voxelSize + voxelSize / 2
                    }
                    scene.add(new THREE.models.Tree(treePos.x, treePos.y, treePos.z));
                }
                */
            }
            blockPosInChunk.x = chunkSize;
        }

        //return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({wireframe: true, color: 0xff0000}));
        //return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({map: terrainTexture}));
        return new THREE.Mesh(geom,
            new THREE.MeshLambertMaterial({map: window.app.textures.terrain}));
    };

    return createMesh();
};

module.exports = chunk;
