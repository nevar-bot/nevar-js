module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(guild, vanityURL) {
        const logText =
            " **Server geupdated**\n\n" +
            this.client.emotes.arrow + "Aktion: Vanity-URL " + vanityURL + " hinzugefügt";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success", guild.iconURL());
    }
}