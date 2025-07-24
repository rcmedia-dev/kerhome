import { v4 as uuidv4 } from "uuid";
import { supabaseServer } from "../supabase-server";

export async function uploadToSupabase(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const filename = `${folder}/${uuidv4()}.${ext}`;

  const { error } = await supabaseServer.storage
    .from("files")
    .upload(filename, file, { upsert: false }); // Aqui é o File, não o nome

  if (error) {
    console.error("Erro no upload:", error.message);
    return null;
  }

  const { data } = supabaseServer.storage.from("files").getPublicUrl(filename);
  return data?.publicUrl ?? null;
}
