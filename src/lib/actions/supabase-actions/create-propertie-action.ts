"use server";

import { supabase } from "@/lib/supabase";

// Função que garante nomes de arquivo seguros
function sanitizeFileName(filename?: string) {
  if (!filename || typeof filename !== "string") {
    return `file-${Date.now()}`;
  }

  return filename
    .toString()
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "") // tira marcas diacríticas
    .replace(/\s+/g, "_") // troca espaços por "_"
    .replace(/[^a-zA-Z0-9._-]/g, ""); // remove caracteres inválidos
}

// Upload de múltiplos arquivos
async function processFileUploads(files: File[], bucket: string) {
  const urls: string[] = [];

  for (const file of files) {
    if (file.size > 0) {
      const safeName = sanitizeFileName(file.name);
      const filePath = `${Date.now()}-${safeName}`;

      const { data: uploadData, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      urls.push(urlData.publicUrl);
    }
  }

  return urls;
}

// Upload de um único arquivo
async function processSingleFileUpload(file: File | null, bucket: string) {
  if (!file || file.size === 0) return null;

  const safeName = sanitizeFileName(file.name);
  const filePath = `${Date.now()}-${safeName}`;

  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(uploadData.path);

  return urlData.publicUrl;
}

// Action principal para criar propriedade
export async function createProperty(formData: FormData) {
  try {
    // Processar dados do formulário
    const data = {
      owner_id: formData.get("owner_id"),
      title: formData.get("titulo_da_propriedade"),
      description: formData.get("descricao_da_propriedade"),
      endereco: formData.get("endereco_da_propriedade"),
      pais: formData.get("pais_da_propriedade"),
      provincia: formData.get("provincia_da_propriedade"),
      cidade: String(formData.get("cidade_da_propriedade")?.toString() || ""),
      bairro: formData.get("bairro_da_propriedade"),
      tipo: formData.get("tipo_da_propriedade"),
      status: formData.get("estatus_da_propriedade"),
      rotulo: formData.get("rotulo_da_propriedade"),
      price: formData.get("preco_da_propriedade"),
      unidade_preco: formData.get("unidade_preco_da_propriedade"),
      preco_chamada: formData.get("preco_chamada_da_propriedade"),
      caracteristicas: formData.getAll("caracteristicas"),
      size: formData.get("tamanho_da_propriedade"),
      area_terreno: formData.get("area_terreno_da_propriedade"),
      bedrooms: formData.get("quartos_da_propriedade"),
      bathrooms: formData.get("casas_banho_da_propriedade"),
      garagens: formData.get("garagens_da_propriedade"),
      garagem_tamanho: formData.get("tamanho_garagen_da_propriedade"),
      ano_construcao: formData.get("ano_construcao_da_propriedade"),
      propertyid: formData.get("id_da_propriedade"),
      gallery: formData.getAll("imagens_da_propriedade"),
      nota_privada: formData.get("nota_da_propriedade"),
      detalhes_adicionais: Array.from(formData.entries())
        .filter(([key]) => key.startsWith("detalhes"))
        .reduce((acc: any[], [key, value]) => {
          const match = key.match(/detalhes\.(\d+)\.(titulo|valor)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            if (!acc[index]) acc[index] = { titulo: "", valor: "" };
            acc[index][field] = value.toString();
          }
          return acc;
        }, []),
    };

    // Uploads
    const imageUrls = await processFileUploads(
      formData.getAll("imagens_da_propriedade") as File[],
      "images"
    );

    // const documentUrls = await processFileUploads(
    //   formData.getAll("documentos_da_propriedade") as File[],
    //   "files"
    // );

    // const videoUrl = await processSingleFileUpload(
    //   formData.get("video_da_propriedade") as File | null,
    //   "files"
    // );

    // const image360Url = await processSingleFileUpload(
    //   formData.get("imagem_360_da_propriedade") as File | null,
    //   "images"
    // );

    // Inserção no banco
    const { data: insertedData, error } = await supabase
      .from("properties")
      .insert({
        ...data,
        gallery: imageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "Imóvel cadastrado com sucesso!",
      propertyId: insertedData?.[0]?.id,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Erro ao cadastrar imóvel. Por favor, tente novamente.",
      errors: {},
    };
  }
}
