const DB_VERSION = 2;
const DB_NAME = "vid-voter";

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (!self.indexedDB) {
            reject("IndexedDB not supported");
        }

        const request = self.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject("DB error: " + event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const upgradeTransaction = event.target.transaction;
            let videoStore;

            if (!db.objectStoreNames.contains("videos")) {
                videoStore = db.createObjectStore("videos", {keyPath: "id"});
            } else {
                videoStore = upgradeTransaction.objectStore("videos");
            }

            if (!videoStore.indexNames.contains("idx_status")) {
                videoStore.createIndex("idx_status", "status", { unique: false });
            }

        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
};

const openObjectStore = (db, name, transactionMode) => {
    return db.transaction(name, transactionMode).objectStore(name);
};

const addObject = (storeName, object) => {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            openObjectStore(db, storeName, "readwrite")
                .add(object)
                .onsuccess = resolve;
        }).catch(reason => reject(reason));
    });
};

const updateObject = (storeName, id, object) => {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            openObjectStore(db, storeName, "readwrite")
                .openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) {
                    reject(`No object store found for '${storeName}'`)
                }

                if (cursor.value.id === id) {
                    cursor.update(object).onsuccess = resolve;
                }

                cursor.continue();
            }
        }).catch(reason => reject(reason));
    });
};

const deleteObject = (storeName, id) => {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            openObjectStore(db, storeName, "readwrite")
                .delete(id)
                .onsuccess = resolve;
        }).catch(reason => reject(reason));
    });
};

var getReservations = function(indexName, indexValue) {
    return new Promise(function(resolve) {
        openDatabase().then(function(db) {
            var objectStore = openObjectStore(db, "reservations");
            var reservations = [];
            var cursor;
            if (indexName && indexValue) {
                cursor = objectStore.index(indexName).openCursor(indexValue);
            } else {
                cursor = objectStore.openCursor();
            }
            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    reservations.push(cursor.value);
                    cursor.continue();
                }
            };
        })
    });
};

const getVideos = (indexName, indexValue) => {
    return new Promise(resolve => {
        openDB().then(db => {
            const store = openObjectStore(db, "videos", "readwrite");
            const videos = [];

            const openCursor = indexName && indexValue ?
                store.index(indexName).openCursor(indexValue) :
                store.openCursor();

            openCursor.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    videos.push(cursor.value);
                    cursor.continue();
                } else {
                    if (videos.length > 0) {
                        resolve(videos);
                    } else {
                        getVideosFromServer().then((videos) => {
                            for (const video of videos) {
                                addObject("videos", video);
                            }
                            resolve(videos);
                        });
                    }
                }
            }
        }).catch(function (e) {
            console.error(e);
            getVideosFromServer().then((videos) => {
                resolve(videos);
            });
        });
    });
};

const getVideosFromServer = () => {
    return new Promise((resolve) => {
            if (self.$) {
                $.getJSON("http://localhost:3000/videos", resolve)
            } else if (self.fetch) {
                fetch("http://localhost:3000/videos").then((response) => {
                    return response.json();
                }).then(function (videos) {
                    resolve(videos);
                });
            }
        }
    );
};