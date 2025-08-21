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

    const { voice_id, text, model_id, character_voices } = await request.json();

    if (!voice_id || !text || !model_id) {
      return NextResponse.json(
        { error: 'voice_id, text, and model_id are required' },
        { status: 400 }
      );
    }

    // Different voice settings optimized for each model
    const getVoiceSettings = (modelId: string) => {
      switch (modelId) {
        case 'eleven_turbo_v2_5':
          return {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 1.0,
            use_speaker_boost: true
          };
        case 'eleven_multilingual_v2':
          return {
            stability: 0.4,
            similarity_boost: 0.9,
            style: 0.3,
            use_speaker_boost: true
          };
        case 'eleven_monolingual_v1':
          return {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true
          };
        default:
          return {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 1.0,
            use_speaker_boost: true
          };
      }
    };

    const requestBody: any = {
      text,
      model_id,
      voice_settings: getVoiceSettings(model_id)
    };

    // Only add language_code for turbo model
    if (model_id === 'eleven_turbo_v2_5') {
      requestBody.language_code = 'da';
    }

    // Call ElevenLabs text-to-speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs TTS error for ${model_id}:`, errorText);
      return NextResponse.json(
        { error: `Failed to generate speech with ${model_id}`, details: errorText },
        { status: response.status }
      );
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for easy transport
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    return NextResponse.json({
      success: true,
      audio_data: base64Audio,
      content_type: 'audio/mpeg',
      model_id
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
