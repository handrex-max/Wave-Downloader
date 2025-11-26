import { SUPPORTED_SITES } from "../config.js";
// Websites
import { getDumanwuImg } from "./scrapper/dumanwu.js";
import { getBzmhImg } from "./scrapper/bzmh.js";
import { getAsuraImg } from "./scrapper/asura.js";
import { getFlameImg } from "./scrapper/flame.js";
import { getMGekoImg } from "./scrapper/mgeko.js";





export async function extractImagesBySite(siteName, url) {
    switch (siteName) {
        case SUPPORTED_SITES.dumanwu.key:
            return await getDumanwuImg(url);
        case SUPPORTED_SITES.bzmh.key:
            return await getBzmhImg(url);
        case SUPPORTED_SITES.asura.key:
            return await getAsuraImg(url);
        case SUPPORTED_SITES.flame.key: 
            return await getFlameImg(url);
        case SUPPORTED_SITES.mgeko.key: 
            return await getMGekoImg(url)
        default:
            throw new Error("Unknown site: " + siteName);
    }
}