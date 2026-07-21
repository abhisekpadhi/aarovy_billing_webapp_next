"use client";
import { DatePicker } from "@/components/custom/DatePicker";
import { ExpandingTextarea } from "@/components/custom/ExpandingTextarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteType } from "@/lib/models";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaArrowUpRightFromSquare,
  FaArrowLeft,
  FaFloppyDisk,
  FaPaperclip,
  FaPencil,
  FaTrash,
} from "react-icons/fa6";

function todayEnGb() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateEnGb(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function displayNoteDate(date: string) {
  if (!date) return "";
  if (date.includes("/")) {
    const [day, month, year] = date.split("/");
    const parsed = new Date(`${year}-${month}-${day}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  return date;
}

function isImageMime(mimeType?: string) {
  return Boolean(mimeType?.startsWith("image/"));
}

function isAllowedAttachment(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

function driveFileUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function ImageAttachmentPreview({ note }: { note: NoteType }) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);

  if (!note.attachmentId) return null;

  return (
    <a
      href={driveFileUrl(note.attachmentId)}
      target="_blank"
      rel="noreferrer"
      className="relative mb-3 flex min-h-32 w-fit min-w-48 items-center justify-center overflow-hidden rounded-lg border bg-muted/30"
      aria-label={`Open ${note.attachmentName || "image"} in Google Drive`}
    >
      {isPreviewLoading && !previewFailed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground"
            aria-hidden
          />
          <span className="text-sm text-muted-foreground">
            Fetching preview
          </span>
        </div>
      ) : null}
      {previewFailed ? (
        <span className="px-4 py-8 text-sm text-muted-foreground">
          Preview unavailable
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/notes/attachment/${note.attachmentId}`}
          alt={note.attachmentName || "Attachment"}
          onLoad={() => setIsPreviewLoading(false)}
          onError={() => {
            setIsPreviewLoading(false);
            setPreviewFailed(true);
          }}
          className={`max-h-48 w-auto object-contain transition-opacity ${
            isPreviewLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </a>
  );
}

export default function FlatNotesPage() {
  const router = useRouter();
  const params = useParams<{ flat: string }>();
  const flat = params.flat;

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(todayEnGb());
  const [newFile, setNewFile] = useState<File | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState(todayEnGb());
  const [editFile, setEditFile] = useState<File | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<NoteType | null>(null);

  const fetchNotes = async () => {
    const response = await axios.get(`/api/notes/${flat}`);
    if (response.data.success) {
      setNotes(response.data.data);
    } else {
      throw new Error(response.data.message || "Failed to fetch notes");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [notesResult, flatsResult] = await Promise.all([
          axios.get(`/api/notes/${flat}`),
          axios.get("/api/flats"),
        ]);

        if (notesResult.data.success) {
          setNotes(notesResult.data.data);
        } else {
          toast.error(notesResult.data.message || "Could not fetch notes");
        }

        const flatRecord = flatsResult.data.data?.[flat];
        setGuestName(flatRecord?.guest_name ?? "");
      } catch (error) {
        console.error(error);
        toast.error("Could not fetch notes");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [flat]);

  const addNote = async () => {
    const text = newNoteText.trim();
    if (!text) {
      toast.error("Please enter a note");
      return;
    }
    if (!newNoteDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setIsSaving(true);
      setIsAddingNote(true);

      let response;
      if (newFile) {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("date", newNoteDate);
        formData.append("file", newFile);
        response = await axios.post(`/api/notes/${flat}`, formData);
      } else {
        response = await axios.post(`/api/notes/${flat}`, {
          text,
          date: newNoteDate,
        });
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add note");
      }
      setNewNoteText("");
      setNewNoteDate(todayEnGb());
      setNewFile(null);
      await fetchNotes();
      toast.success("Note added");
    } catch (error) {
      console.error(error);
      toast.error("Could not add note");
    } finally {
      setIsSaving(false);
      setIsAddingNote(false);
    }
  };

  const saveEdit = async () => {
    if (!editingNote) return;
    const text = editText.trim();
    if (!text) {
      toast.error("Please enter a note");
      return;
    }
    if (!editDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setIsSaving(true);

      let response;
      if (editFile) {
        const formData = new FormData();
        formData.append("id", editingNote.id);
        formData.append("text", text);
        formData.append("date", editDate);
        formData.append("file", editFile);
        response = await axios.patch(`/api/notes/${flat}`, formData);
      } else {
        response = await axios.patch(`/api/notes/${flat}`, {
          id: editingNote.id,
          text,
          date: editDate,
        });
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update note");
      }
      setEditOpen(false);
      setEditingNote(null);
      setEditFile(null);
      await fetchNotes();
      toast.success("Note updated");
    } catch (error) {
      console.error(error);
      toast.error("Could not update note");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingNote || isDeletingNote) return;

    try {
      setIsDeletingNote(true);
      const response = await axios.delete(
        `/api/notes/${flat}?id=${encodeURIComponent(deletingNote.id)}`
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete note");
      }
      setDeleteOpen(false);
      setDeletingNote(null);
      await fetchNotes();
      toast.success("Note deleted");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete note");
    } finally {
      setIsDeletingNote(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAddingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-background px-8 py-6 shadow-lg">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
              aria-hidden
            />
            <p className="text-sm font-medium">Saving note...</p>
          </div>
        </div>
      )}
      <div className="flex items-center mb-4">
        <Button
          variant="default"
          onClick={() => router.push("/settings")}
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <FaArrowLeft />
        </Button>
        <div className="mx-4">
          <h1 className="text-2xl font-bold">Notes · Flat {flat}</h1>
          {guestName ? (
            <p className="text-sm text-muted-foreground">{guestName}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <div className="border rounded-lg p-4 grid gap-3">
          <div>
            <label className="text-sm">Note</label>
            <ExpandingTextarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
          <div>
            <label className="text-sm">Date</label>
            <DatePicker
              init={newNoteDate}
              setDate={(date) => setNewNoteDate(formatDateEnGb(date))}
            />
          </div>
          <div>
            <label className="text-sm">Photo/PDF</label>
            <input
              id="new-note-attachment"
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && !isAllowedAttachment(file)) {
                  toast.error("Only photos and PDF files are allowed");
                  e.target.value = "";
                  setNewFile(null);
                  return;
                }
                setNewFile(file ?? null);
              }}
            />
            <label
              htmlFor="new-note-attachment"
              className="mt-1 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FaPaperclip />
              Click to select photo/file to upload
            </label>
            {newFile ? (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <FaPaperclip className="h-3 w-3" />
                {newFile.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Optional. 1 file per note (photo or PDF). Max 8 MB.
              </p>
            )}
          </div>
          <Button disabled={isSaving || isAddingNote} onClick={addNote}>
            <FaFloppyDisk />
            Add note
          </Button>
        </div>

        {notes.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center">
            No notes yet
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4">
              <p className="whitespace-pre-wrap mb-3">{note.text}</p>
              {note.attachmentId && isImageMime(note.attachmentMimeType) ? (
                <ImageAttachmentPreview note={note} />
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{displayNoteDate(note.date)}</div>
                  {note.attachmentId && note.attachmentName ? (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={driveFileUrl(note.attachmentId)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaPaperclip />
                        {note.attachmentName}
                        <FaArrowUpRightFromSquare />
                      </a>
                    </Button>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingNote(note);
                      setEditText(note.text);
                      setEditDate(note.date || todayEnGb());
                      setEditFile(null);
                      setEditOpen(true);
                    }}
                  >
                    <FaPencil />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setDeletingNote(note);
                      setDeleteOpen(true);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit note</DialogTitle>
            <DialogDescription>
              Update the note text, date, or attachment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="text-sm">Note</label>
              <ExpandingTextarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">Date</label>
              <DatePicker
                init={editDate}
                setDate={(date) => setEditDate(formatDateEnGb(date))}
              />
            </div>
            <div>
              <label className="text-sm">Photo/PDF</label>
              <input
                id="edit-note-attachment"
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !isAllowedAttachment(file)) {
                    toast.error("Only photos and PDF files are allowed");
                    e.target.value = "";
                    setEditFile(null);
                    return;
                  }
                  setEditFile(file ?? null);
                }}
              />
              <label
                htmlFor="edit-note-attachment"
                className="mt-1 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <FaPaperclip />
                Click to select photo/file to upload
              </label>
              {editFile ? (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <FaPaperclip className="h-3 w-3" />
                  {editFile.name}
                </p>
              ) : editingNote?.attachmentName ? (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <FaPaperclip className="h-3 w-3" />
                  Current: {editingNote.attachmentName} (replacing keeps 1 file)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Optional. 1 file per note (photo or PDF). Max 8 MB.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                    aria-hidden
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (isDeletingNote) return;
          setDeleteOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeletingNote}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isDeletingNote}
            >
              {isDeletingNote ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden
                  />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
