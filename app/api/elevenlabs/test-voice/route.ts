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

    const { voice_id, text } = await request.json();

    if (!voice_id || !text) {
      return NextResponse.json(
        { error: 'voice_id and text are required' },
        { status: 400 }
      );
    }

    // Call ElevenLabs text-to-speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        language_code: 'da', // Re-added for turbo model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 1.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorText },
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
      content_type: 'audio/mpeg'
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
