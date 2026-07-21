import { FlatDetailsType, NoteType } from "@/lib/models";
import axios from "axios";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN || "";
const INDEX_GIST_ID = process.env.INDEX_GIST_ID || "";
const FLAT_DETAILS_GIST_ID = process.env.FLAT_DETAILS_GIST_ID || "";
const FLAT_DETAILS_FILE_NAME = process.env.FLAT_DETAILS_FILE_NAME || "";
const INDEX_FILE_NAME = process.env.INDEX_FILE_NAME || "";

const notesFileName = (flat: string) => `aarovy_notes_${flat}.json`;

const createNewGist = async (
  name: string,
  description: string,
  content: string
) => {
  const response = await axios.post(
    "https://api.github.com/gists",
    {
      description: description,
      public: false,
      files: {
        [name]: {
          content: content,
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  return response.data.id;
};

const getGistContent = async (gistId: string, fileName: string) => {
  const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const rawUrl = response.data.files[fileName]["raw_url"];

  const fileContent = await axios.get(rawUrl);

  return fileContent.data;
};

const updateGistContent = async (
  gistId: string,
  content: string,
  fileName: string
) => {
  console.debug("Updating gist:", gistId, fileName);
  try {
    const response = await axios.patch(
      `https://api.github.com/gists/${gistId}`,
      {
        files: {
          [fileName]: {
            content: content,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.debug("Gist updated successfully:", response.data);
  } catch (error) {
    console.error("Error updating gist:", error);
  }
};

const getIndex = async () => {
  try {
    const response = await axios.get(
      `https://api.github.com/gists/${INDEX_GIST_ID}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const rawUrl = response.data.files[INDEX_FILE_NAME].raw_url;

    const fileContent = await axios.get(rawUrl);

    return fileContent.data;
  } catch (error) {
    console.error("Error fetching gist:", error);
    throw error;
  }
};

const updateIndex = async (key: string, value: string) => {
  const index = await getIndex();
  index[key] = value;
  await updateGistContent(
    INDEX_GIST_ID,
    JSON.stringify(index, null, 2),
    INDEX_FILE_NAME
  );
};

const createMonthlyBillGist = async (year: number, month: number) => {
  try {
    const gistName = `aarovy_bills_${year}_${month}.json`;

    const gistId = await createNewGist(
      gistName,
      `AAROVY BILLS FOR ${month}/${year}`,
      "[]"
    );

    await updateIndex(year + "_" + month, gistId);

    return gistId;
  } catch (error) {
    console.error("Error creating gist:", error);
    throw error;
  }
};

const getOrCreateMonthlyBillsGist = async (year: number, month: number) => {
  const index = await getIndex();
  const gistId = index[year + "_" + month];
  const fileName = `aarovy_bills_${year}_${month}.json`;

  if (gistId) {
    return { gistId, content: await getGistContent(gistId, fileName) };
  }

  const newGistId = await createMonthlyBillGist(year, month);
  return {
    gistId: newGistId,
    content: await getGistContent(newGistId, fileName),
  };
};

const getFlatDetails = async (): Promise<FlatDetailsType> => {
  const gistId = FLAT_DETAILS_GIST_ID;
  const fileName = FLAT_DETAILS_FILE_NAME;
  const content = await getGistContent(gistId, fileName);
  return content;
};

const updateFlatDetails = async (content: string) => {
  const gistId = FLAT_DETAILS_GIST_ID;
  const fileName = FLAT_DETAILS_FILE_NAME;
  await updateGistContent(gistId, content, fileName);
};

const createNotesGistForFlat = async (flat: string) => {
  const fileName = notesFileName(flat);
  const gistId = await createNewGist(
    fileName,
    `AAROVY NOTES FOR FLAT ${flat}`,
    "[]"
  );

  const flatDetails = await getFlatDetails();
  if (!flatDetails[flat]) {
    throw new Error(`Flat ${flat} not found in flat details`);
  }

  flatDetails[flat] = {
    ...flatDetails[flat],
    notes_gist_id: gistId,
  };
  await updateFlatDetails(JSON.stringify(flatDetails, null, 2));

  return gistId;
};

const getOrCreateNotesGistForFlat = async (flat: string) => {
  const flatDetails = await getFlatDetails();
  const flatRecord = flatDetails[flat];
  if (!flatRecord) {
    throw new Error(`Flat ${flat} not found in flat details`);
  }

  const fileName = notesFileName(flat);
  const existingGistId = flatRecord.notes_gist_id;

  if (existingGistId) {
    const content = (await getGistContent(
      existingGistId,
      fileName
    )) as NoteType[];
    return {
      gistId: existingGistId,
      content: Array.isArray(content) ? content : [],
    };
  }

  const newGistId = await createNotesGistForFlat(flat);
  const content = (await getGistContent(newGistId, fileName)) as NoteType[];
  return {
    gistId: newGistId,
    content: Array.isArray(content) ? content : [],
  };
};

const updateNotesForFlat = async (
  flat: string,
  gistId: string,
  notes: NoteType[]
) => {
  await updateGistContent(
    gistId,
    JSON.stringify(notes, null, 2),
    notesFileName(flat)
  );
};

export const GistUtils = {
  updateFlatDetails,
  getFlatDetails,
  getOrCreateMonthlyBillsGist,
  getOrCreateNotesGistForFlat,
  updateNotesForFlat,
  getGistContent,
  updateGistContent,
  getIndex,
  updateIndex,
};
