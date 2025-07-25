'use server'

import prisma from '../prisma';
import { TPropertyResponseSchema } from '../types/property';

export async function getUserProperties(userId: string): Promise<TPropertyResponseSchema[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      include: {
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const propriedadesCorrigidas: TPropertyResponseSchema[] = properties.map((p, index) => {
      let caracteristicasCorrigidas: string[] | null = null;
      let detalhesAdicionaisCorrigidos: { titulo: string; valor: string }[] | null = null;

      // Corrigir caracteristicas
      try {
        if (typeof p.caracteristicas === 'string') {
          caracteristicasCorrigidas = JSON.parse(p.caracteristicas);
        } else if (Array.isArray(p.caracteristicas)) {
          caracteristicasCorrigidas = p.caracteristicas as string[];
        }
      } catch (err) {
        console.warn(`Erro ao parsear caracteristicas da propriedade #${index}`);
      }

      // Corrigir detalhes adicionais
      try {
        if (typeof p.detalhesadicionais === 'string') {
          detalhesAdicionaisCorrigidos = JSON.parse(p.detalhesadicionais);
        } else if (Array.isArray(p.detalhesadicionais)) {
          detalhesAdicionaisCorrigidos = p.detalhesadicionais as { titulo: string; valor: string }[];
        }
      } catch (err) {
        console.warn(`Erro ao parsear detalhes adicionais da propriedade #${index}`);
      }

      return {
        ...p,
        pais: p.pais ?? '',
        provincia: p.provincia ?? '',
        cidade: p.cidade ?? '', // CORRIGIDO AQUI
        bairro: p.bairro ?? '',
        propertyid: p.propertyid ?? '',
        endereco: p.endereco ?? '',
        caracteristicas: caracteristicasCorrigidas,
        detalhesadicionais: detalhesAdicionaisCorrigidos,
        anoconstrucao: p.anoconstrucao ?? 0,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        owner: {
          ...p.owner,
          createdAt: p.owner.createdAt.toISOString(),
          updatedAt: p.owner.updatedAt.toISOString(),
        },
      };
    });

    return propriedadesCorrigidas;
  } catch (error) {
    console.error('Erro ao buscar propriedades do usuário:', error);
    return [];
  }
}
