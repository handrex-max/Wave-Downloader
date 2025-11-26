import { google } from "googleapis";
import fs from "fs";
import readline from "readline";
import open from "open";
import "dotenv/config";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = "token.json";


const oAuth2Client = new google.auth.OAuth2(
  process.env.GG_CLIENT_ID,
  process.env.GG_CLIENT_SECRET,
  process.env.REDIRECT_URI
);



function getAuthUrl() {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline", 
    scope: SCOPES,
  });
  console.log("Open this URL in your browser to authorize the app:");
  console.log(url);
  open(url); 
}



function getAccessToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from the browser: ", async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log("Token stored to", TOKEN_PATH);
      process.exit(0);
    } catch (err) {
      console.error("Error retrieving access token", err);
    }
  });
}


if (!fs.existsSync(TOKEN_PATH)) {
  getAuthUrl();
  getAccessToken();
} else {
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
}

export { oAuth2Client };
