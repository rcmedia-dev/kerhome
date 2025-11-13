import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { getMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { getFaturas } from '@/lib/functions/supabase-actions/user-bills-action';
import { useQuery } from '@tanstack/react-query';

export function useDashboardQueries(userId: string | undefined) {
  const userProperties = useQuery({
    queryKey: ['user-properties', userId],
    queryFn: async () => {
      try {
        if (!userId) throw new Error('User ID is required');
        return await getSupabaseUserProperties(userId);
      } catch (error) {
        console.error('Error fetching user properties:', error);
        return [];
      }
    },
    enabled: !!userId,
  });

  const userFavoriteProperties = useQuery({
    queryKey: ['favorite-properties', userId],
    queryFn: async () => {
      try {
        if (!userId) throw new Error('User ID is required');
        return await getImoveisFavoritos(userId);
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
        return [];
      }
    },
    enabled: !!userId,
  });

  const userInvoices = useQuery({
    queryKey: ['user-invoices', userId],
    queryFn: async () => {
      try {
        if (!userId) throw new Error('User ID is required');
        return await getFaturas(userId);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },
    enabled: !!userId,
  });

  const mostViewed = useQuery({
    queryKey: ['most-viewed', userId],
    queryFn: async () => {
      try {
        if (!userId) throw new Error('User ID is required');
        return await getMyPropertiesWithViews(userId);
      } catch (error) {
        console.error('Error fetching most viewed:', error);
        return { total_views_all: 0, properties: [] };
      }
    },
    enabled: !!userId,
  });

  const userPlan = useQuery({
    queryKey: ['user-plan', userId],
    queryFn: async () => {
      try {
        if (!userId) throw new Error('User ID is required');
        return await getUserPlan(userId);
      } catch (error) {
        console.error('Error fetching user plan:', error);
        return null;
      }
    },
    enabled: !!userId,
  });

  return {
    userProperties,
    userFavoriteProperties,
    userInvoices,
    mostViewed,
    userPlan,
    isLoading: userProperties.isLoading || 
               userFavoriteProperties.isLoading || 
               userPlan.isLoading,
    isError: userProperties.isError || 
             userFavoriteProperties.isError || 
             userInvoices.isError || 
             mostViewed.isError || 
             userPlan.isError
  };
}
