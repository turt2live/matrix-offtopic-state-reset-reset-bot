const LocalStorage = require("node-localstorage").LocalStorage;
const LogService = require("matrix-js-snippets").LogService

class UnbanStore {

    constructor() {
        LogService.info("UnbanStore", "Initializing localstorage backend");
        this._store = new LocalStorage("./db");
    }

    getUsersToUnban(roomId) {
        var item = JSON.parse(this._store.getItem(roomId) || "[]");
        return item || [];
    }

    addUserToUnban(roomId, userId) {
        var users = this.getUsersToUnban(roomId);
        if (users.indexOf(userId) === -1) {
            users.push(userId);
            this._store.setItem(roomId, JSON.stringify(users));
        }

        var rooms = this.getRooms();
        if (rooms.indexOf(roomId) === -1) {
            rooms.push(roomId);
            this._store.setItem("room_list", JSON.stringify(rooms));
        }
    }

    removeUserFromUnban(roomId, userId) {
        var users = this.getUsersToUnban(roomId);
        var idx = users.indexOf(userId);
        if (idx !== -1) {
            users.splice(idx, 1);
            this._store.setItem(roomId, JSON.stringify(users));
        }
    }

    getRooms() {
        return JSON.parse(this._store.getItem("room_list") || "[]");
    }
}

module.exports = new UnbanStore();