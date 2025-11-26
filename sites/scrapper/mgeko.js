import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getMGekoImg(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(response.data);
        const images = [];

        $('#chapter-reader img').each((i, elem) => {
            let src = $(elem).attr('src') || '';
            if (!src) return;
            src = src.trim();

            images.push(src)
        });

        return [...new Set(images)];
    } catch (err) {
        return [];
    }
}