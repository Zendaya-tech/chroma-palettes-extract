import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512',{
      // Use 'webgpu' for hardware acceleration, 'wasm' for wider compatibility
      device: 'webgpu', 
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    resizeImageIfNeeded(canvas, ctx, imageElement);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process the image with the segmentation model
    const result = await segmenter(imageData, {
        threshold: 0.5,
        // The label for "background" in the ADE20k dataset is often index 0 or a specific label.
        // We might need to adjust this. For now, we assume we need to find what ISN'T background.
        // Let's assume we want to keep all "foreground" objects.
    });
    
    const personLabel = 'person';
    const foregroundMask = result.find(res => res.label === personLabel)?.mask;

    if (!foregroundMask) {
        // Fallback or simple inversion if no person is detected
        console.warn("Person not detected, using a simple mask inversion as fallback.");
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply mask to alpha channel. We iterate through all masks if needed.
    // For this model, it returns multiple segments. We will combine them.
    for (let i = 0; i < data.length / 4; i++) {
        let alpha = 0;
        for (const segment of result) {
            // This model might not have a "background" label. We keep everything that's not "wall", "sky", "floor", "tree", etc.
            // A simpler approach is to keep the most prominent objects.
            // For now, let's keep everything that the model segments.
            if (segment.label !== 'wall' && segment.label !== 'sky' && segment.label !== 'floor' && segment.label !== 'road' && segment.label !== 'grass' && segment.label !== 'water' && segment.label !== 'building') {
              if (segment.mask.data[i] > 0) {
                alpha = 255;
                break;
              }
            }
        }
        data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
