import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '../store/auth.slice';
import type { AppDispatch } from '@/core/store/store';
export function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector((state: any) => state.auth.error);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    passwordPin: '',
    twoFAToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(login(formData)).unwrap();

      // Check if 2FA setup is required
      if (result.requires2FASetup) {
        setLoading(false);
        // Redirect to 2FA setup page with fromLogin flag
        navigate(`/admin-2fa-setup?email=${encodeURIComponent(formData.email)}&fromLogin=true`);
        return;
      }

      // Check if 2FA token is required
      if (result.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Reset 2FA state on error
      setRequires2FA(false);
      setFormData((prev) => ({ ...prev, twoFAToken: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="text-red-600 text-sm mb-2 text-center">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 h-12 border border-gray-200 shadow-none text-slate-900 bg-white placeholder:text-gray-500"
            required
            disabled={requires2FA}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type={showPassword ? 'text' : 'password'}
            name="passwordPin"
            placeholder="Password"
            value={formData.passwordPin}
            onChange={handleChange}
            className="pl-10 h-12 border border-gray-200 shadow-none text-slate-900 bg-white placeholder:text-gray-500"
            required
            disabled={requires2FA}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 px-2 -translate-y-1/2 bg-transparent focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 text-gray-500" />
            ) : (
              <Eye className="h-3 w-3 text-gray-500" />
            )}
          </button>
        </div>

        {requires2FA && (
          <>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900">Two-Factor Authentication Required</p>
              </div>
              <p className="text-xs text-purple-700">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500" />
              <Input
                type="text"
                name="twoFAToken"
                placeholder="000000"
                value={formData.twoFAToken}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData((prev) => ({ ...prev, twoFAToken: value }));
                }}
                maxLength={6}
                className="pl-10 h-12 border border-gray-200 shadow-none text-slate-900 bg-white placeholder:text-gray-400 text-center text-2xl tracking-widest font-mono"
                required
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => navigate(`/admin-2fa-setup?email=${encodeURIComponent(formData.email)}`)}
              className="w-full text-center text-sm text-purple-600 hover:text-purple-800 underline mt-2"
            >
              Need to setup 2FA? Click here
            </button>
          </>
        )}
      </div>
      <Button type="submit" className="w-full h-12 bg-primary hover:bg-green-700 focus:ring-2 focus:ring-green-400 text-white" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>
      </form>
    </>
  );
}