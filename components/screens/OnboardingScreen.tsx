'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Camera, Upload, Loader2 } from 'lucide-react';
import { ScreenLayout, MainContent, Footer, Header, Card, ProgressBar, Button, Heading, Text } from '../ui';
import { buildAvatarPrompt, getFallbackAvatar, getHairDescription, getFacialHairDescription, getSkinTone, getEyeColor, getOtherFeatures } from '../../lib/avatarUtils';

const RELATION_OPTIONS = [
  { id: 'far', label: 'Far', gender: 'male' },
  { id: 'mor', label: 'Mor', gender: 'female' },
  { id: 'farfar', label: 'Farfar', gender: 'male' },
  { id: 'farmor', label: 'Farmor', gender: 'female' },
  { id: 'morfar', label: 'Morfar', gender: 'male' },
  { id: 'mormor', label: 'Mormor', gender: 'female' }
];

const HAIR_COLORS = [
  { id: 'brown', label: 'Brun', color: '#8B4513' },
  { id: 'blonde', label: 'Blond', color: '#F4D03F' },
  { id: 'black', label: 'Sort', color: '#2C3E50' },
  { id: 'red', label: 'Rød', color: '#E74C3C' },
  { id: 'gray', label: 'Grå', color: '#95A5A6' },
  { id: 'white', label: 'Hvid', color: '#FFFFFF' }
];

const FEATURES = [
  { id: 'glasses', label: 'Briller', emoji: '👓' },
  { id: 'beard', label: 'Skæg', emoji: '🧔' },
  { id: 'bald', label: 'Skaldet', emoji: '👨‍🦲' }
];

const AVATAR_COLORS = [
  '#f5f0d4', // gul (Eventyr)
  '#e8d4f0', // lilla/pink (Venskab)
  '#d4e4f0', // blå/grå (Magisk)
  '#d4e4f0', // mint grøn (Natur)
  '#d4e4f0', // lys blå (Rummet)
  '#f0e4d4'  // fersken/orange (Dyr)
];

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  hairColor: string;
  features: string[];
  avatarUrl: string;
  color: string;
}

interface ModalData {
  name: string;
  relation: string;
  hairColor: string;
  features: string[];
}

type AvatarTab = 'photo' | 'custom';

