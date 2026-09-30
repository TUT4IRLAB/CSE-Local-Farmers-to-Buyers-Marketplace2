import React, { useState } from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'login' | 'register'>('login');

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
