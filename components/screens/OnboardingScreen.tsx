'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Camera, Upload, Loader2, Info } from 'lucide-react';
import { ScreenLayout, MainContent, Footer, Header, Card, ProgressBar, Button, Heading, Text, Modal, ModalActions, FamilyMemberCard, ErrorMessage, LoadingMessage, FormField, Input, Select, theme } from '../ui';
import { buildAvatarPrompt, getFallbackAvatar, getHairDescription, getFacialHairDescription, getSkinTone, getEyeColor, getOtherFeatures } from '../../lib/avatarUtils';
import { getRandomColor, navigateTo } from '../../lib/utils';
import { RELATION_OPTIONS, HAIR_COLORS, AVATAR_FEATURES, HAIR_LENGTHS, HAIR_STRUCTURES, FACIAL_HAIR_OPTIONS, SKIN_TONES, EYE_COLORS, OTHER_FEATURES, ROUTES, ERROR_MESSAGES, AGE_LIMITS } from '../../lib/constants';





interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  hairColor: string;
  features: string[];
  avatarUrl: string;
  color: string;
  avatarGenerationCount: number;
}

interface ModalData {
  name: string;
  relation: string;
  age: string;
  hairColor: string;
  hairLength: string;
  hairStructure: string;
  facialHair: string;
  skinTone: string;
  eyeColor: string;
  features: string[];
  other: string[];
}

type AvatarStep = 'none' | 'choice' | 'photo' | 'custom' | 'preview' | 'completed';
type CustomStep = 'hair_length' | 'hair_color' | 'hair_structure' | 'facial_hair' | 'skin_tone' | 'eye_color' | 'other';

