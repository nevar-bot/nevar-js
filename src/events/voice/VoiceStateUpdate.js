const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = class {

    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }

    async dispatch(oldMember, newMember){
        if(!oldMember || !newMember) return;

        const newChannel = newMember.channel;
        const oldChannel = oldMember.channel;

        if(newChannel && newMember.guild){
                const guildData = await this.client.findOrCreateGuild({id: newMember.guild.id});
                if(!guildData.settings?.joinToCreate?.enabled || !guildData.settings?.joinToCreate?.channel) return;

                const user = await this.client.users.fetch(newMember.id).catch(() => {});

                const channelName = guildData.settings.joinToCreate.defaultName
                    .replaceAll("{count}", guildData.settings.joinToCreate.channels?.length || 1)
                    .replaceAll("{user}", user.username);

                // Create new temp channel
                if(newMember.channel.id === guildData.settings.joinToCreate.channel){
                    const tempChannel = await newMember.guild.channels.create({
                        name: channelName,
                        reason: 'Join to create',
                        type: ChannelType.GuildVoice,
                        parent: guildData.settings.joinToCreate.category ? guildData.settings.joinToCreate.category : newMember.channel.parentId,
                        bitrate: parseInt(guildData.settings.joinToCreate.bitrate)*1000,
                        position: guildData.settings.joinToCreate.category ? 0 : newMember.channel.position,
                        userLimit: guildData.settings.joinToCreate.userLimit,
                        permissionOverwrites: [
                            {
                                id: newMember.member.user.id,
                                allow: [
                                    PermissionsBitField.Flags.Connect,
                                    PermissionsBitField.Flags.Speak,
                                    PermissionsBitField.Flags.ViewChannel,
                                    PermissionsBitField.Flags.ManageChannels,
                                    PermissionsBitField.Flags.Stream,
                                    PermissionsBitField.Flags.MuteMembers,
                                    PermissionsBitField.Flags.DeafenMembers,
                                    PermissionsBitField.Flags.MoveMembers
                                ]
                            }
                        ]
                    }).catch((e) => {
                        const logText =
                            " **Fehler beim Erstellen von Sprachchannel**\n\n" +
                            this.client.emotes.arrow + "Ich wollte einen temporären Sprachchannel erstellen, konnte dies aber nicht.";
                        return newMember.guild.logAction(logText, "moderation", this.client.emotes.error, "normal", newMember.guild.iconURL());
                    });

                    if(tempChannel){
                        await newMember.member.voice.setChannel(tempChannel)
                            .catch(() => { tempChannel.delete().catch(() => {}) })
                            .then(async () => {
                                guildData.settings.joinToCreate.channels.push(tempChannel.id);
                                guildData.markModified("settings.joinToCreate");
                                await guildData.save();
                            });
                    }
                }

        }
        if(oldChannel){
            if(newMember.guild){
                const guildData = await this.client.findOrCreateGuild({id: newMember.guild.id});
                if(guildData.settings?.joinToCreate?.channels?.includes(oldChannel.id)){
                    if(oldChannel.members.size >= 1) return;
                    await oldChannel.delete().catch((e) => {
                        const logText =
                            " **Fehler beim Löschen von Sprachchannel**\n\n" +
                            this.client.emotes.arrow + "Ich wollte einen temporären Sprachchannel löschennode ." +
                            ", konnte dies aber nicht.";
                        return newMember.guild.logAction(logText, "moderation", this.client.emotes.error, "normal", newMember.guild.iconURL());
                    });
                    guildData.settings.joinToCreate.channels = guildData.settings.joinToCreate.channels.filter(c => c !== oldChannel.id);
                    guildData.markModified("settings.joinToCreate");
                    await guildData.save();
                }
            }
        }
    }
}
