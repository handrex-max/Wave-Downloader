import { SlashCommandBuilder } from "discord.js";
import { SUPPORTED_SITES } from "../config.js";
import { extractImagesBySite } from "../sites/index.js";
import { processChapter } from "../utils/processChapter.js";



export default {
    data: new SlashCommandBuilder()
        .setName("download")
        .setDescription("تحميل الفصول من المواقع المتوفرة")
        .addStringOption((opt) => {
            opt.setName("website")
                .setDescription("Choose supported site")
                .setRequired(true);

            Object.values(SUPPORTED_SITES).forEach(site => {
                opt.addChoices({ name: site.name, value: site.key });
            });

            return opt;
        })
        .addStringOption(input => 
            input
                .setName("chapter_link")
                .setDescription("رابط الفصل")
                .setRequired(true)
        )
        .addStringOption(input => 
            input
                .setName("chapter_name")
                .setDescription("اسم للفصل")
                .setRequired(true)
        ),



    async execute(interaction) {
        const siteKey = interaction.options.getString("website");
        const chapterLink = interaction.options.getString("chapter_link");
        const chapterName = interaction.options.getString("chapter_name");


        await interaction.reply(`**Fetching img URLs => ${siteKey}**`);

        try {

            const imageUrls = await extractImagesBySite(siteKey, chapterLink);

            if (!imageUrls || imageUrls.length === 0)
                return interaction.editReply("Image Not found !");

            await interaction.editReply(`Found ${imageUrls.length} IMGs \n the process may take more than 5 minutes if some unexpected issues occur, but the chapter will reach you.`);


            const driveLink = await processChapter(imageUrls, chapterName);

            await interaction.editReply(`Chapter \`${chapterName}\` Link : \n ${driveLink}`);

        } catch (err) {
            console.error(err);
            await interaction.editReply(`Error\n\`${err.message}\``);
        }
    }

}