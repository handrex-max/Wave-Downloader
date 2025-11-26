import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("يعرض قائمة بجميع أوامر البوت مع شرح كل أمر"),

    async execute(interaction) {
        try {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x1abc9c) 
                .setTitle("Wave Downloader Bot Commands")
                .setDescription("الأوامر المتاحة")
                .addFields(
                    {
                        name: "/download",
                        value: "هو امر لتحميل الفصول. ملحوظة الفصل ممكن يتأخر لأكثر من 10 دقائق ما عليك سوي الانتظار"
                    },
                    {
                        name: "/list",
                        value: "يعرض جميع المواقع المدعومة للسحب مع الدومين الخاص بكل موقع.",
                    },
                    {
                        name: "/help",
                        value: "يعرض هذه الرسالة لشرح أوامر البوت.",
                    }
                )
                .setFooter({ text: "Wave Downloader Bot" })
                .setTimestamp();

            await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: `error \n\`${err.message}\``,
                ephemeral: true
            });
        }
    }
};
