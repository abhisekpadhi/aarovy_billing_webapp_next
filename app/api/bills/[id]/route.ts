import { GistUtils } from "@/lib/github_gist_utils";
import { BillType } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// Get a bill - /api/bills/<year>_<month>_<flat>
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get bill ID from URL path
    const id = (await params).id;
    console.debug("Bill id", id);
    if (!id) {
      return NextResponse.json(
        { message: "Bill ID is required", success: false, data: null },
        { status: 400 }
      );
    }

    const [year, month, flat] = id.split("_");
    if (!year || !month || !flat) {
      return NextResponse.json(
        { message: "Invalid bill ID format", success: false, data: null },
        { status: 400 }
      );
    }

    // Get bills for the month/year
    const { content } = await GistUtils.getOrCreateMonthlyBillsGist(
      parseInt(year),
      parseInt(month)
    );

    // Find the specific bill
    const bill = content.find(
      (b: BillType) => b.flat === flat && b.year === year && b.month === month
    );

    if (!bill) {
      return NextResponse.json(
        { message: "Bill not found", success: false, data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Bill fetched successfully", data: bill },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch bill. Error: " + error,
        success: false,
        data: null,
      },
      { status: 500 }
    );
  }
}
