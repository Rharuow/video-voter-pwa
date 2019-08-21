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

            if (!db.objectStoreNames.contains("videos")) {
                db.createObjectStore("videos", {keyPath: "id"});
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

const getVideos = () => {
    return new Promise(resolve => {
        openDB().then(db => {
            const store = openObjectStore(db, "videos", "readwrite");
            const videos = [];
            store.openCursor().onsuccess = (event) => {
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