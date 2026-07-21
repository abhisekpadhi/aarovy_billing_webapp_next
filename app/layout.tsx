"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppCtx, AppCtxType } from "@/lib/models";
import { ClerkProvider, SignedIn, SignOutButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function SignOutConfirmButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="rounded-full bg-red-600 text-white hover:bg-red-700"
        onClick={() => setOpen(true)}
      >
        Sign out
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SignOutButton redirectUrl="/bills">
              <Button
                type="button"
                className="rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Sign out
              </Button>
            </SignOutButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [bills, setBills] = useState<AppCtxType["billCached"]>(null);

  const ctxValue = { billCached: bills, setBillCached: setBills };

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedIn>
              <SignOutConfirmButton />
            </SignedIn>
          </header>
          <AppCtx.Provider value={ctxValue}>
            <div className="flex flex-col h-screen px-4 py-6">{children}</div>
            <Toaster position="top-center" reverseOrder={false} gutter={8} />
          </AppCtx.Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
