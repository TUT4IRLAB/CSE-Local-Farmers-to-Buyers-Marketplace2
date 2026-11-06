import React, { useState } from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  React.useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={view === 'login' ? 'Welcome Back' : 'Join the Community'}
      size="sm"
    >
      {view === 'login' ? (
        <LoginForm
          onSwitchToRegister={() => setView('register')}
          onClose={onClose}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={() => setView('login')}
          onComplete={onClose}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
