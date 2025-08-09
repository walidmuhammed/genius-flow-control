import { useAuth } from '@/hooks/useAuth';

export const useUserRole = () => {
  const { profile } = useAuth();
  
  const isAdmin = profile?.user_type === 'admin';
  const isCourier = profile?.user_type === 'courier';
  const isClient = profile?.user_type === 'client';
  
  const canSeeAwaitingPayment = isAdmin || isCourier;
  
  return {
    userType: profile?.user_type,
    isAdmin,
    isCourier,
    isClient,
    canSeeAwaitingPayment
  };
};