'use client';

import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Loader2, Check, Volume2 } from 'lucide-react';
import { ScreenLayout, MainContent, Footer, Header, Card, ProgressBar, IconButton, Button, Heading, Text, FormField } from '../ui';

const SAMPLE_TEXT = `Hej med dig! Mit navn er Anna, og jeg elsker at fortælle historier til børn. I dag skal vi rejse til den magiske skov, hvor de mest utrolige eventyr finder sted. 

Dybt inde i skoven, hvor de høje træer rækker mod himlen, bor der mange fantastiske væsener. Der er kloge ugler, der kan tale med alle skovens dyr. Der er små kaniner, der hopper rundt mellem blomsternes farverige kronblade. Og der er venlige bjørne, der samler bær til vinteren.

Solen skinner varmt ned over det grønne græs, mens vi går ad den snoede sti. Fuglene synger deres smukkeste sange højt oppe i trætoppene. Sommerfuglene danser elegant mellem de duftende blomster. Og bækkene risler blødt gennem mosset.

En dag mødte jeg en lille mus ved navn Mikkel. Han var meget ked af det, fordi han havde mistet sin ost. "Vil du hjælpe mig?" spurgte han med tårer i øjnene. Selvfølgelig ville jeg hjælpe ham! Vi ledte overalt i skoven. Under de store sten, mellem de tykke grene, og selv inde i de dybe huler.

Pludselig hørte vi en lyd fra en gammel træstamme. Der sad en stor, grå ræv og gnaskede i sig. "Undskyld," sagde jeg høfligt, "har du måske set en lille ost?" Ræven kiggede op og smilede venligt. "Åh ja," sagde han, "jeg fandt den her til morgen. Jeg troede, den var glemt." Han gav osten tilbage til Mikkel, som blev så glad.

Fra den dag af blev vi alle tre de bedste venner. Vi mødtes hver dag ved den store eg midt i skoven. Vi delte historier, legede gemmeleg, og hjalp hinanden, når der var problemer. Skoven blev til vores eget lille paradis, hvor alt var muligt.

Og hver aften, når solen gik ned bag de høje bjerge, og stjernerne begyndte at tindre på himlen, fortalte vi hinanden de smukkeste eventyr. Om prinsesser og drager, om troldmænd og feer, og om alle de magiske ting, der kan ske, når man tror på det.

Det er sådan, at de bedste venskaber opstår - gennem eventyr, gennem hjælpsomhed, og gennem den tryghed, man finder sammen med dem, man holder allermest af. Og det er sådan, at de smukkeste historier bliver til - når hjertets varme møder fantasiens grænseløse muligheder.`;

const PREVIEW_TEXT = `[Let vind blæser gennem trætoppene...]

Narrator:
Lille Emma gik langsomt gennem den tykke skov... hvor solens stråler flimrede mellem bladene.

[En svag puslen høres i buskene...]

Narrator:
Pludselig hørte hun en lille stemme...

Mikkel:
"Hej Emma!"

Narrator:
Emma kiggede forvirret rundt. Hun så op og fik øje på en lille grå mus, der sad på en gren.

Emma:
"Er det dig, der talte?"

Mikkel:
"Ja! Jeg hedder Mikkel, og jeg har brug for din hjælp..."

Emma:
"Hvad er der galt?"

Mikkel:
"Jeg har mistet min ost! Vil du hjælpe mig med at finde den?"

Emma:
"Selvfølgelig vil jeg hjælpe dig!"

[De to begynder at gå gennem skoven sammen, mens fuglene synger i trætoppene...]

Narrator:
Og sådan begyndte deres magiske eventyr.`;

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading' | 'cloned';

interface ModelResult {
  model_id: string;
  model_name: string;
  audio_data: string;
  voice_id: string;
  audio_segments?: string[];
  segments_info?: { character: string; text: string; type?: string; original?: string }[];
}

