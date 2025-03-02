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

export async function POST(req: Request) {
  const flatDetails = await req.json();
  await GistUtils.updateFlatDetails(JSON.stringify(flatDetails, null, 2));
  return NextResponse.json({
    success: true,
    message: "Flat details updated successfully",
    data: flatDetails,
  });
}
