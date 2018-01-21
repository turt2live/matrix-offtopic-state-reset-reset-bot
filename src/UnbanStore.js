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
        var users = this.getUsersToUnban(roomId)
        users.push(userId);
        this._store.setItem(roomId, JSON.stringify(users))
    }
}

module.exports = new UnbanStore();