'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { ScreenLayout, MainContent, Footer, Header, Card, Button, Heading, Text, FormField, Input, ErrorMessage, Modal, ModalActions } from '../ui';
import { authService } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../lib/constants';
import { validatePassword, navigateTo } from '../../lib/utils';

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear errors when user types
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await authService.signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
          return;
        }
        navigateTo(ROUTES.HOME);
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          setError(ERROR_MESSAGES.AUTH.PASSWORDS_DONT_MATCH);
          return;
        }
        
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0]);
          return;
        }

        const { data, error } = await authService.signUp(
          formData.email,
          formData.password,
          { name: formData.name }
        );
        
        if (error) {
          setError(error.message);
          return;
        }

        // Check if email confirmation is required
        if (!data.session) {
          setError(null);
          alert(SUCCESS_MESSAGES.AUTH.EMAIL_CONFIRMATION_SENT);
          return;
        }
        
        navigateTo(ROUTES.ONBOARDING.FAMILY);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting Google OAuth...');
      console.log('Environment check:', {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        currentUrl: window.location.origin
      });
      
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        console.error('❌ Google OAuth error:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        let userFriendlyMessage = 'Der opstod en fejl ved login med Google';
        
        if (error.message.includes('popup')) {
          userFriendlyMessage = 'Popup blev blokeret. Tillad popups og prøv igen.';
        } else if (error.message.includes('redirect')) {
          userFriendlyMessage = 'OAuth redirect fejl. Tjek Google Console konfiguration.';
        } else if (error.message.includes('unauthorized')) {
          userFriendlyMessage = 'Ikke autoriseret. Tjek Google OAuth setup.';
        } else if (error.message.includes('network')) {
          userFriendlyMessage = 'Netværksfejl. Tjek din internetforbindelse.';
        }
        
        setError(`${userFriendlyMessage} (${error.message})`);
        return;
      }
      
      console.log('✅ Google OAuth initiated successfully:', {
        url: data?.url,
        provider: data?.provider
      });
      
      // OAuth will redirect automatically, no need to handle success here
    } catch (err: any) {
      console.error('💥 Google OAuth exception:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        fullError: err
      });
      
      let userFriendlyMessage = 'Der opstod en uventet fejl ved Google login';
      
      if (err?.message?.includes('popup')) {
        userFriendlyMessage = 'Browser blokerede popup vindue. Tillad popups og prøv igen.';
      } else if (err?.name === 'TypeError') {
        userFriendlyMessage = 'Konfigurationsfejl. Tjek environment variables.';
      }
      
      setError(`${userFriendlyMessage}. Se browser console for detaljer.`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await authService.resetPassword(resetEmail);
      if (error) {
        setError(error.message);
      } else {
        alert(`${SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_SENT.replace('instruktioner', `instruktioner til ${resetEmail}`)}`);
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (err) {
      setError(ERROR_MESSAGES.GENERIC.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <Header subtitle="Skab magiske historier for dine børn" />

      <MainContent>
        <Card padding="base" className="space-y-6">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log ind
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Opret konto
            </button>
          </div>

          {/* Error message */}
          {error && (
            <ErrorMessage 
              message={error} 
              type="error"
              onDismiss={() => setError(null)}
              dismissLabel="OK"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Navn felt - kun ved registrering */}
            {!isLogin && (
              <FormField label="Fulde navn" required>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User className="h-5 w-5" />}
                  placeholder="Indtast dit navn"
                />
              </FormField>
            )}

            {/* Email felt */}
            <FormField label="Email" required>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                icon={<Mail className="h-5 w-5" />}
                placeholder="din@email.dk"
              />
            </FormField>

            {/* Password felt */}
            <FormField label="Adgangskode" required>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  icon={<Lock className="h-5 w-5" />}
                  placeholder="Mindst 6 tegn"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Bekræft password - kun ved registrering */}
            {!isLogin && (
              <FormField label="Bekræft adgangskode" required>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  icon={<Lock className="h-5 w-5" />}
                  placeholder="Gentag din adgangskode"
                />
              </FormField>
            )}

            {/* Submit knap */}
            <Button
              type="submit"
              className="w-full"
              size="base"
              disabled={loading}
            >
              {loading ? 'Indlæser...' : (isLogin ? 'Log ind' : 'Opret konto')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Eller</span>
            </div>
          </div>

          {/* Social login knapper */}
          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Indlæser...' : 'Fortsæt med Google'}
            </button>
          </div>

          {/* Terms og Privacy */}
          {!isLogin && (
            <Text size="xs" color="secondary" align="center" className="leading-relaxed">
              Ved at oprette en konto accepterer du vores{' '}
              <a href="#" className="text-purple-600 hover:underline">Vilkår og Betingelser</a>
              {' '}og{' '}
              <a href="#" className="text-purple-600 hover:underline">Privatlivspolitik</a>
            </Text>
          )}
        </Card>
      </MainContent>

      <Footer>
        {/* Forgot password link for login */}
        {isLogin && (
          <div className="text-center">
            <Button 
              variant="ghost"
              onClick={() => setShowForgotPassword(true)}
              size="sm"
            >
              Glemt din adgangskode?
            </Button>
          </div>
        )}
      </Footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPassword}
        onClose={() => {
          setShowForgotPassword(false);
          setResetEmail('');
        }}
        title="Nulstil adgangskode"
        size="base"
      >
        <Text color="secondary" className="mb-6">
          Indtast din email, så sender vi dig instruktioner til at nulstille din adgangskode.
        </Text>
        
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <FormField label="Email" required>
            <Input
              id="resetEmail"
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              icon={<Mail className="h-5 w-5" />}
              placeholder="din@email.dk"
            />
          </FormField>

          <ModalActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
              }}
              className="flex-1"
            >
              Annuller
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Send email
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </ScreenLayout>
  );
}