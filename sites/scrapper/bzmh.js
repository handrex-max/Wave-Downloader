import puppeteer from "puppeteer";

export async function getBzmhImg(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 60000
        });

        await page.waitForSelector("#chapcontent img");

        const images = await page.evaluate(() => {
            const list = [];
            document.querySelectorAll("#chapcontent img").forEach(img => {
                const src = img.getAttribute("data-src") || img.getAttribute("src");
                if (src) list.push(src);
            });
            return list;
        });


        return [...new Set(images)];

    } catch (err) {
        console.error("Puppeteer error:", err);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}
