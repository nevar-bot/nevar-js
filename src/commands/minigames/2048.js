const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class TwoZeroFourEight extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "2048",
            description: "Startet eine Runde 2048 für dich",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.startGame();
    }

    async startGame(){
        const game = new gamesController.TwoZeroFourEight({
            message: this.interaction,
            isSlashGame: true,

            embed: {
                // Game specific options
                title: "2048",
                color: this.client.config.embeds["DEFAULT_COLOR"],

                // Default options
                overTitle: "Spiel beendet",
                requestTitle: "Spieleinladung",
                requestColor: this.client.config.embeds["DEFAULT_COLOR"],
                rejectTitle: "Spieleinladung abgelehnt",
                rejectColor: this.client.config.embeds["ERROR_COLOR"],
            },
            buttons: {
                accept: "Akzeptieren",
                reject: "Ablehnen"
            },
            reqTimeoutTime: 60000,
            requestMessage: "{player} hat dich zu einer Runde 2048 eingeladen. Willst du das Spiel starten?",
            rejectMessage: "Die Einladung wurde abgelehnt.",
            reqTimeoutMessage: "Die Einladung ist abgelaufen.",

            emojis: {
                up: this.client.emotes.arrows.up,
                down: this.client.emotes.arrows.down,
                left: this.client.emotes.arrows.left,
                right: this.client.emotes.arrows.right,
            },
            timeoutTime: 120000,
            playerOnlyMessage: 'Das Spiel kann nur durch {player} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = TwoZeroFourEight;