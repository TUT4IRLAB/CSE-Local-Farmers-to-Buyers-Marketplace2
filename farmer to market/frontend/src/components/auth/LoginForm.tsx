import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoleSelector from './RoleSelector';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password, role as any);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RoleSelector selectedRole={role} onRoleChange={setRole} />
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
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-secondary-700">Password</label>
          <a href="#" className="text-xs text-primary-600 hover:underline font-medium">Forgot password?</a>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-12"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 animate-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
      </button>

      <p className="text-center text-sm text-secondary-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary-600 font-bold hover:underline"
        >
          Create Account
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
