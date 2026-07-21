import { DriveUtils } from "@/lib/google_drive_utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const fileId = (await params).fileId;
    if (!fileId) {
      return NextResponse.json(
        { success: false, message: "File id is required" },
        { status: 400 }
      );
    }

    const { buffer, mimeType, name } =
      await DriveUtils.downloadAttachment(fileId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${name.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching attachment:", error);
    const message = String(error);
    const status = message.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch attachment. Error: " + error,
      },
      { status }
    );
  }
}
