// actions/property-actions.ts
"use server";

import { supabase } from "@/lib/supabase";
import { PropertyDBData, PropertyFormData } from "@/lib/types/property";
import { revalidatePath } from "next/cache";

// Função para upload de arquivos para o Supabase Storage
async function uploadFileToSupabase(file: File, bucket: string, path: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  // Obter URL pública do arquivo
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

// Processar uploads de arquivos
async function processFileUploads(formData: PropertyFormData) {
  const processedData: Partial<PropertyDBData> = {};

  // Processar imagem principal
  if (formData.image instanceof File && formData.image.size > 0) {
    processedData.image = await uploadFileToSupabase(formData.image, "files", "images");
  } else if (typeof formData.image === "string") {
    processedData.image = formData.image;
  } else {
    processedData.image = "";
  }

  // Processar galeria
  if (Array.isArray(formData.gallery) && formData.gallery.length > 0) {
    const galleryUrls: string[] = [];

    for (const item of formData.gallery) {
      if (item instanceof File && item.size > 0) {
        const url = await uploadFileToSupabase(item, "files", "gallery");
        galleryUrls.push(url);
      } else if (typeof item === "string") {
        galleryUrls.push(item);
      }
    }

    processedData.gallery = galleryUrls;
  } else {
    processedData.gallery = [];
  }

  // Processar documentos
  if (Array.isArray(formData.documents) && formData.documents.length > 0) {
    const documentUrls: string[] = [];

    for (const item of formData.documents) {
      if (item instanceof File && item.size > 0) {
        const url = await uploadFileToSupabase(item, "files", "docs");
        documentUrls.push(url);
      } else if (typeof item === "string") {
        documentUrls.push(item);
      }
    }

    processedData.documents = documentUrls;
  } else {
    processedData.documents = [];
  }

  return processedData;
}

// Função principal para criar propriedade
export async function createProperty(formData: PropertyFormData) {
  try {
    // Processar uploads de arquivos
    const fileData = await processFileUploads(formData);

    // Gerar ID único para a propriedade
    const generatePropertyId = (): string => {
      return `PROP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    };

    // Preparar dados para inserção
    const propertyData: PropertyDBData = {
      owner_id: formData.owner_id,
      title: formData.title,
      description: formData.description,
      tipo: formData.tipo,
      status: formData.status,
      rotulo: formData.rotulo || "",
      price: formData.price || 0,
      unidade_preco: formData.unidade_preco || "",
      preco_chamada: formData.preco_chamada || 0,
      size: formData.size || 0,
      area_terreno: formData.area_terreno || 0,
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      garagens: formData.garagens || 0,
      garagem_tamanho: formData.garagem_tamanho || 0,
      ano_construcao: formData.ano_construcao || new Date().getFullYear(),
      propertyid: formData.propertyid || generatePropertyId(),
      endereco: formData.endereco,
      bairro: formData.bairro,
      cidade: formData.cidade,
      provincia: formData.provincia,
      pais: formData.pais || "Brasil",
      nota_privada: formData.nota_privada || "",
      detalhes_adicionais: formData.detalhes_adicionais || "",
      video_url: formData.video_url || "",
      is_featured: formData.is_featured || false,
      rejection_reason: formData.rejection_reason || "",
      aprovement_status: "pending",
      caracteristicas: Array.isArray(formData.caracteristicas)
        ? formData.caracteristicas
        : typeof formData.caracteristicas === "string"
        ? formData.caracteristicas.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      image: fileData.image || "",
      gallery: fileData.gallery || [],
      documents: fileData.documents || [],
    };

    // Inserir propriedade no Supabase
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          ...propertyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar propriedade:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/properties");
    return { success: true, propertyId: data.id, property: data };
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    return { success: false, error: "Erro ao criar propriedade" };
  }
}

// Função para atualizar propriedade
export async function updateProperty(id: string, formData: Partial<PropertyFormData>) {
  try {
    // Processar uploads de arquivos se fornecidos
    const fileData = await processFileUploads(formData as PropertyFormData);

    // Remover campos incompatíveis (File ou (string|File)[])
    const { image, gallery, documents, ...rest } = formData;

    // Preparar dados para atualização
    const updateData: Partial<PropertyDBData> = {
      ...rest,
      ...fileData,
      updated_at: new Date().toISOString(),
    };

    // Remover campos undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof PropertyDBData] === undefined) {
        delete updateData[key as keyof PropertyDBData];
      }
    });

    const { data, error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar propriedade:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    return { success: true, property: data };
  } catch (error) {
    console.error("Erro ao atualizar propriedade:", error);
    return { success: false, error: "Erro ao atualizar propriedade" };
  }
}
