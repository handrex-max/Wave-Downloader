import puppeteer from "puppeteer";

export async function getTWMangaImg(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();



        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 60000
        });


        await page.waitForSelector("amp-img.comic-contain__item", { timeout: 30000 });


        await page.evaluate(() => {
            return new Promise((resolve) => {
                let loaded = 0;
                const images = document.querySelectorAll("amp-img.comic-contain__item");
                const total = images.length;

                if (total === 0) return resolve();

                images.forEach(img => {
                    if (img.complete || img.getAttribute("src")?.includes("baozicdn.com")) {
                        loaded++;
                    } else {
                        img.addEventListener("load", () => {
                            loaded++;
                            if (loaded >= total) resolve();
                        });
                        img.addEventListener("error", () => {
                            loaded++;
                            if (loaded >= total) resolve();
                        });
                    }
                });


                setTimeout(resolve, 15000);
            });
        });


        const images = await page.evaluate(() => {
            const list = [];
            document.querySelectorAll("amp-img.comic-contain__item").forEach(ampImg => {
                let src = ampImg.getAttribute("data-src") || 
                          ampImg.getAttribute("src") || 
                          ampImg.querySelector("img")?.getAttribute("src");

                if (src && src.includes("baozicdn.com")) {
                    src = src.split("?")[0];
                    if (!list.includes(src)) {
                        list.push(src);
                    }
                }
            });
            return list;
        });

        console.log(`تم جلب ${images.length} صورة من Baozi`);
        return images;

    } catch (err) {
        console.error("خطأ في جلب صور Baozi:", err.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}