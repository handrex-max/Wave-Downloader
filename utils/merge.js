import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function mergeImages(folderPath, maxHeight = 10000) {

    sharp.cache(false);
    sharp.concurrency(2);

    const files = fs.readdirSync(folderPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort();

    const processed = [];

    
    for (const file of files) {
        const filePath = path.join(folderPath, file);

        let img = sharp(filePath, { limitInputPixels: false })
            .trim() 
            .jpeg(); 

        const buf = await img.toBuffer();
        const meta = await sharp(buf).metadata();

        processed.push({ buffer: buf, width: meta.width, height: meta.height });
    }

    
    const finalWidth = Math.max(...processed.map(i => i.width));

    
    const resized = [];
    for (const item of processed) {
        const b = await sharp(item.buffer)
            .resize({ width: finalWidth })
            .jpeg({ quality: 90 })
            .toBuffer();

        const meta = await sharp(b).metadata();

        resized.push({ buffer: b, height: meta.height });
    }

    
    const mergedFiles = [];
    let current = [];
    let currentHeight = 0;
    let index = 1;

    for (const img of resized) {
        if (currentHeight + img.height > maxHeight) {
            const out = path.join(folderPath, `merged${String(index).padStart(3, "0")}.jpg`);
            await saveMerged(current, finalWidth, currentHeight, out);
            mergedFiles.push(out);

            current = [];
            currentHeight = 0;
            index++;
        }

        current.push(img);
        currentHeight += img.height;
    }

    if (current.length > 0) {
        const out = path.join(folderPath, `merged${String(index).padStart(3, "0")}.jpg`);
        await saveMerged(current, finalWidth, currentHeight, out);
        mergedFiles.push(out);
    }

    
    files.forEach(f => fs.unlinkSync(path.join(folderPath, f)));

    return mergedFiles;
}

async function saveMerged(buffers, width, height, out) {
    const base = sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    });

    let top = 0;

    const composites = buffers.map(b => {
        const c = { input: b.buffer, top, left: 0 };
        top += b.height;
        return c;
    });

    await base
        .composite(composites)
        .jpeg({ quality: 90 })
        .toFile(out);
}
