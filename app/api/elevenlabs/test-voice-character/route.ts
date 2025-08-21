import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const { voice_id, text, model_id } = await request.json();

    if (!voice_id || !text || !model_id) {
      return NextResponse.json(
        { error: 'voice_id, text, and model_id are required' },
        { status: 400 }
      );
    }

    // Parse text and split into segments with different voices
    const segments = parseTextWithCharacters(text);
    const audioSegments: string[] = [];

    // Pre-defined character voices (ElevenLabs voice IDs) - KONSISTENTE!
    const characterVoices = {
      narrator: voice_id, // User's cloned voice for narrator
      emma: '21m00Tcm4TlvDq8ikWAM', // Rachel - consistent young female voice
      mikkel: 'AZnzlk1XvdvUeBnXmlld', // Domi - consistent high-pitched voice for mouse
      sound_effect: '9BWtsMINqrJLrRacOk9x', // Aria - neutral voice for sound effects
      default: voice_id
    };

    // Different voice settings for characters
    const getVoiceSettings = (character: string, modelId: string) => {
      const baseSettings = {
        'eleven_turbo_v2_5': { stability: 0.5, similarity_boost: 0.85, style: 1.0, use_speaker_boost: true },
        'eleven_multilingual_v2': { stability: 0.4, similarity_boost: 0.9, style: 0.3, use_speaker_boost: true },
        'eleven_monolingual_v1': { stability: 0.6, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true }
      }[modelId] || { stability: 0.5, similarity_boost: 0.85, style: 1.0, use_speaker_boost: true };

      // Adjust settings for different characters
      switch (character) {
        case 'emma':
          return { ...baseSettings, style: Math.min(baseSettings.style + 0.3, 1.0) }; // Very expressive
        case 'mikkel':
          return { ...baseSettings, stability: Math.max(baseSettings.stability - 0.2, 0.1), style: Math.min(baseSettings.style + 0.4, 1.0) }; // Animated and expressive
        case 'sound_effect':
          return { ...baseSettings, stability: 0.8, style: 0.1 }; // Calm and clear for sound descriptions
        default:
          return baseSettings;
      }
    };

    // Generate audio for each segment (skip sound effects)
    for (const segment of segments) {
      // Skip sound effects - they will be handled by frontend
      if (segment.character === 'sound_effect') {
        audioSegments.push(''); // Empty audio for sound effects
        continue;
      }

      const voiceToUse = characterVoices[segment.character as keyof typeof characterVoices] || characterVoices.default;
      const voiceSettings = getVoiceSettings(segment.character, model_id);

      const requestBody: any = {
        text: segment.text,
        model_id,
        voice_settings: voiceSettings
      };

      // Only add language_code for turbo model
      if (model_id === 'eleven_turbo_v2_5') {
        requestBody.language_code = 'da';
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceToUse}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`Failed to generate audio for ${segment.character}:`, await response.text());
        audioSegments.push(''); // Empty audio for failed segments
        continue;
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      audioSegments.push(base64Audio);
    }

    return NextResponse.json({
      success: true,
      audio_segments: audioSegments,
      segments_info: segments,
      model_id
    });

  } catch (error) {
    console.error('Character voice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseTextWithCharacters(text: string) {
  const segments = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Handle sound effects [...]
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      const soundDescription = trimmedLine.slice(1, -1);
      segments.push({ 
        character: 'sound_effect', 
        text: `Lydeffekt: ${soundDescription}`,
        type: 'sound_effect',
        original: soundDescription
      });
      continue;
    }

    // Handle explicit character labels
    if (trimmedLine.includes('Narrator:')) {
      const text = trimmedLine.replace('Narrator:', '').trim();
      if (text) segments.push({ character: 'narrator', text, type: 'speech' });
    } else if (trimmedLine.includes('Emma:')) {
      const text = trimmedLine.replace('Emma:', '').trim();
      if (text) segments.push({ character: 'emma', text, type: 'speech' });
    } else if (trimmedLine.includes('Mikkel:')) {
      const text = trimmedLine.replace('Mikkel:', '').trim();
      if (text) segments.push({ character: 'mikkel', text, type: 'speech' });
    } else if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
      // Fallback for unlabeled dialogue
      const dialogue = trimmedLine.slice(1, -1);
      segments.push({ character: 'emma', text: dialogue, type: 'speech' }); // Default to Emma
    } else if (trimmedLine && !trimmedLine.includes(':')) {
      // Unlabeled text defaults to narrator
      segments.push({ character: 'narrator', text: trimmedLine, type: 'speech' });
    }
  }

  return segments;
}
