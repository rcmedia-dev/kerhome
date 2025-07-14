'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
// Removido mock-api, cadastro agora só usa Supabase
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth-context';
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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Campos de localização para o mapa
  const [endereco, setEndereco] = useState('');
  const [pais, setPais] = useState('');
  const [provincia, setProvincia] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');

  // Estado para detalhes adicionais dinâmicos
  const [detalhesAdicionais, setDetalhesAdicionais] = useState([{ titulo: '', valor: '' }]);

  // Estados para cada campo do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [rotulo, setRotulo] = useState('');
  const [preco, setPreco] = useState('');
  const [unidadePreco, setUnidadePreco] = useState('');
  const [precoAntes, setPrecoAntes] = useState('');
  const [precoDepois, setPrecoDepois] = useState('');
  const [precoChamada, setPrecoChamada] = useState('');
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [size, setSize] = useState('');
  const [areaTerreno, setAreaTerreno] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [garagens, setGaragens] = useState('');
  const [garagemTamanho, setGaragemTamanho] = useState('');
  const [anoConstrucao, setAnoConstrucao] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [notaPrivada, setNotaPrivada] = useState('');

  // Estado para imagens
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);



  // Função utilitária para converter string de preço em número
  function parseNumber(str: string) {
    if (!str) return null;
    return Number(str.replace(/[^\d]/g, ''));
  }



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!user) {
      setError('Você precisa estar autenticado para cadastrar um imóvel.');
      return;
    }
    try {
      const supabase = getSupabaseClient();

      // Upload das imagens (galleryFiles) em paralelo
      let galleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        const uploadResults = await Promise.all(galleryFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          // Evita select após upload: { returnMetadata: false }
          const { data, error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
          return { error: uploadError, url: data ? supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl : null };
        }));
        for (const result of uploadResults) {
          if (result.error) {
            setError('Erro ao fazer upload de imagem: ' + result.error.message);
            return;
          }
          if (result.url) galleryUrls.push(result.url);
        }
      }

     const result = await createProperty({
        ownerId: user.id,
        title: titulo,
        description: descricao,
        tipo,
        status,
        rotulo,
        price: parseNumber(preco) ?? undefined,
        unidade_preco: unidadePreco,
        preco_antes: parseNumber(precoAntes) ?? undefined,
        preco_depois: parseNumber(precoDepois) ?? undefined,
        preco_chamada: precoChamada,
        caracteristicas,
        size,
        area_terreno: areaTerreno ? parseFloat(areaTerreno) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        garagens: garagens ? parseInt(garagens) : undefined,
        garagemtamanho: garagemTamanho,
        anoconstrucao: anoConstrucao ? parseInt(anoConstrucao) : undefined,
        propertyid: propertyId || undefined,
        detalhesadicionais: detalhesAdicionais,
        endereco,
        bairro,
        cidade,
        provincia,
        pais,
        notaprivada: notaPrivada,
        gallery: galleryUrls,
        image: galleryUrls[0] || undefined,
      });
      
      if (!result.success) {
        setError(result.error || 'Erro ao cadastrar imóvel.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError('Erro ao cadastrar imóvel.');
    }
  }

  function handleAddDetalhe() {
    setDetalhesAdicionais([...detalhesAdicionais, { titulo: '', valor: '' }]);
  }

  function handleDetalheChange(idx: number, field: 'titulo' | 'valor', value: string) {
    setDetalhesAdicionais(detalhesAdicionais.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  // Monta string de endereço para o mapa
  const enderecoCompleto = [endereco, bairro, cidade, provincia, pais].filter(Boolean).join(', ');
  const mapSrc = enderecoCompleto
    ? `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&q=${encodeURIComponent(enderecoCompleto)}`
    : 'https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-2 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cadastrar Novo Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-green-600 text-center font-semibold py-8">Imóvel cadastrado com sucesso!</div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Propriedades do Imóvel */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Título da Propriedade</label>
                <input className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2" required value={titulo} onChange={e => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição do Imóvel</label>
                <textarea className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2" rows={2} required value={descricao} onChange={e => setDescricao(e.target.value)} />
              </div>
              {/* Localização */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">📍 Localização</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Endereço" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={endereco} onChange={e => setEndereco(e.target.value)} />
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                    <select className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full" value={pais} onChange={e => setPais(e.target.value)}>
                      <option value="">Selecione o país</option>
                      {paises.map((pais) => (
                        <option key={pais} value={pais}>{pais}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Província / Estado</label>
                    <select className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full" value={provincia} onChange={e => setProvincia(e.target.value)}>
                      <option value="">Selecione a província</option>
                      {provinciasAngola.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
                    <select className="rounded-md border border-gray-300 bg-gray-50 p-2 w-full" value={cidade} onChange={e => setCidade(e.target.value)}>
                      <option value="">Selecione a cidade</option>
                      {cidadesAngola.map((cidade) => (
                        <option key={cidade} value={cidade}>{cidade}</option>
                      ))}
                    </select>
                  </div>
                  <input placeholder="Bairro" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={bairro} onChange={e => setBairro(e.target.value)} />
                </div>
                {/* Mapa dinâmico */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mapa da Localização</label>
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      title="Mapa do imóvel"
                      src={mapSrc}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
              {/* Tipo e Estado */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">🏢 Tipo e Estado</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Tipo de Propriedade" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={tipo} onChange={e => setTipo(e.target.value)} />
                  <select className="rounded-md border border-gray-300 bg-gray-50 p-2" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="">Selecione o estado</option>
                    <option value="para alugar">Para Alugar</option>
                    <option value="para comprar">Para Vender</option>
                  </select>
                  <select className="rounded-md border border-gray-300 bg-gray-50 p-2" value={rotulo} onChange={e => setRotulo(e.target.value)}>
                    <option value="">Selecione o rótulo</option>
                    <option value="Promoção">Promoção</option>
                    <option value="À Venda">À Venda</option>
                  </select>
                </div>
              </div>
              {/* Preço */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">💰 Preço</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Preço (KZ)" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={preco} onChange={e => setPreco(e.target.value)} />
                  <input placeholder="Unidade de Preço" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={unidadePreco} onChange={e => setUnidadePreco(e.target.value)} />
                  <input placeholder="Antes da Etiqueta de Preço" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={precoAntes} onChange={e => setPrecoAntes(e.target.value)} />
                  <input placeholder="Depois da Etiqueta de Preço" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={precoDepois} onChange={e => setPrecoDepois(e.target.value)} />
                  <input placeholder="Preço de Chamada" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={precoChamada} onChange={e => setPrecoChamada(e.target.value)} />
                </div>
              </div>
              {/* Características */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">✅ Características</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {caracteristicasList.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="accent-purple-600" checked={caracteristicas.includes(c)} onChange={e => {
                        if (e.target.checked) setCaracteristicas([...caracteristicas, c]);
                        else setCaracteristicas(caracteristicas.filter(x => x !== c));
                      }} /> {c}
                    </label>
                  ))}
                </div>
              </div>
              {/* Detalhes Técnicos */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">🧾 Detalhes Técnicos</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Tamanho (m²)" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={size} onChange={e => setSize(e.target.value)} />
                  <input placeholder="Área do terreno (m²)" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={areaTerreno} onChange={e => setAreaTerreno(e.target.value)} />
                  <input placeholder="Quartos" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                  <input placeholder="Casas de banho" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
                  <input placeholder="Garagens" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={garagens} onChange={e => setGaragens(e.target.value)} />
                  <input placeholder="Garagens de Tamanho (m²)" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={garagemTamanho} onChange={e => setGaragemTamanho(e.target.value)} />
                  <input placeholder="Ano de Construção" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={anoConstrucao} onChange={e => setAnoConstrucao(e.target.value)} />
                  <input placeholder="ID da propriedade" className="rounded-md border border-gray-300 bg-gray-50 p-2" value={propertyId} onChange={e => setPropertyId(e.target.value)} />
                </div>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Detalhes adicionais</label>
                  {detalhesAdicionais.map((detalhe, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="flex-1 rounded-md border border-gray-300 bg-gray-50 p-2"
                        placeholder="Título"
                        value={detalhe.titulo}
                        onChange={e => handleDetalheChange(idx, 'titulo', e.target.value)}
                      />
                      <input
                        className="flex-1 rounded-md border border-gray-300 bg-gray-50 p-2"
                        placeholder="Valor"
                        value={detalhe.valor}
                        onChange={e => handleDetalheChange(idx, 'valor', e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-1 text-purple-700 hover:text-purple-900 text-xs font-semibold mt-1"
                    onClick={handleAddDetalhe}
                  >
                    <Plus className="w-4 h-4" /> Adicionar detalhe
                  </button>
                </div>
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
                      onChange={e => setGalleryFiles(Array.from(e.target.files || []))}
                    />
                  </div>
                  {/* Anexos de Arquivo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Anexos de Arquivo</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp"
                      multiple
                      className="block w-full text-xs text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  {/* Upload de Vídeo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vídeo</label>
                    <input
                      type="file"
                      accept="video/*"
                      className="block w-full text-xs text-gray-700 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  {/* Imagem 360 */}
                  <input placeholder="Imagem 360" className="rounded-md border border-gray-300 bg-gray-50 p-2" />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="accent-purple-600" /> Planos de chão (ativar/desativar)
                  </label>
                </div>
              </div>
              {/* Nota Privada */}
              <div className="pt-2 border-t">
                <div className="font-semibold text-gray-700 mb-2">📝 Nota Privada</div>
                <textarea className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2" rows={2} placeholder="Nota Privada (não exibida ao público)" value={notaPrivada} onChange={e => setNotaPrivada(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 font-semibold mt-2">
                Cadastrar Imóvel
              </button>
              {error && <div className="text-red-600 text-center text-sm">{error}</div>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
