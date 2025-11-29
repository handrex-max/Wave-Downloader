import puppeteer from "puppeteer";

export async function getMadaraImg(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle2", 
            timeout: 60000
        });


        await page.waitForSelector("#readerarea", { timeout: 10000 });

        const images = await page.evaluate(() => {
            const list = [];

            document.querySelectorAll("#readerarea img.ts-main-image").forEach(img => {
                let src = img.getAttribute("src") || img.dataset.src 

                if (src && src.startsWith("http")) {
                    list.push(src.trim());
                }
            });
            return list;
        });


        return [...new Set(images)];

    } catch (err) {
        console.error("MadaraScans Puppeteer error:", err.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}