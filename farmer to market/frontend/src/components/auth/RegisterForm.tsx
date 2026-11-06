import React, { useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, PartyPopper } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoleSelector from './RoleSelector';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onComplete: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onComplete }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: Success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>('buyer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please provide your name, email and password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: role === 'farmer' ? 'farmer' : 'buyer',
      });
      setStep(2);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Is the backend running?'
          : 'Registration failed. Please try again.');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-200">
          <RoleSelector selectedRole={role} onRoleChange={setRole} />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onSwitchToLogin} className="btn-secondary flex-1 py-3">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="text-center py-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={32} />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">Welcome, {formData.fullName}!</h3>
          <p className="text-sm text-secondary-500 mb-6">
            Your {role} account is ready and you are now signed in.
          </p>
          <button onClick={onComplete} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Start Exploring
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
