const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client
    }
    async dispatch(guild) {
        if (!guild || !guild.id || !guild.ownerId) return

        // Delete invites from cache
        await this.client.invites.delete(guild.id);

        // Send log message to support server
        const supportGuild = this.client.guilds.cache.get(this.client.config.support["ID"]);
        if(!supportGuild) return;

        const logChannel = supportGuild.channels.cache.get(this.client.config.support["BOT_LOG"]);
        if(!logChannel) return;

        const owner = await this.client.users.fetch(guild.ownerId).catch((e) => {
            this.client.alertException(e, guild.name, null, "<Client>.users.fetch(\"" + guild.ownerId + "\"");
        });
        const id = guild.id;
        const name = guild.name;
        const membercount = guild.memberCount;
        const created = moment(guild.createdTimestamp).format('DD.MM.YYYY, HH:mm');
        const createdDiff = this.client.utils.getRelativeTime(guild.createdTimestamp);

        const text =
            "Name: **" + name + "**\n" +
            this.client.emotes.crown + " Eigentümer: **" + owner?.tag + "**\n" +
            this.client.emotes.id + " ID: **" + id + "**\n" +
            this.client.emotes.users + " Mitglieder: **" + membercount + "**\n\n" +
            this.client.emotes.calendar + " Erstellt am: **" + created + "**\n" +
            this.client.emotes.reminder + " Erstellt vor: **" + createdDiff + "**";

        const supportServerEmbed = this.client.createEmbed(text, "discord", "error");
        supportServerEmbed.setTitle(this.client.emotes.shine + " " + this.client.user.username + " wurde von einem Server entfernt");
        supportServerEmbed.setThumbnail(guild.iconURL({ dynamic: true }));

        return logChannel.send({ embeds: [supportServerEmbed] }).catch(() => {});
    }
};
