import { SUPPORTED_SITES } from "../config.js";
// Websites
import { getDumanwuImg } from "./scrapper/dumanwu.js";
import { getBzmhImg } from "./scrapper/bzmh.js";
import { getAsuraImg } from "./scrapper/asura.js";





export async function extractImagesBySite(siteName, url) {
    switch (siteName) {
        case SUPPORTED_SITES.dumanwu.key:
            return await getDumanwuImg(url);
        case SUPPORTED_SITES.bzmh.key:
            return await getBzmhImg(url);
        case SUPPORTED_SITES.asura.key:
            return await getAsuraImg(url)
        default:
            throw new Error("Unknown site: " + siteName);
    }
}