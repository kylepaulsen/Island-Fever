"use strict";

var q = require("q");
var _ = require("underscore");

var helpers = require("./helpers");

var keyvalDB = function(dbName, schemaDef, version, options) {
    options = options || {};
    var schema = {};
    if (_.isArray(schemaDef)) {
        _.each(schemaDef, function(store) {
            schema[store.store] = store;
        });
    }
    var db;
    var isDBOpen = false;
    version = version || 1;

    var storeAccess = function(dbStoreName, dbKeyName) {
        var getObjectStore = function(storeName, mode) {
            var tx = db.transaction(storeName, mode);
            return tx.objectStore(storeName);
        };

        var clearStore = function() {
            var defer = q.defer();
            var store = getObjectStore(dbStoreName, "readwrite");
            var req = store.clear();
            req.onsuccess = function(evt) {
                defer.resolve(evt);
            };
            req.onerror = function(evt) {
                console.error("clearObjectStore:", evt.target.errorCode);
                defer.reject(evt);
            };
            return defer.promise;
        };

        var insert = function(key, obj) {
            var defer = q.defer();
            var store = getObjectStore(dbStoreName, "readwrite");
            var req;

            obj[dbKeyName] = key;
            req = store.add(obj);

            req.onsuccess = function(evt) {
                defer.resolve(evt);
            };
            req.onerror = function(evt) {
                console.error("insert:", evt.target.error);
                defer.reject(evt.target.error);
            };
            return defer.promise;
        };

        var update = function(key, obj) {
            var defer = q.defer();
            var store = getObjectStore(dbStoreName, "readwrite");
            var req;

            obj[dbKeyName] = key;
            req = store.put(obj);

            req.onsuccess = function(evt) {
                defer.resolve(evt);
            };
            req.onerror = function(evt) {
                console.error("update:", evt.target.error);
                defer.reject(evt.target.error);
            };
            return defer.promise;
        };

        var remove = function(key) {
            var defer = q.defer();
            var store = getObjectStore(dbStoreName, "readwrite");
            var req;

            req = store.delete(key);

            req.onsuccess = function(evt) {
                defer.resolve(evt);
            };
            req.onerror = function(evt) {
                console.error("delete:", evt.target.error);
                defer.reject(evt.target.error);
            };
            return defer.promise;
        };

        var get = function(key) {
            var defer = q.defer();
            var store = getObjectStore(dbStoreName, "readonly");
            var req = store.get(key);
            req.onsuccess = function(evt) {
                var record = evt.target.result;
                defer.resolve(record);
            };
            req.onerror = function (evt) {
                console.error("get:", evt.target.errorCode);
                defer.reject(evt.target.error);
            };
            return defer.promise;
        };

        var getAll = function() {
            var defer = q.defer();
            var ans = [];
            var store = getObjectStore(dbStoreName, "readonly");
            var myCursor = store.openCursor();
            myCursor.onsuccess = function(evt) {
                var cursor = evt.target.result;
                if (cursor) {
                    ans.push(cursor.value);
                    cursor.continue();
                } else {
                    defer.resolve(ans);
                }
            };
            myCursor.onerror = function(evt) {
                console.error("getAll:", evt.target.errorCode);
                defer.reject(evt.target.error);
            };
            return defer.promise;
        };

        var methods = {
            insert: insert,
            update: update,
            upsert: update,
            remove: remove,
            clearStore: clearStore,
            get: get,
            getAll: getAll
        };

        methods.delete = remove;

        return methods;
    };

    var addStore = function(storeObj) {
        if (helpers.isJsObject(storeObj)) {
            schema[storeObj.store] = storeObj;
        } else if (_.isArray(storeObj)) {
            _.each(storeObj, function(val) {
                schema[val.store] = val;
            });
        } else {
            console.error("Must pass in object or array: [{store: 'myStore', key: 'id'}]");
        }
    };

    var open = function() {
        var defer = q.defer();
        if (isDBOpen) {
            var err = "Db is already open.";
            console.error(err);
            defer.reject(err);
            return defer.promise;
        }
        var req = window.indexedDB.open(dbName, version);
        req.onsuccess = function(evt) {
            db = req.result;
            isDBOpen = true;
            defer.resolve(evt);
        };
        req.onerror = function(evt) {
            console.error("openDb:", evt.target.errorCode);
            defer.reject(evt);
        };
        req.onupgradeneeded = function(evt) {
            var storeNames = req.result.objectStoreNames;
            _.each(schema, function(storeObj) {
                if (!storeNames.contains(storeObj.store)) {
                    evt.currentTarget.result.createObjectStore(storeObj.store, {keyPath: storeObj.key});
                }
            });
            if (options.onUpgrade) {
                options.onUpgrade(evt.target.result);
            }
        };
        return defer.promise;
    };

    var close = function() {
        isDBOpen = false;
        db.close();
    };

    var isOpen = function() {
        return isDBOpen;
    };

    var deleteDatabase = function() {
        var defer = q.defer();
        if (isDBOpen) {
            var err = "Can't close db while it is open! Call close first!";
            console.error(err);
            defer.reject(err);
            return defer.promise;
        }
        var req = window.indexedDB.deleteDatabase(dbName);
        req.onsuccess = function(evt) {
            defer.resolve(evt);
        };
        req.onerror = function(evt) {
            console.error("deleteDb:", evt.target.errorCode);
            defer.reject(evt.target.error);
        };
        return defer.promise;
    };

    var usingStore = function(store, key) {
        var keyName = key || schema[store].key;
        return storeAccess(store, keyName);
    };

    return {
        addStore: addStore,
        open: open,
        close: close,
        isOpen: isOpen,
        deleteDatabase: deleteDatabase,
        usingStore: usingStore
    };
};

module.exports = keyvalDB;
