'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { ScreenLayout, MainContent, Footer, Header, Card, Button, Heading, Text } from '../ui';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementer login/registrering logik
    console.log('Form submitted:', formData);
    
    if (isLogin) {
      // Login - gå direkt til home
      window.location.href = '/home';
    } else {
      // Registrering - gå til onboarding
      window.location.href = '/onboarding';
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementer forgot password logik
    console.log('Reset password for:', resetEmail);
    alert(`Vi har sendt en email til ${resetEmail} med instruktioner til at nulstille din adgangskode.`);
    setShowForgotPassword(false);
    setResetEmail('');
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Navn felt - kun ved registrering */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Fulde navn
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Indtast dit navn"
                  />
                </div>
              </div>
            )}

            {/* Email felt */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="din@email.dk"
                />
              </div>
            </div>

            {/* Password felt */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Adgangskode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Mindst 6 tegn"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Bekræft password - kun ved registrering */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Bekræft adgangskode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Gentag din adgangskode"
                  />
                </div>
              </div>
            )}

            {/* Submit knap */}
            <Button
              type="submit"
              className="w-full"
              size="base"
            >
              {isLogin ? 'Log ind' : 'Opret konto'}
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
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Fortsæt med Google
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
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <Card padding="base" className="w-full max-w-md">
            <Heading level={2} className="mb-4">Nulstil adgangskode</Heading>
            <Text color="secondary" className="mb-6">
              Indtast din email, så sender vi dig instruktioner til at nulstille din adgangskode.
            </Text>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="din@email.dk"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
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
                  className="flex-1"
                >
                  Send email
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </ScreenLayout>
  );
}