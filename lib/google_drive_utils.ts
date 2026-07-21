import { google } from "googleapis";
import { Readable } from "stream";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8 MB
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

const getEnv = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "";
  const rootFolderId = process.env.GOOGLE_DRIVE_NOTES_FOLDER_ID || "";

  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
    throw new Error(
      "Missing Google Drive OAuth env vars (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_DRIVE_NOTES_FOLDER_ID)"
    );
  }

  return { clientId, clientSecret, refreshToken, rootFolderId };
};

const getDriveClient = () => {
  const { clientId, clientSecret, refreshToken } = getEnv();
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: oauth2 });
};

const flatFolderName = (flat: string) => `Flat ${flat}`;

const ensureFlatFolder = async (flat: string) => {
  const drive = getDriveClient();
  const { rootFolderId } = getEnv();
  const name = flatFolderName(flat);

  const existing = await drive.files.list({
    q: [
      `name='${name.replace(/'/g, "\\'")}'`,
      `'${rootFolderId}' in parents`,
      `mimeType='application/vnd.google-apps.folder'`,
      `trashed=false`,
    ].join(" and "),
    fields: "files(id, name)",
    spaces: "drive",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const folderId = existing.data.files?.[0]?.id;
  if (folderId) return folderId;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  if (!created.data.id) {
    throw new Error(`Failed to create Drive folder for flat ${flat}`);
  }

  return created.data.id;
};

const uploadNoteAttachment = async (params: {
  flat: string;
  noteId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) => {
  if (params.buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error("File too large (max 8 MB)");
  }

  const drive = getDriveClient();
  const folderId = await ensureFlatFolder(params.flat);
  const safeName = params.fileName.replace(/[\\/]/g, "_");
  const driveName = `${params.noteId}_${safeName}`;

  const uploaded = await drive.files.create({
    requestBody: {
      name: driveName,
      parents: [folderId],
    },
    media: {
      mimeType: params.mimeType || "application/octet-stream",
      body: Readable.from(params.buffer),
    },
    fields: "id, name, mimeType",
    supportsAllDrives: true,
  });

  if (!uploaded.data.id) {
    throw new Error("Failed to upload attachment to Google Drive");
  }

  return {
    id: uploaded.data.id,
    name: params.fileName,
    mimeType:
      uploaded.data.mimeType || params.mimeType || "application/octet-stream",
  };
};

const assertFileUnderNotesRoot = async (fileId: string) => {
  const drive = getDriveClient();
  const { rootFolderId } = getEnv();

  const file = await drive.files.get({
    fileId,
    fields: "id, parents, trashed",
    supportsAllDrives: true,
  });

  if (file.data.trashed) {
    throw new Error("File not found");
  }

  const parentId = file.data.parents?.[0];
  if (!parentId) {
    throw new Error("Unauthorized attachment");
  }

  // File may live directly in root, or in Flat X under root
  if (parentId === rootFolderId) return;

  const parent = await drive.files.get({
    fileId: parentId,
    fields: "id, parents, mimeType",
    supportsAllDrives: true,
  });

  if (
    parent.data.mimeType !== "application/vnd.google-apps.folder" ||
    !parent.data.parents?.includes(rootFolderId)
  ) {
    throw new Error("Unauthorized attachment");
  }
};

const downloadAttachment = async (fileId: string) => {
  await assertFileUnderNotesRoot(fileId);
  const drive = getDriveClient();

  const meta = await drive.files.get({
    fileId,
    fields: "id, name, mimeType",
    supportsAllDrives: true,
  });

  const media = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "arraybuffer" }
  );

  return {
    buffer: Buffer.from(media.data as ArrayBuffer),
    mimeType: meta.data.mimeType || "application/octet-stream",
    name: meta.data.name || "attachment",
  };
};

const deleteAttachment = async (fileId: string) => {
  try {
    await assertFileUnderNotesRoot(fileId);
    const drive = getDriveClient();
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error("Error deleting Drive attachment:", error);
  }
};

export const DriveUtils = {
  MAX_ATTACHMENT_BYTES,
  DRIVE_SCOPE,
  uploadNoteAttachment,
  downloadAttachment,
  deleteAttachment,
};
