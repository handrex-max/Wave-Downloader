// kingshoujo.js
import axios from "axios";
import { load } from "cheerio";   // ← Correct import!

export async function getKingOfShojoImg(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 30000,
        });

        // Load HTML into Cheerio
        const $ = load(response.data);   // ← Use the imported `load` function

        const images = [];

        $("#readerarea img").each((i, elem) => {
            let src = $(elem).attr("src") || 
                      $(elem).attr("data-src") || 
                      $(elem).attr("data-lazy-src") || 
                      "";

            src = src.trim();

            // Skip ibb.co ads
            if (!src || src.includes("ibb.co")) return;

            // Keep only real chapter images
            if (src.includes("kingofshojo.com/wp-content/uploads/")) {
                if (src.startsWith("//")) src = "https:" + src;
                if (src.startsWith("/")) src = "https://kingofshojo.com" + src;
                images.push(src);
            }
        });

        const uniqueImages = [...new Set(images)];
        console.log(`Success: Found ${uniqueImages.length} images from kingofshojo`);
        return uniqueImages;

    } catch (err) {
        console.error("KingOfShojo scraper error:", err.message);
        if (err.response?.status) {
            console.error("HTTP Status:", err.response.status);
        }
        return [];
    }
}