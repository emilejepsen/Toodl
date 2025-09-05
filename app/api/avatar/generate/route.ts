import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Konfigurer fal.ai klienten
fal.config({
  credentials: process.env.FAL_KEY
});

export async function POST(request: NextRequest) {
  try {
    // Check if FAL_KEY is configured
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'FAL_KEY ikke konfigureret. Tjek din .env.local fil.' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { type, prompt, imageFile } = body;

    if (type === 'text-to-image') {
      // Generer avatar fra tekst prompt - brug FLUX.1 [schnell] som specificeret
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          num_inference_steps: 4, // Standard værdi for schnell
          image_size: "square_hd",
          guidance_scale: 3.5, // Standard værdi for schnell
          num_images: 1,
          enable_safety_checker: true,
          output_format: "png",
          acceleration: "regular" // Hurtigere generering
        },
        logs: true
      });
      return NextResponse.json({ success: true, avatarUrl: result.data.images[0].url, requestId: result.requestId });
    } else if (type === 'image-to-image') {
      let imageUrl = imageFile;
      if (imageFile.startsWith('data:image/')) {
        const base64Data = imageFile.split(',')[1];
        const blob = Buffer.from(base64Data, 'base64');
        const file = new File([blob], 'avatar-input.jpg', { type: 'image/jpeg' });
        imageUrl = await fal.storage.upload(file);
      }

      // Generer avatar fra billede - brug FLUX.1 [schnell] Redux for image-to-image
      const result = await fal.subscribe("fal-ai/flux/schnell/redux", {
        input: {
          image_url: imageUrl, // Redux bruger image_url parameter
          num_inference_steps: 6, // Højere for image-to-image kvalitet
          image_size: "square_hd",
          num_images: 1,
          enable_safety_checker: true,
          output_format: "png",
          acceleration: "regular" // Hurtigere generering
        },
        logs: true
      });
      return NextResponse.json({ success: true, avatarUrl: result.data.images[0].url, requestId: result.requestId });
    } else {
      return NextResponse.json({ success: false, error: 'Ugyldig type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Fejl ved avatar generering:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Der opstod en fejl under generering af avatar' 
    }, { status: 500 });
  }
}
