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

        if (!this._hasPermission(event.getSender(), event.getRoomId())) {
            this._client.sendNotice(event.getRoomId(), "You do not have permission to use that command here.");
        } else {
            UnbanStore.addUserToUnban(event.getRoomId(), parts[0]);
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
