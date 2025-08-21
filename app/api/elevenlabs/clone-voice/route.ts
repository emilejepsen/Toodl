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

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const voiceName = formData.get('name') as string || 'Cloned Voice';
    const voiceDescription = formData.get('description') as string || 'AI Cloned Voice for PlayTale';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create FormData for ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('name', voiceName);
    elevenLabsFormData.append('description', voiceDescription);
    elevenLabsFormData.append('files', audioFile);
    
    // Add labels for better voice cloning - all speech should be labeled as such
    elevenLabsFormData.append('labels', JSON.stringify({
      "accent": "danish",
      "description": "Danish speaker reading sample text",
      "use_case": "audiobook"
    }));

    // Call ElevenLabs voice cloning API
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to clone voice', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      voice_id: result.voice_id,
      name: result.name,
      message: 'Voice cloned successfully'
    });

  } catch (error) {
    console.error('Voice cloning error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
