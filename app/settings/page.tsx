"use client";
import { GistUtils } from "@/lib/github_gist_utils";
import { FlatDetailsType } from "@/lib/models";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [flatDetails, setFlatDetails] = useState<FlatDetailsType>({});
  useEffect(() => {
    GistUtils.getFlatDetails().then((flatDetails) => {
      setFlatDetails(flatDetails);
    });
  }, []);
  
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
}
