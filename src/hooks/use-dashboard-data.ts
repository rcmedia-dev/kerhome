import { useQuery } from '@tanstack/react-query';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { getFaturas } from '@/lib/functions/supabase-actions/user-bills-action';
import { getMyPropertiesWithViews } from '@/lib/functions/supabase-actions/property-views-actions';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { getUserAgency } from '@/lib/functions/supabase-actions/imobiliaria-actions';

export function useDashboardData(userId: string | undefined) {
    const userProperties = useQuery({
        queryKey: ['user-properties', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await getSupabaseUserProperties(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    const userFavoriteProperties = useQuery({
        queryKey: ['favorite-properties', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await getImoveisFavoritos(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    const userInvoices = useQuery({
        queryKey: ['user-invoices', userId],
        queryFn: async () => {
            if (!userId) return [];
            return await getFaturas(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    const mostViewed = useQuery({
        queryKey: ['most-viewed', userId],
        queryFn: async () => {
            if (!userId) return { total_views_all: 0, properties: [] };
            return await getMyPropertiesWithViews(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    const userPlan = useQuery({
        queryKey: ['user-plan', userId],
        queryFn: async () => {
            if (!userId) return null;
            return await getUserPlan(userId);
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000,
    });

    const userAgency = useQuery({
        queryKey: ['user-agency', userId],
        queryFn: async () => {
            if (!userId) return null;
            return await getUserAgency(userId);
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000,
    });

    const isLoading = userProperties.isLoading ||
        userFavoriteProperties.isLoading ||
        userInvoices.isLoading ||
        mostViewed.isLoading ||
        userPlan.isLoading;

    return {
        userProperties,
        userFavoriteProperties,
        userInvoices,
        mostViewed,
        userPlan,
        userAgency,
        isLoading
    };
}