export default function OnboardingScreen() {
  const getRandomColor = (usedColors: string[]) => {
    const availableColors = AVATAR_COLORS.filter(color => !usedColors.includes(color));
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Emil',
      relation: 'far',
      hairColor: 'brown',
      features: [],
      avatarUrl: 'https://v3.fal.media/files/rabbit/oMLaHg9ZF7RgpddpWRQ0C.png',
      color: getRandomColor([])
    }
  ]);

  const [usedColors, setUsedColors] = useState<string[]>([familyMembers[0]?.color || '']);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AvatarTab>('photo');
  const [modalData, setModalData] = useState<ModalData>({
    name: '',
    relation: '',
    hairColor: '',
    features: []
  });
  
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Tjek om videoRef er initialiseret når komponenten mountes
    console.log('Component mounted, videoRef:', videoRef.current);
  }, []);

  const handleAddPerson = () => {
    setShowModal(true);
    setActiveTab('photo');
    setAvatarError(null);
    setRetryCount(0);
    setCapturedImage(null);
    setShowCamera(false);
    setIsStartingCamera(false);
  };

  const handleRemoveMember = (id: string) => {
    const memberToRemove = familyMembers.find(m => m.id === id);
    if (memberToRemove) {
      setUsedColors(prev => prev.filter(color => color !== memberToRemove.color));
    }
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
  };

  const startCamera = async () => {
    setIsStartingCamera(true);
    setAvatarError(null);
    
    console.log('Starter kamera...');
    console.log('Video ref status:', {
      current: videoRef.current,
      tagName: videoRef.current?.tagName,
      id: videoRef.current?.id,
      className: videoRef.current?.className
    });
    
    // Først sæt showCamera til true for at rendere video elementet
    if (!showCamera) {
      setShowCamera(true);
      // Vent på at komponenten re-renderes
      setTimeout(() => {
        startCameraWithRef();
      }, 100);
      return;
    }
    
    await startCameraWithRef();
  };

  const startCameraWithRef = async () => {
    try {
      // Tjek først om getUserMedia er tilgængelig
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia er ikke tilgængelig i denne browser');
      }
      
      // Tjek om videoRef er klar efter rendering
      if (!videoRef.current) {
        console.log('Video ref ikke klar efter rendering, venter...');
        // Vent lidt mere og prøv igen
        await new Promise(resolve => setTimeout(resolve, 200));
        if (!videoRef.current) {
          throw new Error('Video element ikke fundet - ref ikke initialiseret efter rendering');
        }
      }
      
      console.log('Anmoder om kamera tilladelse...');
      
      // Prøv først med detaljeret konfiguration
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (detailedError) {
        console.log('Detaljeret konfiguration fejlede, prøver simpel konfiguration:', detailedError);
        // Fallback til simpel konfiguration
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      
      console.log('Kamera tilladelse givet, stream oprettet:', stream);
      
      // Dobbelttjek at videoRef stadig er tilgængelig
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('Video element opdateret, venter på metadata...');
        
        // Vent på at videoen er loaded før vi viser den
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starter afspilning...');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video afspilning startet succesfuldt');
            }).catch((playError) => {
              console.error('Fejl ved video afspilning:', playError);
              setAvatarError('Kunne ikke afspille kamera video. Prøv igen.');
            });
          }
        };
        
        // Error handling for video
        videoRef.current.onerror = (error) => {
          console.error('Video error event:', error);
          setAvatarError('Fejl ved afspilning af kamera. Prøv igen.');
          stopCamera();
        };
        
        // Tjek om videoen faktisk starter
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState === 0) {
            console.log('Video starter ikke, prøver alternativ metode...');
            // Prøv at starte videoen igen
            if (videoRef.current.srcObject) {
              videoRef.current.play().catch(console.error);
            }
          }
        }, 2000);
        
      } else {
        throw new Error('Video element forsvandt under processen');
      }
    } catch (error) {
      console.error('Detaljeret kamera fejl:', error);
      let errorMessage = 'Kunne ikke åbne kamera. Prøv at uploade et billede i stedet.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Kamera tilladelse blev afvist. Tjek din browser indstillinger og giv tilladelse til kamera.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Intet kamera fundet på denne enhed.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Kamera er i brug af en anden app. Luk andre apps der bruger kameraet.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Kamera understøttes ikke i denne browser.';
        } else if (error.message.includes('Video element ikke fundet')) {
          errorMessage = 'Kamera interface ikke klar. Prøv at genindlæse siden.';
        } else {
          errorMessage = `Kamera fejl: ${error.message}`;
        }
      }
      
      setAvatarError(errorMessage);
      setShowCamera(false); // Skjul kamera interface hvis der er fejl
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatarFromPhoto = async (imageDataUrl: string) => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    
    try {
      // Konverter base64 til blob og upload til fal.ai storage
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image-to-image',
          imageFile: imageDataUrl
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.avatarUrl;
      } else {
        throw new Error(result.error || 'Kunne ikke generere avatar');
      }
    } catch (error) {
      console.error('Fejl ved avatar generering:', error);
      throw error;
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const generateCustomAvatar = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    
    try {
      const relationData = RELATION_OPTIONS.find(r => r.id === modalData.relation);
      if (!relationData) throw new Error('Ugyldig relation');
      
      const avatarData = {
        hairDescription: getHairDescription(modalData.hairColor, modalData.features),
        hairColor: modalData.hairColor,
        facialHair: getFacialHairDescription(modalData.features),
        skinTone: getSkinTone(),
        eyeColor: getEyeColor(),
        adultGender: relationData.gender === 'male' ? 'male' : 'female',
        other: getOtherFeatures(modalData.features)
      };
      
      const prompt = buildAvatarPrompt(avatarData);
      
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text-to-image',
          prompt: prompt
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.avatarUrl;
      } else {
        throw new Error(result.error || 'Kunne ikke generere avatar');
      }
    } catch (error) {
      console.error('Fejl ved avatar generering:', error);
      throw error;
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleAvatarGeneration = async () => {
    try {
      let avatarUrl: string;
      
      if (activeTab === 'photo' && capturedImage) {
        avatarUrl = await generateAvatarFromPhoto(capturedImage);
      } else if (activeTab === 'custom') {
        avatarUrl = await generateCustomAvatar();
      } else {
        throw new Error('Manglende data for avatar generering');
      }
      
      // Avatar genereret succesfuldt
      const newColor = getRandomColor(usedColors);
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        ...modalData,
        avatarUrl,
        color: newColor
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setUsedColors(prev => [...prev, newColor]);
      setShowModal(false);
      setModalData({ name: '', relation: '', hairColor: '', features: [] });
      setCapturedImage(null);
      setRetryCount(0);
      
    } catch (error) {
      setAvatarError('Kunne ikke generere avatar. Prøv igen eller gå videre uden avatar.');
      setRetryCount(prev => prev + 1);
    }
  };

  const handleUseFallback = () => {
    const newColor = getRandomColor(usedColors);
    const fallbackAvatar = getFallbackAvatar(modalData.relation);
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      ...modalData,
      avatarUrl: fallbackAvatar,
      color: newColor
    };

    setFamilyMembers(prev => [...prev, newMember]);
    setUsedColors(prev => [...prev, newColor]);
    setShowModal(false);
    setModalData({ name: '', relation: '', hairColor: '', features: [] });
    setCapturedImage(null);
    setAvatarError(null);
    setRetryCount(0);
  };

  const handleModalSubmit = () => {
    if (!modalData.name || !modalData.relation) return;
    
    if (activeTab === 'photo' && !capturedImage) {
      setAvatarError('Du skal tage eller uploade et billede først.');
      return;
    }
    
    if (activeTab === 'custom' && !modalData.hairColor) {
      setAvatarError('Du skal vælge hårfarve først.');
      return;
    }
    
    handleAvatarGeneration();
  };

  const handleNext = () => {
    console.log('Family members:', familyMembers);
    window.location.href = '/onboarding/voice';
  };

  const canProceed = familyMembers.length > 0;

  const progressSteps = [
    { id: 'family', label: 'Familie', status: 'current' as const },
    { id: 'voice', label: 'Stemme', status: 'upcoming' as const },
    { id: 'children', label: 'Børn', status: 'upcoming' as const },
  ];

  return (
    <ScreenLayout>
      <Header size="base" />

      <MainContent>
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar steps={progressSteps} size="base" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <Heading level={2} size="2xl" color="purple" className="mb-1">
            Lad os tilføje din familie
          </Heading>
          <Text color="secondary">
            Tilføj forældre eller bedsteforældre til historierne
          </Text>
        </div>

        {/* Family Grid */}
        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
          {familyMembers.map((member) => (
            <Card 
              key={member.id} 
              padding="sm"
              className="flex flex-col items-center justify-center relative h-full"
              minHeightVariant="gridItem"
              style={{ backgroundColor: member.color }}
            >
              <button 
                onClick={() => handleRemoveMember(member.id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white bg-opacity-60 rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="w-24 h-24 mb-4">
                <img 
                  alt={`${member.name} avatar`} 
                  className="w-full h-full rounded-full object-cover" 
                  src={member.avatarUrl}
                />
              </div>
              <Text weight="bold" size="xl" className="text-slate-700">{member.name}</Text>
              <Text color="secondary" className="capitalize">{RELATION_OPTIONS.find(r => r.id === member.relation)?.label}</Text>
            </Card>
          ))}
          
          {/* Add Person Button */}
          <Card 
            onClick={familyMembers.length < 6 ? handleAddPerson : undefined}
            padding="sm"
            className="flex flex-col items-center justify-center relative border-2 border-dashed h-full"
            minHeightVariant="gridItem"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: familyMembers.length < 6 ? '#d1d5db' : '#e5e7eb',
              opacity: familyMembers.length >= 6 ? 0.5 : 1,
              cursor: familyMembers.length < 6 ? 'pointer' : 'not-allowed'
            }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              familyMembers.length < 6 ? 'bg-purple-400' : 'bg-gray-300'
            }`}>
              <Plus className="h-8 w-8 text-white" />
            </div>
            <Text weight="semibold" className={familyMembers.length < 6 ? 'text-slate-600' : 'text-gray-400'}>
              Tilføj person
            </Text>
            
            {familyMembers.length >= 6 && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Du kan max tilføje 6 personer
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </Card>
        </div>
      </MainContent>

      <Footer>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
          className="w-full"
          variant={canProceed ? "primary" : "secondary"}
        >
          Næste
        </Button>
      </Footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card padding="base" className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Heading level={2} className="mb-4">Tilføj familiemedlem</Heading>
            
            {/* Navn */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Navn</label>
              <input
                type="text"
                value={modalData.name}
                onChange={(e) => setModalData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Indtast navn"
              />
            </div>

            {/* Relation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
              <select
                value={modalData.relation}
                onChange={(e) => setModalData(prev => ({ ...prev, relation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Vælg relation</option>
                {RELATION_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Avatar Tabs */}
            <div className="mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('photo')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'photo'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Tag foto
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'custom'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Custom avatar
                </button>
              </div>
            </div>

            {/* Photo Tab Content */}
            {activeTab === 'photo' && (
              <div className="mb-4">
                {!capturedImage && !showCamera && (
                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="w-full"
                      disabled={isStartingCamera}
                    >
                      {isStartingCamera ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      {isStartingCamera ? 'Indlæser kamera...' : 'Tag billede'}
                    </Button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Vælg fil
                      </Button>
                    </div>
                    
                    {/* Debug knap */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('=== KAMERA DEBUG INFO ===');
                        console.log('navigator.mediaDevices:', navigator.mediaDevices);
                        console.log('getUserMedia tilgængelig:', !!navigator.mediaDevices?.getUserMedia);
                        console.log('Video element:', videoRef.current);
                        console.log('Video element type:', videoRef.current?.tagName);
                        console.log('Video element id:', videoRef.current?.id);
                        console.log('Video element className:', videoRef.current?.className);
                        console.log('Stream ref:', streamRef.current);
                        console.log('Show camera state:', showCamera);
                        console.log('Is starting camera:', isStartingCamera);
                        console.log('Canvas ref:', canvasRef.current);
                        console.log('========================');
                      }}
                      className="w-full text-xs"
                    >
                      🔍 Debug Kamera
                    </Button>
                  </div>
                )}

                {/* Camera Interface */}
                {showCamera && (
                  <div className="space-y-3">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror effect
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Camera overlay */}
                      <div className="absolute inset-0 border-4 border-white border-opacity-50 rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={capturePhoto}
                        className="flex-1"
                      >
                        Tag billede
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1"
                      >
                        Annuller
                      </Button>
                    </div>
                  </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Text size="sm" color="secondary">
                      Billede klar til avatar generering
                    </Text>
                  </div>
                )}
              </div>
            )}

            {/* Custom Tab Content */}
            {activeTab === 'custom' && (
              <>
                {/* Hårfarve */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hårfarve</label>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_COLORS.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setModalData(prev => ({ ...prev, hairColor: color.id }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          modalData.hairColor === color.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <span className="text-xs">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Særlige kendetegn</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FEATURES.map(feature => (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => {
                          setModalData(prev => ({
                            ...prev,
                            features: prev.features.includes(feature.id)
                              ? prev.features.filter(f => f !== feature.id)
                              : [...prev.features, feature.id]
                          }));
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          modalData.features.includes(feature.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{feature.emoji}</div>
                        <span className="text-xs">{feature.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {avatarError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text size="sm" color="error">{avatarError}</Text>
                <div className="flex space-x-2 mt-2">
                  {retryCount < 1 && (
                    <Button
                      size="sm"
                      onClick={handleAvatarGeneration}
                      disabled={isGeneratingAvatar}
                    >
                      Prøv igen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUseFallback}
                  >
                    Gå videre uden
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGeneratingAvatar && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                <Text size="sm" color="primary">Genererer avatar...</Text>
              </div>
            )}

            {/* Modal buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setModalData({ name: '', relation: '', hairColor: '', features: [] });
                  setCapturedImage(null);
                  setAvatarError(null);
                  setRetryCount(0);
                  setIsStartingCamera(false);
                  stopCamera();
                }}
                className="flex-1"
              >
                Annuller
              </Button>
              <Button
                onClick={handleModalSubmit}
                disabled={!modalData.name || !modalData.relation || isGeneratingAvatar || 
                         (activeTab === 'photo' && !capturedImage) ||
                         (activeTab === 'custom' && !modalData.hairColor)}
                className="flex-1"
              >
                {isGeneratingAvatar ? 'Genererer...' : 'Tilføj'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </ScreenLayout>
  );
}