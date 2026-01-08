import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, CheckCircle2, Copy } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function Admin2FASetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [passwordPin, setPasswordPin] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [fromLogin, setFromLogin] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const fromLoginParam = searchParams.get('fromLogin');
    if (emailParam) {
      setEmail(emailParam);
    }
    if (fromLoginParam === 'true') {
      setFromLogin(true);
    }
  }, [searchParams]);

  const handleSetup2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passwordPin) {
      toast.error('Please provide email and password PIN');
      return;
    }

    if (!/^[0-9]{6}$/.test(passwordPin)) {
      toast.error('Password PIN must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/admin-2fa/setup-2fa`, {
        email,
        passwordPin,
      });

      if (response.data.success) {
        setQrCodeUrl(response.data.qrCodeDataURL);
        setManualKey(response.data.manualEntryKey);
        setStep('verify');
        toast.success('Scan the QR code with your authenticator app');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to setup 2FA';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken) {
      toast.error('Please enter the verification code');
      return;
    }

    if (!/^[0-9]{6}$/.test(verificationToken)) {
      toast.error('Verification code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/admin-2fa/verify-2fa`, {
        email,
        passwordPin,
        token: verificationToken,
      });

      if (response.data.success) {
        setSetupComplete(true);
        toast.success('2FA enabled successfully! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">2FA Setup Complete!</CardTitle>
            <CardDescription>
              Your account is now secured with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Redirecting to login page...
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border border-gray-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Admin 2FA Setup</CardTitle>
              <CardDescription>
                Secure your admin account with two-factor authentication
              </CardDescription>
            </div>
          </div>
          {fromLogin && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>2FA Required:</strong> Two-factor authentication is mandatory for all admin accounts.
                Please complete the setup below to access your account.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {step === 'setup' ? (
            <form onSubmit={handleSetup2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zeusodx.com"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordPin">Password PIN</Label>
                <Input
                  id="passwordPin"
                  type="password"
                  value={passwordPin}
                  onChange={(e) => setPasswordPin(e.target.value)}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="h-12"
                  required
                />
                <p className="text-sm text-gray-500">Enter your 6-digit password PIN</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Setup 2FA'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Step 1: Scan QR Code</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-64 h-64" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Manual Entry Key</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Can't scan the QR code? Enter this key manually in your authenticator app:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono">
                    {manualKey}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(manualKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationToken">Verification Code</Label>
                  <Input
                    id="verificationToken"
                    type="text"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="h-12 text-center text-2xl tracking-widest font-mono"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('setup');
                      setQrCodeUrl('');
                      setManualKey('');
                      setVerificationToken('');
                    }}
                    className="flex-1 h-12"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
