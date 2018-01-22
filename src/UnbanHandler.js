const LogService = require("matrix-js-snippets").LogService;
const UnbanStore = require("./UnbanStore");

class UnbanHandler {

    start(client) {
        this._client = client;

        setInterval(() => {
            for (var roomId of UnbanStore.getRooms()) {
                LogService.info("UnbanHandler", "Checking room: " + roomId);
                this._tryUnban(roomId);
            }
        }, 60 * 1000); // Try unbanning users every minute
    }

    _tryUnban(roomId) {
        var users = UnbanStore.getUsersToUnban(roomId);
        users.forEach(u => {
            LogService.info("UnbanHandler", "Attempting to unban " + u + " in " + roomId);
            this._client.unban(roomId, u)
                .then(() => this._client.invite(roomId, u))
                .then(() => LogService.info("UnbanHandler", u + " has been unbanned in " + roomId))
                .catch(e => LogService.error("UnbanHandler", e));
        });
    }
}

module.exports = new UnbanHandler();