import { GistUtils } from "@/lib/github_gist_utils";
import { NextResponse } from "next/server";

export async function GET() {
  const flatDetails = await GistUtils.getFlatDetails();
  return NextResponse.json({
    success: true,
    message: "Flat details fetched successfully",
    data: flatDetails,
  });
}
