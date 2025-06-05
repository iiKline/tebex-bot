const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

function checkNote(discordID) {
  let rawdata = fs.readFileSync("src/storage/note.json");
  let data = JSON.parse(rawdata);
  return data.find(n => n.DiscordID === discordID) || false;
}

function deleteOldNoteData(noteData) {
  let rawdata = fs.readFileSync("src/storage/note.json");
  let data = JSON.parse(rawdata);
  let filtered = data.filter(n => n.DiscordID !== noteData.DiscordID);
  fs.writeFileSync("src/storage/note.json", JSON.stringify(filtered));
}

function writeNewNoteData(noteData) {
  let rawdata = fs.readFileSync("src/storage/note.json");
  let data = JSON.parse(rawdata);
  data.push(noteData);
  fs.writeFileSync("src/storage/note.json", JSON.stringify(data));
}

exports.run = async (bot, interaction, color, prefix, config) => {
  if (!config.tebex.lookupperms.includes(interaction.user.id)) return;

  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "add") {
    /* const did = interaction.options.getString("did"); */
    const note = interaction.options.getString("note");
    const user = interaction.options.getUser('user')
    const did = user?.id

    const noteData = {
      DiscordID: did,
      Notes: note,
    };

    const hasNote = checkNote(did);
    let embed = new EmbedBuilder();

    if (!hasNote) {
      embed
        .setColor(color.success)
        .setDescription(`<@${did}>`)
        .addFields({ name: `\u200b`, value: `Note has been successfully added to the user.`, inline: true });
      writeNewNoteData(noteData);
    } else {
      embed
        .setColor(color.info)
        .setDescription(`<@${did}>`)
        .addFields({ name: `\u200b`, value: `User's note has been successfully updated.`, inline: true });
      deleteOldNoteData(noteData);
      writeNewNoteData(noteData);
    }
    return await interaction.editReply({ embeds: [embed] });
  }

  if (subcommand === "view") {
    /* const did = interaction.options.getString("did"); */
    const user = interaction.options.getUser('user')
    const did = user?.id
    const hasNote = checkNote(did);

    let embed = new EmbedBuilder();
    if (hasNote) {
      embed
        .setColor(color.success)
        .setDescription(`<@${did}>`)
        .addFields({ name: "Note:", value: hasNote.Notes, inline: true });
    } else {
      embed
        .setColor(color.error)
        .setDescription(`No note found for user <@${did}>.`);
    }
    return await interaction.editReply({ embeds: [embed] });
  }
};

exports.conf = {
  name: "note",
  description: "Add a note to a User ID",
  cooldown: 5,
  slash: true,
  examples: ["note 1234567890 This is a note"],
};
