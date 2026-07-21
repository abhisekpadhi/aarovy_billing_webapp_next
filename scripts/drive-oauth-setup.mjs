#!/usr/bin/env node
/**
 * One-time OAuth setup for Google Drive uploads (personal Gmail).
 *
 * Service accounts have no Drive storage quota on My Drive, so uploads must
 * run as a real user via OAuth refresh token.
 *
 * Prerequisites:
 * 1. GCP Console → APIs & Services → Credentials → Create OAuth client ID
 *    Application type: Desktop app
 * 2. OAuth consent screen: External (or Internal if Workspace), add your Gmail
 *    as a test user if the app is in Testing
 * 3. Enable Google Drive API
 *
 * Usage:
 *   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... npm run drive:auth
 *
 * Then paste the printed refresh token into .env.local as GOOGLE_OAUTH_REFRESH_TOKEN
 */

import { google } from "googleapis";
import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const REDIRECT_URI = "http://127.0.0.1:53682/oauth2callback";
const SCOPE = "https://www.googleapis.com/auth/drive";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET, then re-run."
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [SCOPE],
});

console.log("\n1. Open this URL in your browser and sign in with the Google");
console.log("   account that OWNS the notes Drive folder:\n");
console.log(authUrl);
console.log("\n2. Waiting for redirect on", REDIRECT_URI, "...\n");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", REDIRECT_URI);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h1>Success</h1><p>You can close this tab and return to the terminal.</p>"
    );

    console.log("Add these to .env.local (and Vercel):\n");
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
    if (tokens.refresh_token) {
      console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log(
        "WARNING: No refresh_token returned. Revoke app access at"
      );
      console.log(
        "https://myaccount.google.com/permissions and run again with prompt=consent."
      );
    }
    console.log(
      "\nKeep GOOGLE_DRIVE_NOTES_FOLDER_ID. You can remove the service account env vars."
    );

    server.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Auth failed — check the terminal.");
    server.close();
    process.exit(1);
  }
});

server.listen(53682, "127.0.0.1");
