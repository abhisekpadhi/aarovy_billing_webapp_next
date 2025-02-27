import { GistUtils } from "@/lib/github_gist_utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fileName = `aarovy_bills_${body.year}_${body.month}.json`;

  // Get the gist for the given year and month
  const { gistId, content } = await GistUtils.getOrCreateMonthlyBillsGist(
    body.year,
    body.month
  );

  // handle the case where the gist is empty
  if (content.length === 0) {
    content.push(body);
    // todo update the gist

    GistUtils.updateGistContent(
      gistId,
      JSON.stringify(content, null, 2),
      fileName
    );

    return NextResponse.json({
      message: "Bill updated",
      success: true,
    });
  }

  // handle the case where the bill might be already in the gist

  const billIndex = content.findIndex(
    (bill: { flat: string; year: string; month: string }) =>
      bill.flat === body.flat &&
      bill.year === body.year &&
      bill.month === body.month
  );

  if (billIndex === -1) {
    content.push(body);
  } else {
    content[billIndex] = { ...content[billIndex], ...body };
  }

  // update the gist
  GistUtils.updateGistContent(
    gistId,
    JSON.stringify(content, null, 2),
    fileName
  );

  return NextResponse.json({
    success: true,
  });
}
