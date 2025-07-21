'use client';

import { FieldValue, FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Removido mock-api, cadastro agora só usa Supabase
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Loader2, Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { propriedadeSchema, TPropriedadeFormData } from '@/lib/types/property';
import { createProperty } from '@/lib/actions/create-property';




const caracteristicasList = [
  'Ar Condicionado',
  'Aquecimento Central',
  'Fogão Elétrico',
  'Alarme de Incêndio',
  'Academia',
  'Home Theater',
  'Lavanderia',
  'Lavanderia Separada',
  'Pisos de Mármore',
  'Micro-ondas',
  'Geladeira',
  'Sauna',
  'Piscina',
  'TV a Cabo',
  'Máquina de Lavar',
  'WiFi'
];

const paises = [
  'Afeganistão','África do Sul','Albânia','Alemanha','Andorra','Angola','Antígua e Barbuda','Arábia Saudita','Argélia','Argentina','Armênia','Austrália','Áustria','Azerbaijão','Bahamas','Bahrein','Bangladesh','Barbados','Bélgica','Belize','Benim','Bielorrússia','Bolívia','Bósnia e Herzegovina','Botsuana','Brasil','Brunei','Bulgária','Burquina Faso','Burundi','Butão','Cabo Verde','Camarões','Camboja','Canadá','Catar','Cazaquistão','Chade','Chile','China','Chipre','Colômbia','Comores','Congo (Brazzaville)','Congo (Kinshasa)','Coreia do Norte','Coreia do Sul','Costa do Marfim','Costa Rica','Croácia','Cuba','Dinamarca','Djibuti','Dominica','Egito','El Salvador','Emirados Árabes Unidos','Equador','Eritreia','Eslováquia','Eslovênia','Espanha','Essuatíni','Estados Unidos','Estônia','Etiópia','Fiji','Filipinas','Finlândia','França','Gabão','Gâmbia','Gana','Geórgia','Granada','Grécia','Guatemala','Guiana','Guiné','Guiné Equatorial','Guiné-Bissau','Haiti','Holanda (Países Baixos)','Honduras','Hungria','Iémen','Ilhas Marshall','Ilhas Salomão','Índia','Indonésia','Irã','Iraque','Irlanda','Islândia','Israel','Itália','Jamaica','Japão','Jordânia','Kiribati','Kuwait','Laos','Lesoto','Letônia','Líbano','Libéria','Líbia','Liechtenstein','Lituânia','Luxemburgo','Macedônia do Norte','Madagáscar','Malásia','Maláui','Maldivas','Mali','Malta','Marrocos','Maurícia','Mauritânia','México','Micronésia','Moçambique','Moldávia','Mônaco','Mongólia','Montenegro','Myanmar (Birmânia)','Namíbia','Nauru','Nepal','Nicarágua','Níger','Nigéria','Noruega','Nova Zelândia','Omã','Palau','Palestina','Panamá','Papua-Nova Guiné','Paquistão','Paraguai','Peru','Polônia','Portugal','Quênia','Quirguistão','Reino Unido','República Centro-Africana','República Dominicana','República Tcheca','Romênia','Ruanda','Rússia','São Cristóvão e Neves','São Marino','Santa Lúcia','São Tomé e Príncipe','São Vicente e Granadinas','Seicheles','Senegal','Sérvia','Serra Leoa','Singapura','Síria','Somália','Sri Lanka','Sudão','Sudão do Sul','Suécia','Suíça','Suriname','Tailândia','Taiwan (contestada)','Tajiquistão','Tanzânia','Timor-Leste','Togo','Tonga','Trinidad e Tobago','Tunísia','Turcomenistão','Turquia','Tuvalu','Ucrânia','Uganda','Uruguai','Uzbequistão','Vanuatu','Vaticano','Venezuela','Vietnã','Zâmbia','Zimbábue'
];

const provinciasAngola = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Quando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire'
];

