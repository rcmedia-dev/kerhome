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
export async function processFileUploads(formData: PropertyFormData) {
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
// Função melhorada com dados do proprietário
export async function createProperty(formData: PropertyFormData) {
  try {
    // Processar uploads de arquivos
    const fileData = await processFileUploads(formData);

    // Gerar ID único para a propriedade
    const generatePropertyId = (): string => {
      return `PROP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    };

    // Buscar dados do proprietário
    let ownerData = null;
    try {
      const { data: owner, error: ownerError } = await supabase
        .from('profiles')
        .select('primeiro_nome, ultimo_nome, email, telefone')
        .eq('id', formData.owner_id)
        .single();

      if (!ownerError) {
        ownerData = owner;
      }
    } catch (ownerError) {
      console.warn('Erro ao buscar dados do proprietário:', ownerError);
    }

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

    // 🔔 ENVIAR NOTIFICAÇÃO PARA O WEBHOOK COM DADOS COMPLETOS
    try {
      await sendPropertyNotification({
        property_id: data.id,
        property_title: formData.title,
        property_type: formData.tipo,
        property_status: formData.status,
        price: formData.price || 0,
        city: formData.cidade,
        neighborhood: formData.bairro,
        address: formData.endereco,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        size: formData.size || 0,
        owner_id: formData.owner_id,
        owner_name: ownerData ? `${ownerData.primeiro_nome} ${ownerData.ultimo_nome}` : 'Não disponível',
        owner_email: ownerData?.email || 'Não disponível',
        owner_phone: ownerData?.telefone || 'Não disponível',
        created_at: new Date().toISOString()
      });
    } catch (notificationError) {
      console.warn('Erro ao enviar notificação:', notificationError);
      // Não falha o processo principal se a notificação falhar
    }

    revalidatePath("/properties");
    return { success: true, propertyId: data.id, property: data };
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    return { success: false, error: "Erro ao criar propriedade" };
  }
}

// Função melhorada para enviar notificação
async function sendPropertyNotification(propertyData: {
  property_id: string;
  property_title: string;
  property_type: string;
  property_status: string;
  price: number;
  city: string;
  neighborhood?: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  created_at: string;
}) {
  const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';
  
  const payload = {
    evento: 'cadastro_imovel',
    dados: {
      ...propertyData,
      tipo_solicitacao: 'cadastro_imovel',
      data_cadastro: new Date().toISOString(),
      // Formatar preço para exibição
      price_formatted: new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(propertyData.price)
    }
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
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
