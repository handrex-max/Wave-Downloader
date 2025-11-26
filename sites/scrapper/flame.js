import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getFlameImg(url) {
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

        $('img').each((i, elem) => {
            let src = $(elem).attr('src') || $(elem).attr('data-src') || '';
            if (!src) return;
            src = src.trim();

            if (
                src.includes('read_on_flame') ||
                src.includes('assets/read') ||
                src.includes('flamecomics.xyz/assets') ||
                src.includes('placeholder') ||
                src.includes('logo') ||
                src.includes('banner')
            ) return;

            if (src.includes('cdn.flamecomics.xyz/uploads/images/series')) {
                images.push(src.split('?')[0]);
            }
        });

        return [...new Set(images)];
    } catch (err) {
        console.log(err)
        return [];
    }
}