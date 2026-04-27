import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

interface CheckoutGuardProps {
  onSuccess: () => void;
  children: (props: { handleAction: () => void }) => React.ReactElement;
}

/**
 * A utility component/hook pattern to wrap actions that require
 * both authentication and a completed profile (checkout/buy).
 */
export default function CheckoutGuard({ onSuccess, children }: CheckoutGuardProps) {
  const { user } = useAuthStore();
  const { setLoginModalOpen, setOnboardingModalOpen } = useUIStore();

  const handleAction = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!user.onboardingComplete) {
      setOnboardingModalOpen(true);
      return;
    }

    onSuccess();
  };

  return children({ handleAction });
}
