import { config } from "@/lib/config";
import { DriveUtils } from "@/lib/google_drive_utils";
import { GistUtils } from "@/lib/github_gist_utils";
import { NoteType } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

const isValidFlat = (flat: string) => config.flats.includes(flat);

const parseNoteDate = (date: string) => {
  if (date.includes("/")) {
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}`).getTime();
  }
  return new Date(date).getTime();
};

const sortNewestFirst = (notes: NoteType[]) =>
  [...notes].sort((a, b) => {
    const aTime = parseNoteDate(a.date || a.updatedAt || a.createdAt);
    const bTime = parseNoteDate(b.date || b.updatedAt || b.createdAt);
    return bTime - aTime;
  });

const formatDateEnGb = (date = new Date()) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const normalizeDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return formatDateEnGb();
  }
  return value.trim();
};

type ParsedNoteBody = {
  id?: string;
  text: string;
  date: string;
  file?: File | null;
};

const parseNoteBody = async (
  request: NextRequest
): Promise<ParsedNoteBody> => {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const idValue = formData.get("id");
    const textValue = formData.get("text");
    const dateValue = formData.get("date");
    const fileValues = formData.getAll("file").filter(
      (value): value is File => value instanceof File && value.size > 0
    );

    return {
      id: typeof idValue === "string" ? idValue : undefined,
      text: typeof textValue === "string" ? textValue.trim() : "",
      date: normalizeDate(typeof dateValue === "string" ? dateValue : ""),
      // One file per note — ignore extras if the client sends more than one
      file: fileValues[0] ?? null,
    };
  }

  const body = await request.json();
  return {
    id: typeof body.id === "string" ? body.id : undefined,
    text: typeof body.text === "string" ? body.text.trim() : "",
    date: normalizeDate(body.date),
    file: null,
  };
};

const fileToBuffer = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const isAllowedAttachment = (file: File) =>
  file.type.startsWith("image/") || file.type === "application/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ flat: string }> }
) {
  try {
    const flat = (await params).flat;
    if (!isValidFlat(flat)) {
      return NextResponse.json(
        { success: false, message: "Invalid flat", data: null },
        { status: 400 }
      );
    }

    const { content } = await GistUtils.getOrCreateNotesGistForFlat(flat);
    return NextResponse.json({
      success: true,
      message: "Notes fetched successfully",
      data: sortNewestFirst(content),
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notes. Error: " + error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ flat: string }> }
) {
  try {
    const flat = (await params).flat;
    if (!isValidFlat(flat)) {
      return NextResponse.json(
        { success: false, message: "Invalid flat", data: null },
        { status: 400 }
      );
    }

    const body = await parseNoteBody(request);
    if (!body.text) {
      return NextResponse.json(
        { success: false, message: "Note text is required", data: null },
        { status: 400 }
      );
    }

    const { gistId, content } =
      await GistUtils.getOrCreateNotesGistForFlat(flat);
    const now = new Date().toISOString();
    const noteId = crypto.randomUUID();

    const note: NoteType = {
      id: noteId,
      text: body.text,
      date: body.date,
      createdAt: now,
      updatedAt: now,
    };

    if (body.file) {
      if (!isAllowedAttachment(body.file)) {
        return NextResponse.json(
          {
            success: false,
            message: "Only photos and PDF files are allowed",
            data: null,
          },
          { status: 400 }
        );
      }

      if (body.file.size > DriveUtils.MAX_ATTACHMENT_BYTES) {
        return NextResponse.json(
          { success: false, message: "File too large (max 8 MB)", data: null },
          { status: 400 }
        );
      }

      const uploaded = await DriveUtils.uploadNoteAttachment({
        flat,
        noteId,
        fileName: body.file.name,
        mimeType: body.file.type || "application/octet-stream",
        buffer: await fileToBuffer(body.file),
      });

      note.attachmentId = uploaded.id;
      note.attachmentName = uploaded.name;
      note.attachmentMimeType = uploaded.mimeType;
    }

    const notes = [note, ...content];
    await GistUtils.updateNotesForFlat(flat, gistId, notes);

    return NextResponse.json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create note. Error: " + error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flat: string }> }
) {
  try {
    const flat = (await params).flat;
    if (!isValidFlat(flat)) {
      return NextResponse.json(
        { success: false, message: "Invalid flat", data: null },
        { status: 400 }
      );
    }

    const body = await parseNoteBody(request);
    if (!body.id || !body.text) {
      return NextResponse.json(
        {
          success: false,
          message: "Note id and text are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const { gistId, content } =
      await GistUtils.getOrCreateNotesGistForFlat(flat);
    const noteIndex = content.findIndex((note) => note.id === body.id);
    if (noteIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Note not found", data: null },
        { status: 404 }
      );
    }

    const existing = content[noteIndex];
    const updated: NoteType = {
      ...existing,
      text: body.text,
      date: body.date,
      updatedAt: new Date().toISOString(),
    };

    if (body.file) {
      if (!isAllowedAttachment(body.file)) {
        return NextResponse.json(
          {
            success: false,
            message: "Only photos and PDF files are allowed",
            data: null,
          },
          { status: 400 }
        );
      }

      if (body.file.size > DriveUtils.MAX_ATTACHMENT_BYTES) {
        return NextResponse.json(
          { success: false, message: "File too large (max 8 MB)", data: null },
          { status: 400 }
        );
      }

      const uploaded = await DriveUtils.uploadNoteAttachment({
        flat,
        noteId: existing.id,
        fileName: body.file.name,
        mimeType: body.file.type || "application/octet-stream",
        buffer: await fileToBuffer(body.file),
      });

      if (existing.attachmentId) {
        await DriveUtils.deleteAttachment(existing.attachmentId);
      }

      updated.attachmentId = uploaded.id;
      updated.attachmentName = uploaded.name;
      updated.attachmentMimeType = uploaded.mimeType;
    }

    content[noteIndex] = updated;
    await GistUtils.updateNotesForFlat(flat, gistId, content);

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note. Error: " + error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flat: string }> }
) {
  try {
    const flat = (await params).flat;
    if (!isValidFlat(flat)) {
      return NextResponse.json(
        { success: false, message: "Invalid flat", data: null },
        { status: 400 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Note id is required", data: null },
        { status: 400 }
      );
    }

    const { gistId, content } =
      await GistUtils.getOrCreateNotesGistForFlat(flat);
    const existing = content.find((note) => note.id === id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Note not found", data: null },
        { status: 404 }
      );
    }

    if (existing.attachmentId) {
      await DriveUtils.deleteAttachment(existing.attachmentId);
    }

    const notes = content.filter((note) => note.id !== id);
    await GistUtils.updateNotesForFlat(flat, gistId, notes);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete note. Error: " + error,
        data: null,
      },
      { status: 500 }
    );
  }
}