const cidadesAngola = [
  'Alto Zambeze','Ambriz','Andulo','Baía Farta','Bailundo','Banga','Belas','Benguela','Buco-Zau','Cacolo','Cacuaco','Cacongo','Cahama','Calai','Calandula','Cambambe','Cambulo','Camacupa','Capenda-Camulemba','Caála','Cazenga','Cazombo','Cela (Waku Kungo)','Cuanhama','Cubal','Cuimba','Dala','Dande','Dundo','Ebo','Ekunha','Gabela','Ganda','Golungo Alto','Huambo','Humpata','Icolo e Bengo','Kamucuio','Kuito','Kilamba Kiaxi','Léua','Lobito','Longonjo','Lucala','Lucapa','Luanda','Luena','Lubango','Luchazes','Maquela do Zombo','Malanje','Marimba','Matala','Mavinga','Mbanza Kongo','Menongue','Moçâmedes','Muconda','Namacunde','Nambuangongo','Ndalatando','Negage','Nóqui','Ondjiva','Pango Aluquém','Porto Amboim','Quela','Quipungo','Rivungo','Sanza Pombo','Saurimo','Soyo','Sumbe','Talatona','Tomboco','Tombwa','Uíge','Viana','Virei'
];

export default function CadastrarImovelPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting }} = useForm<TPropriedadeFormData>({
    resolver: zodResolver(propriedadeSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalhes"
  });

  const onSubmit = async (data: FieldValues) => {

    if (!user) {
      alert('Você precisa estar autenticado para cadastrar uma propriedade.');
      return;
    }

    const formData = new FormData();

    formData.append('titulo_da_propriedade', data.titulo_da_propriedade);
    formData.append('descricao_da_propriedade', data.descricao_da_propriedade);
    formData.append('endereco_da_propriedade', data.endereco_da_propriedade);
    formData.append('pais_da_propriedade', data.pais_da_propriedade);
    formData.append('provincia_da_propriedade', data.provincia_da_propriedade);
    formData.append('cidade_da_propriedade', data.cidade_da_propriedade);
    formData.append('bairro_da_propriedade', data.bairro_da_propriedade || '');
    formData.append('tipo_da_propriedade', data.tipo_da_propriedade);
    formData.append('estatus_da_propriedade', data.estatus_da_propriedade);
    formData.append('rotulo_da_propriedade', data.rotulo_da_propriedade);
    formData.append('preco_da_propriedade', String(data.preco_da_propriedade));
    formData.append('unidade_preco_da_propriedade', data.unidade_preco_da_propriedade || '');
    formData.append('preco_chamada_da_propriedade', data.preco_chamada_da_propriedade || '');
    formData.append('tamanho_da_propriedade', data.tamanho_da_propriedade || '');
    formData.append('area_terreno_da_propriedade', data.area_terreno_da_propriedade || '');
    formData.append('quartos_da_propriedade', data.quartos_da_propriedade || '');
    formData.append('casas_banho_da_propriedade', data.casas_banho_da_propriedade || '');
    formData.append('garagens_da_propriedade', data.garagens_da_propriedade || '');
    formData.append('tamanho_garagen_da_propriedade', data.tamanho_garagen_da_propriedade || '');
    formData.append('ano_construcao_da_propriedade', data.ano_construcao_da_propriedade);
    formData.append('id_da_propriedade', data.id_da_propriedade);
    formData.append('imagem_360_da_propriedade', String(data.imagem_360_da_propriedade));
    formData.append('nota_da_propriedade', data.nota_da_propriedade ?? '');

    // Características (checkbox múltiplos)
    data.caracteristicas?.forEach((item: string) => {
      formData.append('caracteristicas[]', item);
    });

    // Detalhes dinâmicos
    data.detalhes.forEach((detalhe: any, index: any) => {
      formData.append(`detalhes[${index}][titulo]`, detalhe.titulo || '');
      formData.append(`detalhes[${index}][valor]`, detalhe.valor || '');
    });

    // Upload de arquivos
    if (data.imagens_da_propriedade?.length > 0) {
      for (const imagem of data.imagens_da_propriedade) {
        formData.append('imagens_da_propriedade', imagem);
      }
    }

    if (data.documentos_da_propriedade?.length > 0) {
      for (const doc of data.documentos_da_propriedade) {
        formData.append('documentos_da_propriedade', doc);
      }
    }

    if (data.video_da_propriedade?.length > 0) {
      for (const video of data.video_da_propriedade) {
        formData.append('video_da_propriedade', video);
      }
    }

    const result = await createProperty(formData);

    if (!result.success) {
      console.log('Erro ao cadastrar:', result.error);
    } else {
      router.push('/dashboard'); // ou onde quiser redirecionar
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-2 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cadastrar Novo Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Propriedades do Imóvel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título da Propriedade</label>
                  <input
                    {...register("titulo_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                  {errors.titulo_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.titulo_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição do Imóvel</label>
                  <textarea
                    {...register("descricao_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    rows={2}
                  />
                  {errors.descricao_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.descricao_da_propriedade.message}</p>
                  )}
                </div>

                {/* Localização */}
                <div className="pt-2 border-t">
                  <div className="font-semibold text-gray-700 mb-2">📍 Localização</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register("endereco_da_propriedade")}
                        placeholder="Endereço"
                        className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      />
                      {errors.endereco_da_propriedade && (
                        <p className="text-red-500 text-xs mt-1">{errors.endereco_da_propriedade.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                      <select
                        {...register("pais_da_propriedade")}
                        className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      >
                        <option value="">Selecione o país</option>
                        {paises.map((pais) => (
                          <option key={pais} value={pais}>{pais}</option>
                        ))}
                      </select>
                      {errors.pais_da_propriedade && (
                        <p className="text-red-500 text-xs mt-1">{errors.pais_da_propriedade.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Província / Estado</label>
                      <select
                        {...register("provincia_da_propriedade")}
                        className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      >
                        <option value="">Selecione a província</option>
                        {provinciasAngola.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                      {errors.provincia_da_propriedade && (
                        <p className="text-red-500 text-xs mt-1">{errors.provincia_da_propriedade.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
                      <select
                        {...register("cidade_da_propriedade")}
                        className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      >
                        <option value="">Selecione a cidade</option>
                        {cidadesAngola.map((cidade) => (
                          <option key={cidade} value={cidade}>{cidade}</option>
                        ))}
                      </select>
                      {errors.cidade_da_propriedade && (
                        <p className="text-red-500 text-xs mt-1">{errors.cidade_da_propriedade.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register("bairro_da_propriedade")}
                        placeholder="Bairro"
                        className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      />
                      {errors.bairro_da_propriedade && (
                        <p className="text-red-500 text-xs mt-1">{errors.bairro_da_propriedade.message}</p>
                      )}
                    </div>
                  </div>
                </div>

               {/* Tipo e Estado + Preço */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">🏢 Tipo e Estado</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      placeholder="Tipo de Propriedade"
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("tipo_da_propriedade")}
                    />
                    {errors.tipo_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.tipo_da_propriedade.message}</p>
                    )}
                  </div>
                  <div>
                    <select
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("estatus_da_propriedade")}
                    >
                      <option value="">Selecione o estado</option>
                      <option value="para alugar">Para Alugar</option>
                      <option value="para comprar">Para Vender</option>
                    </select>
                    {errors.estatus_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.estatus_da_propriedade.message}</p>
                    )}
                  </div>
                  <div>
                    <select
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("rotulo_da_propriedade")}
                    >
                      <option value="">Selecione o rótulo</option>
                      <option value="Promoção">Promoção</option>
                      <option value="À Venda">À Venda</option>
                    </select>
                    {errors.rotulo_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.rotulo_da_propriedade.message}</p>
                    )}
                  </div>
                </div>

                <div className="font-semibold text-gray-700 mb-2 mt-6">💰 Preço</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Preço (KZ)"
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("preco_da_propriedade")}
                    />
                    {errors.preco_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.preco_da_propriedade.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="Unidade de Preço"
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("unidade_preco_da_propriedade")}
                    />
                    {errors.unidade_preco_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.unidade_preco_da_propriedade.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="Preço de Chamada"
                      className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                      {...register("preco_chamada_da_propriedade")}
                    />
                    {errors.preco_chamada_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.preco_chamada_da_propriedade.message}</p>
                    )}
                  </div>
                </div>
              </div>

             {/* ✅ Características + Detalhes Técnicos */}
                  <div className="pt-2 border-t">
                    <div className="font-semibold text-gray-700 mb-2">✅ Características</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {caracteristicasList.map((c) => (
                        <label key={c} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            value={c}
                            {...register("caracteristicas")}
                            className="accent-purple-600"
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                    {errors.caracteristicas && (
                      <p className="text-sm text-red-500 mt-1">{errors.caracteristicas.message}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="font-semibold text-gray-700 mb-2">🧾 Detalhes Técnicos</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input
                          placeholder="Tamanho (m²)"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("tamanho_da_propriedade")}
                        />
                        {errors.tamanho_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.tamanho_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Área do terreno (m²)"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("area_terreno_da_propriedade")}
                        />
                        {errors.area_terreno_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.area_terreno_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Quartos"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("quartos_da_propriedade")}
                        />
                        {errors.quartos_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.quartos_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Casas de banho"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("casas_banho_da_propriedade")}
                        />
                        {errors.casas_banho_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.casas_banho_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Garagens"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("garagens_da_propriedade")}
                        />
                        {errors.garagens_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.garagens_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Garagens de Tamanho (m²)"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("tamanho_garagen_da_propriedade")}
                        />
                        {errors.tamanho_garagen_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.tamanho_garagen_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Ano de Construção"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("ano_construcao_da_propriedade")}
                        />
                        {errors.ano_construcao_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.ano_construcao_da_propriedade.message}</p>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="ID da propriedade"
                          className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full"
                          {...register("id_da_propriedade")}
                        />
                        {errors.id_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.id_da_propriedade.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Detalhes adicionais dinâmicos */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Detalhes adicionais</label>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-2 relative">
                      <div className="w-full md:flex-1">
                        <input
                          className="w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                          placeholder="Título"
                          {...register(`detalhes.${index}.titulo`)}
                        />
                        {errors.detalhes?.[index]?.titulo && (
                          <p className="text-sm text-red-500 mt-1">{errors.detalhes[index].titulo?.message}</p>
                        )}
                      </div>

                      <div className="w-full md:flex-1">
                        <input
                          className="w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                          placeholder="Valor"
                          {...register(`detalhes.${index}.valor`)}
                        />
                        {errors.detalhes?.[index]?.valor && (
                          <p className="text-sm text-red-500 mt-1">{errors.detalhes[index].valor?.message}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 self-start mt-1"
                        title="Remover"
                      >
                        <Trash className="size-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => append({ titulo: '', valor: '' })}
                    className="flex items-center gap-1 text-purple-700 hover:text-purple-900 text-xs font-semibold mt-1"
                  >
                    <Plus className="w-4 h-4" /> Adicionar detalhe
                  </button>
                </div>

              {/* Mídia */}
                  <div className="pt-2 border-t">
                    <div className="font-semibold text-gray-700 mb-2">🖼️ Mídia</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Galeria de Fotos */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Galeria de Fotos</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="block w-full text-xs text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          {...register("imagens_da_propriedade")}
                        />
                        {errors.imagens_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.imagens_da_propriedade.message as string}</p>
                        )}
                      </div>

                      {/* Anexos de Arquivo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Anexos de Arquivo</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp"
                          multiple
                          className="block w-full text-xs text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          {...register("documentos_da_propriedade")}
                        />
                        {errors.documentos_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.documentos_da_propriedade.message as string}</p>
                        )}
                      </div>

                      {/* Upload de Vídeo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Vídeo</label>
                        <input
                          type="file"
                          accept="video/*"
                          className="block w-full text-xs text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          {...register("video_da_propriedade")}
                        />
                        {errors.video_da_propriedade && (
                          <p className="text-sm text-red-500 mt-1">{errors.video_da_propriedade.message as string}</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Imagem 360 */}
                    <input
                      placeholder="Imagem 360"
                      className="rounded-md border border-gray-300 bg-gray-50 p-2"
                    />
                    <label className="flex items-center gap-2 text-xs mt-1">
                      <input
                        {...register("imagem_360_da_propriedade")}
                        type="checkbox"
                        className="accent-purple-600"
                      />
                      Planos de chão (ativar/desativar)
                    </label>
                    {errors.imagem_360_da_propriedade && (
                      <p className="text-sm text-red-500 mt-1">{errors.imagem_360_da_propriedade.message as string}</p>
                    )}

                  {/* Nota Privada */}
                    <div className="pt-2 border-t">
                      <div className="font-semibold text-gray-700 mb-2">📝 Nota Privada</div>
                      <textarea
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                        rows={2}
                        placeholder="Nota Privada (não exibida ao público)"
                        {...register("nota_da_propriedade")}
                      />
                      {errors.nota_da_propriedade && (
                        <p className="text-sm text-red-500 mt-1">{errors.nota_da_propriedade.message as string}</p>
                      )}
                    </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 rounded-md font-semibold mt-2 flex items-center justify-center gap-2 text-white ${
                      isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar Imóvel'
                    )}
                  </button>
            </form>

        </CardContent>
      </Card>
    </div>
  );
}
