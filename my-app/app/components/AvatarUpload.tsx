"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AvatarUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const filePath = `avatars/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    onUpload(data.publicUrl);
    setLoading(false);
  }

  return (
    <input
      type="file"
      accept="image/*"
      disabled={loading}
      onChange={handleUpload}
    />
  );
}
