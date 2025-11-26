import { downloadImages } from "./download.js";
import { mergeImages } from "./merge.js";
import { uploadFolderToDrive } from "./drive.js";





export async function processChapter(imageUrls) {

    const folderPath = await downloadImages(imageUrls);


    await mergeImages(folderPath);


    const driveLink = await uploadFolderToDrive(folderPath);

    return driveLink;
}
