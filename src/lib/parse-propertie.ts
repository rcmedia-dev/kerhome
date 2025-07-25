import { TPropertyResponseSchema } from "./types/property";


export function parsePrismaProperties(data: TPropertyResponseSchema[]): TPropertyResponseSchema[] {
  return data.map((item) => {
    const rawCaracteristicas = item.caracteristicas;
    const rawDetalhes = item.detalhesadicionais;

    const caracteristicas =
      Array.isArray(rawCaracteristicas) && rawCaracteristicas.every((x) => typeof x === 'string')
        ? rawCaracteristicas
        : null;

    const detalhesadicionais =
      Array.isArray(rawDetalhes) &&
      rawDetalhes.every(
        (d) =>
          typeof d === 'object' &&
          d !== null &&
          'titulo' in d &&
          'valor' in d &&
          typeof d.titulo === 'string' &&
          typeof d.valor === 'string'
      )
        ? (rawDetalhes as { titulo: string; valor: string }[])
        : null;

    return {
      ...item,
      caracteristicas,
      detalhesadicionais,
    };
  });
}
