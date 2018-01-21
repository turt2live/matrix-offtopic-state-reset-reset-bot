const LogService = require("matrix-js-snippets").LogService;
const UnbanStore = require("./UnbanStore");

class UnbanHandler {

    start(client) {
        this._client = client;

        setInterval(() => this._tryUnban("!UcYsUzyxTGDxLBEvLz:matrix.org"), 60 * 1000); // Unban offtopic users every minute
    }

    _tryUnban(roomId) {
        var users = UnbanStore.getUsersToUnban(roomId);
        users.forEach(u => {
            this._client.unban(roomId, u)
                .then(() => this._client.invite(roomId, u))
                .then(() => LogService.info("UnbanHandler", u + " has been unbanned in " + roomId))
                .catch(e => LogService.error("UnbanHandler", e));
        });
    }
}

module.exports = new UnbanHandler();