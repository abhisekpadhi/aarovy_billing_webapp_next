"use client";
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
              <div className="text-red-500">
                <SignOutButton redirectUrl="/bills" />
              </div>
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
