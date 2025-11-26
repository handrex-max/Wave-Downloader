import { SlashCommandBuilder } from "discord.js";
import { SUPPORTED_SITES } from "../config.js";

export default {
    data: new SlashCommandBuilder()
        .setName("list_sites")
        .setDescription("عرض جميع المواقع المدعومة للسحب"),
    
    async execute(interaction) {
        try {
            
            const sitesList = Object.values(SUPPORTED_SITES)
                .map(site => `• **${site.name}** — ${site.domain}`)
                .join("\n");

            await interaction.reply({
                content: `**Supported Sites:**\n${sitesList}`,
                ephemeral: true 
            });

        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: `error\n\`${err.message}\``,
                ephemeral: true
            });
        }
    }
};
