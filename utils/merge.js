import sharp from "sharp";
import fs from "fs";
import path from "path";





export async function mergeImages(folderPath, maxHeight = 15000) {
    const files = fs.readdirSync(folderPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort(); 

    const mergedFiles = [];
    let currentBuffers = [];
    let currentHeight = 0;
    let width = 0;
    let fileIndex = 1;

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const img = sharp(filePath);
        const meta = await img.metadata();
        const buffer = await img.toBuffer();


        if (currentHeight + meta.height > maxHeight) {

            const mergedFileName = path.join(folderPath, `merged${String(fileIndex).padStart(3,"0")}.jpg`);
            await createMergedImage(currentBuffers, width, currentHeight, mergedFileName);
            mergedFiles.push(mergedFileName);


            currentBuffers = [];
            currentHeight = 0;
            fileIndex++;
        }

        currentBuffers.push({ buffer, height: meta.height });
        currentHeight += meta.height;
        if (meta.width > width) width = meta.width;
    }


    if (currentBuffers.length > 0) {
        const mergedFileName = path.join(folderPath, `merged${String(fileIndex).padStart(3,"0")}.jpg`);
        await createMergedImage(currentBuffers, width, currentHeight, mergedFileName);
        mergedFiles.push(mergedFileName);
    }


    files.forEach(f => fs.unlinkSync(path.join(folderPath, f)));

    return mergedFiles;
}


async function createMergedImage(buffers, width, height, outputFile) {
    const merged = sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    });

    let top = 0;
    const composites = buffers.map(b => {
        const comp = { input: b.buffer, top, left: 0 };
        top += b.height;
        return comp;
    });

    await merged.composite(composites).jpeg({ quality: 90 }).toFile(outputFile);
}
