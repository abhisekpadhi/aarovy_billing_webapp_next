import axios from "axios";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const INDEX_GIST_ID = "5a7543fd6830b86db42c372813d2f86f";

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
  // console.log("response of get gist", response.data);

  const rawUrl = response.data.files[fileName].raw_url;

  const fileContent = await axios.get(rawUrl);

  return fileContent.data;
};

const updateGistContent = async (
  gistId: string,
  content: string,
  fileName: string
) => {
  console.log("Updating gist:", gistId, fileName);
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
    console.log("Gist updated successfully:", response.data);
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

    const rawUrl = response.data.files["aarovy_bills_gists.json"].raw_url;

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
  const fileName = "aarovy_bills_gists.json";
  await updateGistContent(INDEX_GIST_ID, index, fileName);
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

export const GistUtils = {
  getOrCreateMonthlyBillsGist,
  getGistContent,
  updateGistContent,
  getIndex,
  updateIndex,
};
