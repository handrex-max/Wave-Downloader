import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SUPPORTED_SITES } from "../config.js";

export default {
    data: new SlashCommandBuilder()
        .setName("list_sites")
        .setDescription("عرض جميع المواقع المدعومة للسحب"),

    async execute(interaction) {
        try {
            const sites = Object.values(SUPPORTED_SITES);
            const totalSites = sites.length;

            const embed = new EmbedBuilder()
                .setTitle("المواقع المدعومة لتحميل")
                .setColor("#5865F2")
                .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
                .setTimestamp()
                .setFooter({
                    text: `عدد المواقع المدعومة: ${totalSites}`,
                    iconURL: interaction.client.user.displayAvatarURL({ size: 128 })
                });

            let currentField = "";
            let fieldCount = 0;

            sites.forEach(site => {
                const line = `**${site.name}** => \`${site.domain}\`\n`;

                if ((currentField + line).length > 1000) {
                    embed.addFields({
                        name: `مجموعة المواقع : ${++fieldCount}`,
                        value: currentField.trim(),
                        inline: false
                    });
                    currentField = line;
                } else {
                    currentField += line;
                }
            });

            if (currentField) {
                embed.addFields({
                    name: `مجموعة المواقع : ${++fieldCount}`,
                    value: currentField.trim(),
                    inline: false
                });
            }

            await interaction.reply({
                embeds: [embed],
                flags: "Ephemeral"
            });

        } catch (err) {
            console.error("خطأ في أمر list_sites:", err);

            const errorEmbed = new EmbedBuilder()
                .setTitle("حدث خطأ!")
                .setDescription(`\`\`\`${err.message}\`\`\``)
                .setColor("#FF0000");

            await interaction.reply({
                embeds: [errorEmbed],
                flags: "Ephemeral"
            }).catch(() => {});
        }
    }
};