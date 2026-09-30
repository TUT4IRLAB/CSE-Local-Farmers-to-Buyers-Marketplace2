import React, { useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onComplete: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onComplete }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Profile
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const validateStep1 = () => {
    if (!formData.email || !formData.password || formData.password.length < 6) {
      setError('Please provide a valid email and password (min 6 characters)');
      return false;
    }
    setError('');
    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      setStep(3);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= s ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-400'
            }`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 3 && <div className={`h-1 w-8 rounded-full ${step > s ? 'bg-primary-600' : 'bg-secondary-100'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
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
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onSwitchToLogin} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              Next <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <p className="text-sm text-secondary-500">We've sent a verification code to <span className="font-bold text-secondary-900">{formData.email}</span></p>
          </div>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-0 outline-none"
                onChange={(e) => {
                  if (e.target.value && i < 3) {
                    e.target.nextSibling?.focus();
                  }
                }}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-600 font-medium text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Account'}
          </button>
          <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-secondary-400 hover:underline py-2">Change email address</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleProfileSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
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
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+1 (234) 567-8901"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Complete Setup</button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
