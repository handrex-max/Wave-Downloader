import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { oAuth2Client } from "./auth/auth.js";

const drive = google.drive({ version: "v3", auth: oAuth2Client });

export async function uploadFolderToDrive(folderPath, parentFolderId= process.env.PARENT_ID) {
  const folderName = path.basename(folderPath);


  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });
  const folderId = folder.data.id;


  const files = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    await drive.files.create({
      requestBody: { name: file, parents: [folderId] },
      media: { mimeType: "image/jpeg", body: fs.createReadStream(filePath) },
      fields: "id",
    });
  }


  await drive.permissions.create({
    fileId: folderId,
    requestBody: { role: "reader", type: "anyone" },
  });


  fs.rmSync(folderPath, { recursive: true, force: true });

  return `https://drive.google.com/drive/folders/${folderId}`;
}