export default function VoiceCloningScreen() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [clonedVoiceUrl, setClonedVoiceUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('eleven_turbo_v2_5');
  const [cloningProgress, setCloningProgress] = useState<{[key: string]: string}>({});
  const [useCharacterVoices] = useState<boolean>(true); // Always use character voices in background
  const [currentSegment, setCurrentSegment] = useState<number>(0);
  const [isPlayingCharacters, setIsPlayingCharacters] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const characterAudioRefs = useRef<HTMLAudioElement[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
        setRecordingState('recorded');
        
        // Preload audio to get duration
        if (recordedAudioRef.current) {
          recordedAudioRef.current.src = audioUrl;
          recordedAudioRef.current.onloadedmetadata = () => {
            if (recordedAudioRef.current) {
              setDuration(recordedAudioRef.current.duration || 0);
            }
          };
          recordedAudioRef.current.load();
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Kunne ikke få adgang til mikrofonen. Tjek venligst dine browser-indstillinger.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const retryRecording = () => {
    setRecordingState('idle');
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setClonedVoiceUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlayingRecording(false);
    
    // Clean up audio URLs
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
  };

  const playRecording = () => {
    if (!recordedAudioUrl || !recordedAudioRef.current) return;

    if (isPlayingRecording) {
      recordedAudioRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      // Set up audio source if not already done
      if (recordedAudioRef.current.src !== recordedAudioUrl) {
        recordedAudioRef.current.src = recordedAudioUrl;
        recordedAudioRef.current.load();
      }
      
      // Set up event listeners
      recordedAudioRef.current.onloadedmetadata = () => {
        if (recordedAudioRef.current && recordedAudioRef.current.duration) {
          setDuration(recordedAudioRef.current.duration);
        }
      };

      recordedAudioRef.current.ontimeupdate = () => {
        if (recordedAudioRef.current) {
          setCurrentTime(recordedAudioRef.current.currentTime || 0);
        }
      };

      recordedAudioRef.current.onended = () => {
        setIsPlayingRecording(false);
        if (recordedAudioRef.current) {
          setCurrentTime(recordedAudioRef.current.duration || 0);
        }
      };
      
      // Wait for metadata to load before playing if duration is not set
      if (!duration && recordedAudioRef.current.readyState < 1) {
        recordedAudioRef.current.oncanplay = () => {
          if (recordedAudioRef.current) {
            recordedAudioRef.current.play();
            setIsPlayingRecording(true);
          }
        };
      } else {
        recordedAudioRef.current.play();
        setIsPlayingRecording(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!recordedAudioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    recordedAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playCharacterSequence = async (segments: string[], segmentsInfo: any[]) => {
    if (segments.length === 0) return;
    
    setIsPlayingCharacters(true);
    setCurrentSegment(0);
    
    try {
      for (let i = 0; i < segments.length; i++) {
        setCurrentSegment(i);
        const segmentInfo = segmentsInfo[i];
        
        // Check if this is a sound effect
        if (segmentInfo?.character === 'sound_effect') {
          // Play actual sound effect instead of voice
          await playActualSoundEffect(segmentInfo.original || segmentInfo.text);
        } else if (segments[i] && segments[i].trim()) {
          // Convert base64 to blob and create audio for speech (only if segment has content)
          const audioBlob = new Blob(
            [Uint8Array.from(atob(segments[i]), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          
          // Wait for this segment to finish before playing next
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = reject;
            audio.play();
          });
        }
        
        // Small pause between segments
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error playing character sequence:', error);
    } finally {
      setIsPlayingCharacters(false);
      setCurrentSegment(0);
    }
  };

  const playActualSoundEffect = async (soundDescription: string): Promise<void> => {
    return new Promise((resolve) => {
      // Map sound descriptions to actual sound effects
      const soundEffects: { [key: string]: string } = {
        'Let vind blæser gennem trætoppene': '/sounds/wind_trees.mp3',
        'En svag puslen høres i buskene': '/sounds/rustling_bushes.mp3',
        'De to begynder at gå gennem skoven sammen, mens fuglene synger i trætoppene': '/sounds/forest_walking_birds.mp3',
      };

      const soundFile = soundEffects[soundDescription];
      
      if (soundFile) {
        // Try to play actual sound file
        const audio = new Audio(soundFile);
        audio.onended = () => resolve();
        audio.onerror = () => {
          // Fallback to synthesized sound effect
          synthesizeSoundEffect(soundDescription).then(resolve);
        };
        audio.play().catch(() => {
          // Fallback to synthesized sound effect
          synthesizeSoundEffect(soundDescription).then(resolve);
        });
      } else {
        // Synthesize sound effect
        synthesizeSoundEffect(soundDescription).then(resolve);
      }
    });
  };

  const synthesizeSoundEffect = async (soundDescription: string): Promise<void> => {
    return new Promise((resolve) => {
      // Create simple synthesized sound effects using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (soundDescription.includes('vind')) {
        // Wind sound - white noise with low-pass filter
        createWindSound(audioContext, 2000).then(resolve);
      } else if (soundDescription.includes('puslen') || soundDescription.includes('buske')) {
        // Rustling sound - filtered noise bursts
        createRustlingSound(audioContext, 1500).then(resolve);
      } else if (soundDescription.includes('fugle')) {
        // Bird sounds - high frequency tones
        createBirdSounds(audioContext, 3000).then(resolve);
      } else {
        // Generic ambient sound
        createAmbientSound(audioContext, 1000).then(resolve);
      }
    });
  };

  const createWindSound = async (context: AudioContext, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const bufferSize = context.sampleRate * (duration / 1000);
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink noise for wind
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      filter.type = 'lowpass';
      filter.frequency.value = 200;
      gain.gain.value = 0.3;

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      source.onended = () => resolve();
      source.start();
      
      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      }, duration - 500);
    });
  };

  const createRustlingSound = async (context: AudioContext, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const bufferSize = context.sampleRate * (duration / 1000);
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate burst noise for rustling
      for (let i = 0; i < bufferSize; i++) {
        const burst = Math.sin(i * 0.01) > 0.7 ? 1 : 0;
        data[i] = (Math.random() * 2 - 1) * 0.2 * burst;
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      filter.type = 'highpass';
      filter.frequency.value = 800;
      gain.gain.value = 0.4;

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      source.onended = () => resolve();
      source.start();
    });
  };

  const createBirdSounds = async (context: AudioContext, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const totalDuration = duration / 1000;
      let completed = 0;
      const numBirds = 3;

      for (let bird = 0; bird < numBirds; bird++) {
        setTimeout(() => {
          const osc = context.createOscillator();
          const gain = context.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800 + bird * 200, context.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200 + bird * 200, context.currentTime + 0.1);
          osc.frequency.exponentialRampToValueAtTime(600 + bird * 200, context.currentTime + 0.2);
          
          gain.gain.setValueAtTime(0.1, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          
          osc.connect(gain);
          gain.connect(context.destination);
          
          osc.start();
          osc.stop(context.currentTime + 0.3);
          
          completed++;
          if (completed === numBirds) {
            setTimeout(resolve, 300);
          }
        }, bird * 400);
      }
    });
  };

  const createAmbientSound = async (context: AudioContext, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 200;
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + (duration / 1000));
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.onended = () => resolve();
      osc.start();
      osc.stop(context.currentTime + (duration / 1000));
    });
  };

  const cloneVoiceMultiModel = async () => {
    if (!recordedBlob) return;

    setRecordingState('uploading');
    setCloningProgress({});
    setModelResults([]);

    const models = [
      { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5' },
      { id: 'eleven_multilingual_v2', name: 'Multilingual v2' },
      { id: 'eleven_monolingual_v1', name: 'Monolingual v1' }
    ];

    try {
      // Clone voice først (kun én gang)
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'voice-recording.wav');
      formData.append('name', 'PlayTale Stemme');
      formData.append('description', 'Klonede stemme til PlayTale historier');

      setCloningProgress(prev => ({ ...prev, clone: 'Kloner stemme...' }));

      const cloneResponse = await fetch('/api/elevenlabs/clone-voice', {
        method: 'POST',
        body: formData,
      });

      const cloneResult = await cloneResponse.json();

      if (!cloneResponse.ok) {
        throw new Error(cloneResult.error || 'Failed to clone voice');
      }

      const voiceId = cloneResult.voice_id;
      localStorage.setItem('cloned_voice_id', voiceId);

      // Test alle modeller parallelt
      const results: ModelResult[] = [];
      
      await Promise.all(models.map(async (model) => {
        try {
          setCloningProgress(prev => ({ ...prev, [model.id]: `Tester ${model.name}...` }));

          const endpoint = useCharacterVoices ? '/api/elevenlabs/test-voice-character' : '/api/elevenlabs/test-voice-multi';
          const testResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              voice_id: voiceId,
              text: PREVIEW_TEXT,
              model_id: model.id,
            }),
          });

          if (testResponse.ok) {
            const testResult = await testResponse.json();
            results.push({
              model_id: model.id,
              model_name: model.name,
              audio_data: testResult.audio_data || '', // For single voice
              voice_id: voiceId,
              audio_segments: testResult.audio_segments, // For character voices
              segments_info: testResult.segments_info,
            });
            setCloningProgress(prev => ({ ...prev, [model.id]: `${model.name} ✅` }));
          } else {
            setCloningProgress(prev => ({ ...prev, [model.id]: `${model.name} ❌` }));
          }
        } catch (error) {
          console.error(`Error testing model ${model.id}:`, error);
          setCloningProgress(prev => ({ ...prev, [model.id]: `${model.name} ❌` }));
        }
      }));

      setModelResults(results);
      setRecordingState('cloned');

      // Auto-select første tilgængelige model
      if (results.length > 0) {
        setSelectedModel(results[0].model_id);
        // Set clonedVoiceUrl for første model
        const firstResult = results[0];
        const audioBlob = new Blob(
          [Uint8Array.from(atob(firstResult.audio_data), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        setClonedVoiceUrl(audioUrl);
      }

    } catch (error) {
      console.error('Error cloning voice:', error);
      alert('Der opstod en fejl under stemmekloning. Prøv igen.');
      setRecordingState('recorded');
      
      // Show error to user
      alert(`Stemmekloning fejlede: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
    }
  };

  const playPreview = () => {
    const selectedResult = modelResults.find(r => r.model_id === selectedModel);
    
    if (useCharacterVoices && selectedResult?.audio_segments) {
      // Play character sequence with sound effects
      if (!isPlayingCharacters) {
        playCharacterSequence(selectedResult.audio_segments, selectedResult.segments_info || []);
      }
    } else {
      // Play single audio
      if (!clonedVoiceUrl || !audioRef.current) return;

      if (isPlayingPreview) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioRef.current.src = clonedVoiceUrl;
        audioRef.current.play();
        setIsPlayingPreview(true);
        
        audioRef.current.onended = () => {
          setIsPlayingPreview(false);
        };
      }
    }
  };

  const handleNext = () => {
    // TODO: Gem stemme-data
    console.log('Voice cloning completed');
    
    // Gå til børneprofil
    window.location.href = '/onboarding/children';
  };

  const canProceed = recordingState === 'cloned';
  const handleContinue = () => {
    // TODO: Gem stemme-data
    console.log('Voice cloning completed');
    
    // Gå til børneprofil
    window.location.href = '/onboarding/children';
  };

  const progressSteps = [
    { id: 'family', label: 'Familie', status: 'completed' as const },
    { id: 'voice', label: 'Stemme', status: 'current' as const },
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
            Optag din stemme
          </Heading>
          <Text color="secondary" className="text-center">
            Din stemme vil fortælle historierne til dit barn, så det føles som om du er der
          </Text>
        </div>

        {/* Instructions Card */}
        {(recordingState === 'idle' || recordingState === 'recording') && (
          <Card padding="base" className="mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-purple-200 transition-colors" onClick={startRecording}>
                <Mic className="h-8 w-8 text-purple-600" />
              </div>
              <Heading level={3} size="lg" className="mb-2">Læs denne tekst højt</Heading>
              <Text size="sm" color="secondary" className="text-center">
                💡 <strong>Få den bedste kvalitet:</strong> Tal langsomt og tydeligt • Brug naturlig intonation som når du læser for dit barn • Find et stille sted uden baggrundsstøj
              </Text>
            </div>

            {/* Reading Text */}
            <FormField label="Tekst til oplæsning">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 max-h-40 overflow-y-auto">
                <Text size="sm" className="leading-relaxed whitespace-pre-line">
                  {SAMPLE_TEXT}
                </Text>
              </div>
              {recordingState === 'idle' && (
                <Text size="xs" color="secondary" className="mt-2 text-center">
                  💡 Scroll gennem teksten og læs den igennem først
                </Text>
              )}
            </FormField>
          </Card>
        )}

        {recordingState === 'recording' && (
          <Card padding="base" className="text-center">
            <div className="mb-4">
              <IconButton 
                size="lg" 
                variant="danger" 
                onClick={stopRecording}
                animate="pulse"
                className="mx-auto mb-3"
              >
                <MicOff className="h-7 w-7" />
              </IconButton>
              <Text size="sm" weight="medium" color="error" className="mb-3">
                Optager... Tryk for at stoppe
              </Text>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-6 bg-red-500 rounded animate-pulse"></div>
                  <div className="w-2 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-6 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {recordingState === 'recorded' && (
          <Card padding="base" className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <Heading level={3} size="lg" className="mb-2 text-green-600">
              Optagelse fuldført!
            </Heading>
            <Text color="secondary" className="mb-6">
              Lyt til din optagelse og fortsæt hvis du er tilfreds
            </Text>
            
            {/* Audio Player Card */}
            <Card padding="sm" className="mb-6 bg-blue-50 border border-blue-200">
              <FormField label="Hør din optagelse">
                <div className="flex items-center space-x-3">
                  <IconButton
                    onClick={playRecording}
                    variant={isPlayingRecording ? "secondary" : "primary"}
                    size="sm"
                  >
                    {isPlayingRecording ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </IconButton>

                  <div className="flex-1 flex items-center space-x-2">
                    <Text size="xs" className="text-gray-600 font-mono min-w-[35px]">
                      {formatTime(currentTime)}
                    </Text>
                    
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #DBEAFE ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #DBEAFE 100%)`
                        }}
                      />
                    </div>
                    
                    <Text size="xs" className="text-gray-600 font-mono min-w-[35px]">
                      {formatTime(duration)}
                    </Text>
                  </div>
                </div>
              </FormField>
            </Card>

            <div className="flex space-x-3">
              <Button
                onClick={retryRecording}
                variant="outline"
                className="flex-1"
              >
                Optag igen
              </Button>
              <Button
                onClick={cloneVoiceMultiModel}
                variant="primary"
                className="flex-1"
              >
                Klon stemme
              </Button>
            </div>
          </Card>
        )}

        {recordingState === 'uploading' && (
          <Card padding="base" className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            </div>
            <Heading level={3} size="lg" className="mb-2 text-purple-600">
              Kloner din stemme...
            </Heading>
            <Text color="secondary" className="mb-6">
              Vi træner forskellige stemme-modeller for at give dig den bedste kvalitet
            </Text>
            
            {/* Progress Card */}
            <Card padding="sm" className="mb-4 bg-gray-50">
              <div className="space-y-3">
                {Object.entries(cloningProgress).map(([key, status]) => (
                  <div key={key} className="flex justify-between items-center">
                    <Text size="sm" weight="medium" className="text-gray-700">
                      {key === 'clone' ? 'Stemme kloning' : key.replace('eleven_', '').replace('_', ' ')}
                    </Text>
                    <Text size="sm" className={`${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-500' : 'text-purple-600'}`}>
                      {status}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
            
            <Text size="sm" color="secondary">
              Dette tager normalt 1-2 minutter
            </Text>
          </Card>
        )}

        {recordingState === 'cloned' && (
          <Card padding="base" className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <Heading level={3} size="lg" className="mb-2 text-green-600">
              Stemme klonet med succes!
            </Heading>
            <Text color="secondary" className="mb-6">
              Din stemme er nu klar til at fortælle historier på {modelResults.length} forskellige modeller
            </Text>
            
            {/* Model Selector */}
            {modelResults.length > 1 && (
              <Card padding="sm" className="mb-6 bg-blue-50 border border-blue-200">
                <FormField label="🎛️ Sammenlign stemme-modeller">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {modelResults.map((result) => (
                      <Button
                        key={result.model_id}
                        onClick={() => {
                          setSelectedModel(result.model_id);
                          const audioBlob = new Blob(
                            [Uint8Array.from(atob(result.audio_data), c => c.charCodeAt(0))],
                            { type: 'audio/mpeg' }
                          );
                          const audioUrl = URL.createObjectURL(audioBlob);
                          setClonedVoiceUrl(audioUrl);
                        }}
                        variant={selectedModel === result.model_id ? "primary" : "outline"}
                        size="sm"
                      >
                        {result.model_name}
                      </Button>
                    ))}
                  </div>
                </FormField>
              </Card>
            )}
            
            {/* Preview Section */}
            <Card padding="base" className="mb-4 bg-green-50 border border-green-200">
              <div className="text-center mb-4">
                <Heading level={4} size="sm" className="mb-2 text-green-800">
                  🎉 Hør din klonede stemme læse en historie
                  {modelResults.length > 1 && (
                    <Text size="xs" className="text-purple-600 mt-1">
                      ({modelResults.find(r => r.model_id === selectedModel)?.model_name})
                    </Text>
                  )}
                </Heading>
              </div>
              
              {/* Story Preview Card */}
              <Card padding="sm" className="mb-4 bg-white border border-green-300">
                <FormField label="📚 Historie: Emma og den snakkende mus">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <Text size="sm" className="text-gray-600 italic leading-relaxed whitespace-pre-line">
                      {PREVIEW_TEXT}
                    </Text>
                  </div>
                </FormField>
              </Card>
              
              <Text size="sm" color="secondary" className="mb-4">
                Lyt til hvordan din stemme lyder når den fortæller børnehistorier
              </Text>
              
              <Button
                onClick={playPreview}
                disabled={isPlayingPreview || isPlayingCharacters}
                variant={isPlayingPreview || isPlayingCharacters ? "secondary" : "primary"}
                className="mx-auto"
              >
                {(isPlayingPreview || isPlayingCharacters) ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Afspiller...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Afspil historie
                  </>
                )}
              </Button>
            </Card>
          </Card>
        )}

        {/* Hidden audio elements */}
        <audio ref={audioRef} style={{ display: 'none' }} />
        <audio ref={recordedAudioRef} style={{ display: 'none' }} />

        {/* Custom slider styles */}
        <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .slider::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        `}</style>
      </MainContent>

      <Footer>
        {canProceed && (
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleContinue}
              className="w-full"
            >
              Fortsæt til børneprofiler
            </Button>
          </div>
        )}
      </Footer>
    </ScreenLayout>
  );
}
