const UnbanStore = require('./UnbanStore');

class CommandHandler {
    start(client) {
        this._client = client;

        client.on('event', (event) => {
            if (event.getType() !== 'm.room.message') return;
            if (event.getSender() === client.credentials.userId) return;
            if (event.getContent().msgtype !== 'm.text') return;
            if (!event.getContent().body.startsWith("!unban")) return;

            this._processCommand(event);
        });
    }

    _processCommand(event) {
        var parts = event.getContent().body.substring("!unban ".length).split(" ");

        if (parts[0] !== "add" && parts[0] !== "remove" && parts[0] !== "list") {
            this._client.sendNotice(event.getRoomId(), "Usage: !unban <add | remove | list> [user id]");
            return;
        }

        if (parts[0] === "list") {
            var users = UnbanStore.getUsersToUnban(event.getRoomId());
            if (users.length > 0) {
                var list = "";
                users.forEach(u => list = list + "* " + u + "\n");
                this._client.sendNotice(event.getRoomId(), "The following people are on the unban list:\n" + list);
            } else {
                this._client.sendNotice(event.getRoomId(), "There are no users on the unban list");
            }

            return;
        }

        if (parts.length < 2) {
            this._client.sendNotice(event.getRoomId(), "Usage: !unban <add | remove> <user id>");
            return;
        }

        if (!this._hasPermission(event.getSender(), event.getRoomId())) {
            this._client.sendNotice(event.getRoomId(), "You do not have permission to use that command here.");
        } else {
            if (parts[0] === "add") {
                UnbanStore.addUserToUnban(event.getRoomId(), parts[1]);
                this._client.sendNotice(event.getRoomId(), "Added " + parts[1] + " to the unban list");
            } else {
                UnbanStore.removeUserFromUnban(event.getRoomId(), parts[1]);
                this._client.sendNotice(event.getRoomId(), "Removed " + parts[1] + " from the unban list");
            }
        }
    }

    _hasPermission(sender, roomId) {
        var room = this._client.getRoom(roomId);
        var powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
        if (!powerLevels) return false;
        powerLevels = powerLevels.getContent();

        var userPowerLevels = powerLevels['users'] || {};
        var eventPowerLevels = powerLevels['events'] || {};

        var powerLevel = userPowerLevels[sender];
        if (!powerLevel) powerLevel = powerLevels['users_default'];
        if (!powerLevel) powerLevel = 0; // default

        var modPowerLevel = eventPowerLevels["io.t2l.unbanbot"];
        if (!modPowerLevel) modPowerLevel = powerLevels["state_default"];
        if (!modPowerLevel) return false;

        return modPowerLevel <= powerLevel;
    }
}

module.exports = new CommandHandler();
