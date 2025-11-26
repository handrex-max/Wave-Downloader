import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto"



export async function downloadImages(imageUrls, chName) {
    const folderName = `${chName}_${randomKey()}`;
    const folderPath = path.join("temp", folderName);

    if (!fs.existsSync("temp")) fs.mkdirSync("temp");
    fs.mkdirSync(folderPath);

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const extMatch = url.match(/\.(jpg|jpeg|png|webp)$/i);
        const ext = extMatch ? extMatch[0] : ".jpg";
        const fileName = String(i + 1).padStart(3, "0") + ext;
        const filePath = path.join(folderPath, fileName);

        const response = await axios({
            url,
            method: "GET",
            responseType: "arraybuffer"
        });

        fs.writeFileSync(filePath, response.data);
    }

    return folderPath;
}




function randomKey(length = 6){
    return crypto.randomBytes(3).toString("hex").substring(0, length)
}