const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  try {
    console.log('📤 Starting Cloudinary upload...');
    console.log('  Image URI:', imageUri);
    console.log('  Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('  Upload Preset:', CLOUDINARY_UPLOAD_PRESET);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'waste-image.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('📡 Sending request to Cloudinary...');
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Upload successful!');
    console.log('  Cloudinary URL:', data.secure_url);
    console.log('  Public ID:', data.public_id);
    
    return data.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
}
