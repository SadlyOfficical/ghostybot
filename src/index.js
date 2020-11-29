require("./utils/checkValid")();
require("./utils/database");
const NekoClient = require("nekos.life");
const TnaiClient = require("tnai");
const imdb = require("imdb-api");
const AlexClient = require("alexflipnote.js");
const { Collection, Client } = require("discord.js");
const { token, imdbKey, alexflipnoteKey } = require("../config.json");
const MongoGiveawayManager = require("./modules/GiveawayManager");
const { Player } = require("discord-player");
const { findMember, getGuildLang, sendErrorLog } = require("./utils/functions");

const bot = new Client({
  disableMentions: "everyone",
  partials: ["GUILD_MEMBER", "MESSAGE", "USER"],
});

// Locale - Language
bot.getGuildLang = getGuildLang;

// Commands
bot.commands = new Collection();
bot.aliases = new Collection();
bot.cooldowns = new Collection();
bot.player = new Player(bot);
bot.afk = new Map();
bot.neko = new NekoClient();
bot.tnai = new TnaiClient();
bot.imdb = new imdb.Client({ apiKey: imdbKey });
bot.findMember = findMember;
if (alexflipnoteKey) {
  bot.alexClient = new AlexClient(alexflipnoteKey);
}

global.Promise = require("bluebird");
Promise.config({
  longStackTraces: true,
});

const giveawayManager = new MongoGiveawayManager(bot, {
  storage: false,
  updateCountdownEvery: 10000,
  DJSlib: "v12",
  default: {
    embedColor: "#7289DA",
    botsCanWin: false,
    reaction: "🎉",
    embedColorEnd: "#7289DA",
    messages: {
      hostedBy: "Hosted by {user}",
      giveaway: "**🎉🎉 New Giveaway 🎉🎉**",
    },
  },
});

bot.giveawayManager = giveawayManager;

require("moment-duration-format");
require("./modules/command")(bot);
require("./modules/events")(bot);

bot.login(token);

// Unhandled errors
process.on("unhandledRejection", (error) => sendErrorLog(bot, error, "error"));

process.on("uncaughtExceptionMonitor", (error) =>
  sendErrorLog(bot, error, "error")
);

process.on("warning", (warning) => sendErrorLog(bot, warning, "warning"));