export default function OnboardingScreen() {

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [avatarStep, setAvatarStep] = useState<AvatarStep>('none');
  const [customStep, setCustomStep] = useState<CustomStep>('hair_length');
  const [modalData, setModalData] = useState<ModalData>({
    name: '',
    relation: '',
    age: '',
    hairColor: '',
    hairLength: '',
    hairStructure: '',
    facialHair: '',
    skinTone: '',
    eyeColor: '',
    features: [],
    other: []
  });
  
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [previewAvatars, setPreviewAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
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
    setIsEditMode(false);
    setEditingMemberId(null);
    setShowModal(true);
    setAvatarStep('none');
    setCustomStep('hair_length');
    setAvatarError(null);
    setRetryCount(0);
    setCapturedImage(null);
    setShowCamera(false);
    setIsStartingCamera(false);
    setPreviewAvatars([]);
    setSelectedAvatar(null);
    setShowAvatarPreview(false);
    setShowTooltip(false);
  };

  const handleEditMember = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    if (member) {
      setIsEditMode(true);
      setEditingMemberId(id);
      setModalData({
        name: member.name,
        relation: member.relation,
        age: '', // Age not stored in current member interface
        hairColor: '',
        hairLength: '',
        hairStructure: '',
        facialHair: '',
        skinTone: '',
        eyeColor: '',
        features: [],
        other: []
      });
      setAvatarStep('none');
      setCustomStep('hair_length');
      setShowModal(true);
    }
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
      
      // Build proper hair description with English translations
      let hairDescription = '';
      if (modalData.hairLength === 'bald') {
        hairDescription = 'completely bald head, no hair, smooth scalp';
      } else if (modalData.hairLength === 'sparse') {
        hairDescription = 'buzz cut, very short military-style haircut, 2-3mm length, evenly trimmed all over head, crew cut style';
      } else if (modalData.hairLength && modalData.hairStructure) {
        // Translate hair length to English
        const lengthMap: {[key: string]: string} = {
          'short': 'short',
          'medium': 'medium-length', 
          'long': 'long'
        };
        
        // Translate hair structure to English
        const structureMap: {[key: string]: string} = {
          'straight': 'straight',
          'wavy': 'wavy',
          'curly': 'curly',
          'braid': 'braided',
          'ponytail': 'in ponytail'
        };
        
        const lengthEn = lengthMap[modalData.hairLength] || modalData.hairLength;
        const structureEn = structureMap[modalData.hairStructure] || modalData.hairStructure;
        hairDescription = `${lengthEn} ${structureEn} hair`;
      } else if (modalData.hairLength) {
        // Just hair length
        const lengthMap: {[key: string]: string} = {
          'short': 'short',
          'medium': 'medium-length',
          'long': 'long'
        };
        const lengthEn = lengthMap[modalData.hairLength] || modalData.hairLength;
        hairDescription = `${lengthEn} hair`;
      }

      // Build proper facial hair description with soft, natural styling
      let facialHairDescription = '';
      if (modalData.facialHair === 'none') {
        facialHairDescription = 'clean shaven, smooth face, no facial hair';
      } else if (modalData.facialHair === 'mustache') {
        facialHairDescription = 'soft natural mustache with rounded edges, well-groomed, gentle curves';
      } else if (modalData.facialHair === 'beard') {
        facialHairDescription = 'full natural beard with soft rounded edges, fluffy texture, well-maintained, no sharp lines';
      } else if (modalData.facialHair === 'goatee') {
        facialHairDescription = 'small neat goatee with natural soft rounded edges, gentle contours';
      } else if (modalData.facialHair === 'stubble') {
        facialHairDescription = 'light natural stubble with soft appearance, random growth pattern';
      }

      const avatarData = {
        hair_description: hairDescription,
        hair_color: modalData.hairColor,
        facial_hair: facialHairDescription,
        skin_tone: modalData.skinTone,
        eye_color: modalData.eyeColor,
        adult_gender: relationData.gender === 'male' ? 'male' : 'female',
        age: modalData.age,
        other: modalData.other.join(', ')
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

  const handleGenerateAvatarPreviews = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    setPreviewAvatars([]);
    
    try {
      const promises = [];
      
      // Generer 3 avatars parallelt
      for (let i = 0; i < 3; i++) {
        if (avatarStep === 'photo' && capturedImage) {
          promises.push(generateAvatarFromPhoto(capturedImage));
        } else if (avatarStep === 'custom') {
          promises.push(generateCustomAvatar());
        }
      }
      
      const avatarUrls = await Promise.all(promises);
      setPreviewAvatars(avatarUrls);
      setAvatarStep('preview');
      
    } catch (error) {
      console.error('Fejl ved avatar preview generering:', error);
      setAvatarError('Kunne ikke generere avatar previews. Prøv igen.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setAvatarStep('completed');
  };

  const handleCustomStepNext = () => {
    // This function is now only used for "Spring over" buttons
    const stepOrder: CustomStep[] = ['hair_length', 'hair_color', 'hair_structure', 'facial_hair', 'skin_tone', 'eye_color', 'other'];
    const currentIndex = stepOrder.indexOf(customStep);
    
    // Simple navigation for skip buttons
    if (currentIndex < stepOrder.length - 1) {
      setCustomStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleCustomStepBack = () => {
    const stepOrder: CustomStep[] = ['hair_length', 'hair_color', 'hair_structure', 'facial_hair', 'skin_tone', 'eye_color', 'other'];
    const currentIndex = stepOrder.indexOf(customStep);
    
    // Special back logic for facial_hair
    if (customStep === 'facial_hair') {
      if (modalData.hairLength === 'bald') {
        // Fra skæg tilbage til hårlængde (for skaldet)
        setCustomStep('hair_length');
        return;
      } else if (modalData.hairLength === 'sparse') {
        // Fra skæg tilbage til hårfarve (for karse)
        setCustomStep('hair_color');
        return;
      } else {
        // Normal tilbage til hårstruktur
        setCustomStep('hair_structure');
        return;
      }
    }
    
    // Special back logic for hair_color
    if (customStep === 'hair_color') {
      setCustomStep('hair_length');
      return;
    }
    
    // Special back logic for hair_structure  
    if (customStep === 'hair_structure') {
      setCustomStep('hair_color');
      return;
    }
    
    // For all other steps, just go to previous step
    if (currentIndex > 0) {
      setCustomStep(stepOrder[currentIndex - 1]);
    } else {
      setAvatarStep('choice');
    }
  };

  const handleAddPersonWithAvatar = () => {
    if (!selectedAvatar) return;
    
    if (isEditMode && editingMemberId) {
      // Edit mode - update existing member and increment counter
      setFamilyMembers(prev => prev.map(member => 
        member.id === editingMemberId 
          ? { 
              ...member, 
              name: modalData.name, 
              relation: modalData.relation,
              avatarUrl: selectedAvatar,
              avatarGenerationCount: member.avatarGenerationCount + 1
            }
          : member
      ));
    } else {
      // Add mode - create new member
      const newColor = getRandomColor(usedColors);
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        ...modalData,
        avatarUrl: selectedAvatar,
        color: newColor,
        avatarGenerationCount: 1
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setUsedColors(prev => [...prev, newColor]);
    }
    
    // Reset all states
    setShowModal(false);
    setIsEditMode(false);
    setEditingMemberId(null);
    setAvatarStep('none');
    setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
    setCapturedImage(null);
    setRetryCount(0);
    setPreviewAvatars([]);
    setSelectedAvatar(null);
    setShowAvatarPreview(false);
    setShowTooltip(false);
  };

  const handleAvatarGeneration = async (isEdit = false) => {
    try {
      let avatarUrl: string;
      
      if (activeTab === 'photo' && capturedImage) {
        avatarUrl = await generateAvatarFromPhoto(capturedImage);
      } else if (activeTab === 'custom') {
        avatarUrl = await generateCustomAvatar();
      } else {
        throw new Error('Manglende data for avatar generering');
      }
      
      if (isEdit && editingMemberId) {
        // Edit mode - update existing member and increment counter
        setFamilyMembers(prev => prev.map(member => 
          member.id === editingMemberId 
            ? { 
                ...member, 
                name: modalData.name, 
                relation: modalData.relation,
                avatarUrl,
                avatarGenerationCount: member.avatarGenerationCount + 1
              }
            : member
        ));
      } else {
        // Add mode - create new member
        const newColor = getRandomColor(usedColors);
        const newMember: FamilyMember = {
          id: Date.now().toString(),
          ...modalData,
          avatarUrl,
          color: newColor,
          avatarGenerationCount: 1
        };

        setFamilyMembers(prev => [...prev, newMember]);
        setUsedColors(prev => [...prev, newColor]);
      }
      
      setShowModal(false);
      setIsEditMode(false);
      setEditingMemberId(null);
      setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
      setCapturedImage(null);
      setRetryCount(0);
      
    } catch (error) {
      console.warn('Avatar generering fejlede, bruger fallback:', error);
      
      // Automatisk fallback til standard avatar
      const newColor = getRandomColor(usedColors);
      const fallbackAvatar = getFallbackAvatar(modalData.relation);
      
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        ...modalData,
        avatarUrl: fallbackAvatar,
        color: newColor,
        avatarGenerationCount: 1
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setUsedColors(prev => [...prev, newColor]);
      setShowModal(false);
      setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
      setCapturedImage(null);
      setRetryCount(0);
    }
  };

  const handleUseFallback = () => {
    const newColor = getRandomColor(usedColors);
    const fallbackAvatar = getFallbackAvatar(modalData.relation);
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      ...modalData,
      avatarUrl: fallbackAvatar,
      color: newColor,
      avatarGenerationCount: 0
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
    
    // If we have a selected avatar, add the person
    if (selectedAvatar && avatarStep === 'completed') {
      handleAddPersonWithAvatar();
      return;
    }
    
    // If in edit mode and just updating basic info (no avatar changes)
    if (isEditMode && avatarStep === 'none') {
      setFamilyMembers(prev => prev.map(member => 
        member.id === editingMemberId 
          ? { ...member, name: modalData.name, relation: modalData.relation }
          : member
      ));
      setShowModal(false);
      setIsEditMode(false);
      setEditingMemberId(null);
      setAvatarStep('none');
      setCustomStep('hair_length');
      setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
      return;
    }
    
    // For add mode without avatar - use fallback avatar
    if (!isEditMode && avatarStep === 'none') {
      const newColor = getRandomColor(usedColors);
      const fallbackAvatar = getFallbackAvatar(modalData.relation);
      
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        ...modalData,
        avatarUrl: fallbackAvatar,
        color: newColor,
        avatarGenerationCount: 0
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setUsedColors(prev => [...prev, newColor]);
      
      // Reset all states
      setShowModal(false);
      setIsEditMode(false);
      setEditingMemberId(null);
      setAvatarStep('none');
      setCustomStep('hair_length');
      setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
      setCapturedImage(null);
      setRetryCount(0);
      setPreviewAvatars([]);
      setSelectedAvatar(null);
      setShowAvatarPreview(false);
      setShowTooltip(false);
      return;
    }
  };

  const handleNext = () => {
    console.log('Family members:', familyMembers);
    navigateTo('/onboarding/voice');
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
          <Text color="secondary" className="text-center">
            Tilføj personer, som du senere har mulighed for at inddrage i dine historier
          </Text>
        </div>

        {/* Family Grid */}
        <div className={`grid grid-cols-2 gap-4 ${familyMembers.length > 0 ? 'auto-rows-fr mb-8' : 'mb-4'}`}>
          {familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onRemove={handleRemoveMember}
              onEdit={handleEditMember}
              relationOptions={RELATION_OPTIONS}
            />
          ))}
          
          {/* Add Person Button */}
          <Card 
            onClick={familyMembers.length < AGE_LIMITS.MAX_FAMILY_MEMBERS ? handleAddPerson : undefined}
            padding="sm"
            className="flex flex-col items-center justify-center relative border-2 border-dashed h-full"
            minHeightVariant="gridItem"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: familyMembers.length < AGE_LIMITS.MAX_FAMILY_MEMBERS ? '#d1d5db' : '#e5e7eb',
              opacity: familyMembers.length >= AGE_LIMITS.MAX_FAMILY_MEMBERS ? 0.5 : 1,
              cursor: familyMembers.length < AGE_LIMITS.MAX_FAMILY_MEMBERS ? 'pointer' : 'not-allowed'
            }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              familyMembers.length < AGE_LIMITS.MAX_FAMILY_MEMBERS ? 'bg-purple-400' : 'bg-gray-300'
            }`}>
              <Plus className="h-8 w-8 text-white" />
            </div>
            <Text weight="semibold" className={familyMembers.length < AGE_LIMITS.MAX_FAMILY_MEMBERS ? 'text-slate-600' : 'text-gray-400'}>
              Tilføj person
            </Text>
            
            {familyMembers.length >= AGE_LIMITS.MAX_FAMILY_MEMBERS && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Du kan max tilføje {AGE_LIMITS.MAX_FAMILY_MEMBERS} personer
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
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setIsEditMode(false);
          setEditingMemberId(null);
          setAvatarStep('none');
          setCustomStep('hair_length');
          setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
          setCapturedImage(null);
          setAvatarError(null);
          setRetryCount(0);
          setIsStartingCamera(false);
          setPreviewAvatars([]);
          setSelectedAvatar(null);
          setShowAvatarPreview(false);
          setShowTooltip(false);
          stopCamera();
        }}
        title={isEditMode ? "Rediger familiemedlem" : "Tilføj familiemedlem"}
        size="base"
      >
            
            {/* Navn */}
            <FormField label="Navn" required className="mb-4">
              <Input
                type="text"
                value={modalData.name}
                onChange={(e) => setModalData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Indtast navn"
              />
            </FormField>

            {/* Relation */}
            <FormField label="Relation" required className="mb-4">
              <Select
                value={modalData.relation}
                onChange={(e) => setModalData(prev => ({ ...prev, relation: e.target.value }))}
                options={RELATION_OPTIONS.map(option => ({ value: option.id, label: option.label }))}
                placeholder="Vælg relation"
              />
            </FormField>

            {/* Alder */}
            <FormField label="Alder" required className="mb-4">
              <Input
                type="number"
                min="18"
                max="100"
                value={modalData.age}
                onChange={(e) => setModalData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="F.eks. 35"
              />
            </FormField>

            {/* Avatar Section */}
            <FormField className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-sm font-medium text-gray-700">Avatar</label>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg z-10 max-w-xs">
                      <div className="text-center">
                        Avataren hjælper dit barn med at genkende familiemedlemmerne i historierne. Bare rolig, det er ikke nødvendigt - har du ikke lyst, bruger vi en standard avatar i stedet.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
              {avatarStep === 'none' && (
                <Button
                  variant="outline"
                  onClick={() => setAvatarStep('choice')}
                  className="w-full"
                >
                  Lav en avatar
                </Button>
              )}

              {avatarStep === 'choice' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setAvatarStep('photo')}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Tag billede
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAvatarStep('custom');
                      setCustomStep('hair_length');
                    }}
                    className="w-full"
                  >
                    Byg avatar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarStep('none')}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Tilbage
                  </Button>
                </div>
              )}

              {avatarStep === 'completed' && selectedAvatar && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedAvatar} 
                    alt="Selected avatar"
                    className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAvatarStep('choice')}
                      className="text-xs"
                    >
                      Skift avatar
                    </Button>
                  </div>
                </div>
              )}
            </FormField>

            {/* Avatar generation counter - kun i edit mode */}
            {isEditMode && editingMemberId && (() => {
              const currentMember = familyMembers.find(m => m.id === editingMemberId);
              const remainingGenerations = currentMember ? 3 - currentMember.avatarGenerationCount : 0;
              
              return (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Text size="sm" color="secondary" className="text-center">
                    {remainingGenerations > 0 
                      ? `Du kan generere ${remainingGenerations} flere avatar${remainingGenerations !== 1 ? 'er' : ''}`
                      : 'Du har brugt alle 3 avatar generationer'}
                  </Text>
                </div>
              );
            })()}


            {/* Photo Step Content */}
            {avatarStep === 'photo' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <Text size="sm" weight="medium" color="secondary">Tag billede</Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarStep('choice')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Tilbage
                  </Button>
                </div>
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
                    <Text size="sm" color="secondary" className="mb-3">
                      Billede klar til avatar generering
                    </Text>
                    <Button
                      onClick={handleGenerateAvatarPreviews}
                      disabled={isGeneratingAvatar}
                      loading={isGeneratingAvatar}
                      className="w-full"
                    >
                      Byg min avatar
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Custom Step Content */}
            {avatarStep === 'custom' && (
              <>
                <div className="mb-4">
                  <Text size="sm" weight="medium" color="secondary" className="text-center">
                    Byg avatar ({(() => {
                      const stepOrder: CustomStep[] = ['hair_length', 'hair_color', 'hair_structure', 'facial_hair', 'skin_tone', 'eye_color', 'other'];
                      const currentIndex = stepOrder.indexOf(customStep);
                      const totalSteps = stepOrder.length;
                      return `${currentIndex + 1}/${totalSteps}`;
                    })()})
                  </Text>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${(() => {
                          const stepOrder: CustomStep[] = ['hair_length', 'hair_color', 'hair_structure', 'facial_hair', 'skin_tone', 'eye_color', 'other'];
                          const currentIndex = stepOrder.indexOf(customStep);
                          return ((currentIndex + 1) / stepOrder.length) * 100;
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
                {/* Hair Length Step */}
                {customStep === 'hair_length' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg hårlængde</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HAIR_LENGTHS.map(length => {
                        const relationData = RELATION_OPTIONS.find(r => r.id === modalData.relation);
                        const isGenderMale = relationData?.gender === 'male';
                        const emoji = isGenderMale ? length.male_emoji : length.female_emoji;
                        
                        return (
                          <button
                            key={length.id}
                            type="button"
                            onClick={() => {
                              setModalData(prev => ({ 
                                ...prev, 
                                hairLength: length.id,
                                // Reset hair related fields if bald or sparse
                                hairColor: ['bald', 'sparse'].includes(length.id) ? '' : prev.hairColor,
                                hairStructure: ['bald', 'sparse'].includes(length.id) ? '' : prev.hairStructure
                              }));
                              
                              // Navigation logic based on selection
                              if (length.id === 'bald') {
                                // Skaldet - hop direkte til skæg
                                setCustomStep('facial_hair');
                              } else if (length.id === 'sparse') {
                                // Karse - gå til hårfarve
                                setCustomStep('hair_color');
                              } else {
                                // Alle andre - normal flow til hårfarve
                                setCustomStep('hair_color');
                              }
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              modalData.hairLength === length.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{emoji}</div>
                            <span className="text-xs">{length.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hair Color Step */}
                {customStep === 'hair_color' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg hårfarve</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HAIR_COLORS.map(color => {
                        const relationData = RELATION_OPTIONS.find(r => r.id === modalData.relation);
                        const isGenderMale = relationData?.gender === 'male';
                        const emoji = isGenderMale ? color.male_emoji : color.female_emoji;
                        
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              setModalData(prev => ({ ...prev, hairColor: color.id }));
                              
                              // Navigation logic based on hair length
                              if (modalData.hairLength === 'sparse') {
                                // Karse - spring hårstruktur over, gå til skæg
                                setCustomStep('facial_hair');
                              } else {
                                // Alle andre - normal flow til hårstruktur
                                setCustomStep('hair_structure');
                              }
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              modalData.hairColor === color.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{emoji}</div>
                            <span className="text-xs">{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hair Structure Step */}
                {customStep === 'hair_structure' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg hårstruktur</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HAIR_STRUCTURES.map(structure => {
                        const relationData = RELATION_OPTIONS.find(r => r.id === modalData.relation);
                        const isGenderMale = relationData?.gender === 'male';
                        const emoji = isGenderMale ? structure.male_emoji : structure.female_emoji;
                        
                        return (
                          <button
                            key={structure.id}
                            type="button"
                            onClick={() => {
                              setModalData(prev => ({ ...prev, hairStructure: structure.id }));
                              setCustomStep('facial_hair');
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              modalData.hairStructure === structure.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{emoji}</div>
                            <span className="text-xs">{structure.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Facial Hair Step */}
                {customStep === 'facial_hair' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg skæg</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FACIAL_HAIR_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setModalData(prev => ({ ...prev, facialHair: option.id }));
                            setCustomStep('skin_tone');
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            modalData.facialHair === option.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm">{option.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Skin Tone Step */}
                {customStep === 'skin_tone' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg hudtone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SKIN_TONES.map(tone => {
                        const relationData = RELATION_OPTIONS.find(r => r.id === modalData.relation);
                        const isGenderMale = relationData?.gender === 'male';
                        const emoji = isGenderMale ? tone.male_emoji : tone.female_emoji;
                        
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => {
                              setModalData(prev => ({ ...prev, skinTone: tone.id }));
                              setCustomStep('eye_color');
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              modalData.skinTone === tone.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{emoji}</div>
                            <span className="text-xs">{tone.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Eye Color Step */}
                {customStep === 'eye_color' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Vælg øjenfarve</label>
                    <div className="grid grid-cols-3 gap-2">
                      {EYE_COLORS.map(eye => (
                        <button
                          key={eye.id}
                          type="button"
                          onClick={() => {
                            setModalData(prev => ({ ...prev, eyeColor: eye.id }));
                            setCustomStep('other');
                          }}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            modalData.eyeColor === eye.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full mx-auto mb-1"
                            style={{ backgroundColor: eye.color }}
                          ></div>
                          <span className="text-xs">{eye.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepNext}
                        className="text-xs text-gray-500"
                      >
                        Spring over →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other Features Step */}
                {customStep === 'other' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Andre særlige kendetegn (valgfrit)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {OTHER_FEATURES.map(feature => (
                        <button
                          key={feature.id}
                          type="button"
                          onClick={() => {
                            setModalData(prev => ({
                              ...prev,
                              other: prev.other.includes(feature.id)
                                ? prev.other.filter(f => f !== feature.id)
                                : [...prev.other, feature.id]
                            }));
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            modalData.other.includes(feature.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm">{feature.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCustomStepBack}
                        className="text-xs text-gray-500"
                      >
                        ← Tilbage
                      </Button>
                      <Button
                        onClick={handleGenerateAvatarPreviews}
                        disabled={isGeneratingAvatar}
                        loading={isGeneratingAvatar}
                        size="sm"
                      >
                        Byg min avatar
                      </Button>
                    </div>
                  </div>
                )}


              </>
            )}

            {/* Error Message */}
            {avatarError && (
              <ErrorMessage
                message={avatarError}
                type="error"
                onRetry={retryCount < 1 ? handleAvatarGeneration : undefined}
                onDismiss={handleUseFallback}
                retryLabel="Prøv igen"
                dismissLabel="Gå videre uden"
                className="mb-4"
              />
            )}

            {/* Loading State */}
            {isGeneratingAvatar && (
              <LoadingMessage
                message="Genererer 3 avatar forslag..."
                className="mb-4"
              />
            )}

            {/* Avatar Preview Selection */}
            {avatarStep === 'preview' && previewAvatars.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Vælg den avatar der ligner mest
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {previewAvatars.map((avatarUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAvatar(avatarUrl)}
                      className={`relative p-2 rounded-xl border-2 transition-all ${
                        selectedAvatar === avatarUrl
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={avatarUrl} 
                        alt={`Avatar option ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {selectedAvatar === avatarUrl && (
                        <div className="absolute inset-0 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

        {/* Modal Actions */}
        <ModalActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowModal(false);
              setIsEditMode(false);
              setEditingMemberId(null);
              setAvatarStep('none');
              setCustomStep('hair_length');
              setModalData({ name: '', relation: '', age: '', hairColor: '', hairLength: '', hairStructure: '', facialHair: '', skinTone: '', eyeColor: '', features: [], other: [] });
              setCapturedImage(null);
              setAvatarError(null);
              setRetryCount(0);
              setIsStartingCamera(false);
              setPreviewAvatars([]);
              setSelectedAvatar(null);
              setShowAvatarPreview(false);
              setShowTooltip(false);
              stopCamera();
            }}
            className="flex-1"
          >
            Annuller
          </Button>
          <Button
            onClick={handleModalSubmit}
            disabled={!modalData.name || !modalData.relation || 
                     (!isEditMode && !modalData.age)}
            className="flex-1"
          >
            {(() => {
              if (avatarStep === 'completed' && selectedAvatar) {
                return isEditMode ? 'Gem med ny avatar' : 'Tilføj person';
              }
              
              if (isEditMode && avatarStep === 'none') {
                return 'Gem ændringer';
              }
              
              return 'Tilføj person';
            })()}
          </Button>
        </ModalActions>
      </Modal>
    </ScreenLayout>
  );
}