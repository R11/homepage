R11.saveSystem = {
    retrieve: function (file) {
        return JSON.parse(localStorage.getItem(file)) || false;
    },
    create: function (file, value) {
        return localStorage.setItem(file, JSON.stringify(value));
    },
    clearAll: function () {
        return localStorage.clear();
    },
    remove: function (file) {
        return localStorage.removeItem(file);
    }
}


//localStorage.retrieve = function (obj) {
//        return JSON.parse(this[obj])
//}

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

var request = window.indexedDB.open("test");
var db;
request.onerror = function(e) {
    console.log('db error: ' + e.target.errorCode);
};
request.onsuccess = function(e) {
    console.log('db success!')
    db = request.result;
    console.log(db)
  // Do something with request.result!
};

request.onupgradeneeded = function (e) {
    db = e.target.result;
    
    var objectStore = db.createObjectStore("pixels", { keyPath: "pixel"});
    
    objectStore.createIndex('x', 'x', {unique: false});
    objectStore.createIndex('y', 'y', {unique: false});
    objectStore.createIndex('r', 'r', {unique: false});
    objectStore.createIndex('g', 'g', {unique: false});
    objectStore.createIndex('b', 'b', {unique: false});
    objectStore.createIndex('a', 'a', {unique: false});
    
    objectStore.transaction.oncomplete = function (e) {
        var pixelObjectStore = db.transaction('pixels', 'readwrite').objectStore('pixels');
        var i;
        
    }
}

R11.db = {
    get: function (name) {
        return indexedDB && indexedDB.open(name);
    },
    scan: function (name, property, value) {
        
    }
}
