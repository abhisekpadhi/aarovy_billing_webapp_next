import { GistUtils } from "@/lib/github_gist_utils";
import { NextRequest, NextResponse } from "next/server";

// Get bills with filter by month and year
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json(
      { success: false, message: "Year and month are required", data: null },
      { status: 400 }
    );
  }

  const { content } = await GistUtils.getOrCreateMonthlyBillsGist(
    parseInt(year),
    parseInt(month)
  );

  return NextResponse.json({
    success: true,
    message: "Bills fetched successfully",
    data: content,
  });
}

// Create or update a bill
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
