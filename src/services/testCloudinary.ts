// TEST CLOUDINARY UPLOAD
// Run this in your app to test if Cloudinary is working

import { uploadImageToCloudinary } from './cloudinaryService';

export async function testCloudinaryUpload() {
  console.log('🧪 TESTING CLOUDINARY UPLOAD...');
  console.log('');
  
  // Test with a dummy image URI (you need to replace with real image URI from your app)
  const testImageUri = 'file:///data/user/0/com.example/cache/test.jpg';
  
  try {
    console.log('📤 Test Image URI:', testImageUri);
    console.log('');
    
    const cloudinaryUrl = await uploadImageToCloudinary(testImageUri);
    
    console.log('');
    console.log('✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
    console.log('Cloudinary URL:', cloudinaryUrl);
    console.log('');
    console.log('Expected format: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/...');
    console.log('Actual format:', cloudinaryUrl);
    console.log('');
    console.log('Starts with https:', cloudinaryUrl.startsWith('https'));
    console.log('Contains cloudinary:', cloudinaryUrl.includes('cloudinary'));
    
    return cloudinaryUrl;
  } catch (error) {
    console.log('');
    console.log('❌ ❌ ❌ FAILED! ❌ ❌ ❌');
    console.log('Error:', error);
    console.log('Error message:', (error as Error).message);
    console.log('');
    console.log('POSSIBLE ISSUES:');
    console.log('1. Upload preset does not exist in Cloudinary');
    console.log('2. Upload preset is not set to "unsigned"');
    console.log('3. Cloud name is incorrect or missing from .env');
    console.log('4. Network/internet connection issue');
    console.log('5. Image file does not exist at the URI');
    
    throw error;
  }
}

// HOW TO USE:
// 1. Import this in your ConfirmRequestScreen or any screen
// 2. Add a test button:
//    <TouchableOpacity onPress={() => testCloudinaryUpload()}>
//      <Text>Test Cloudinary Upload</Text>
//    </TouchableOpacity>
// 3. Check console logs for results

// WHAT TO CHECK IN CLOUDINARY DASHBOARD:
// 1. Go to https://cloudinary.com/console
// 2. Login with your account
// 3. Go to Settings → Upload → Upload presets
// 4. Verify your upload preset exists
// 5. Verify it's set to "Unsigned"
// 6. Check "Folder" setting (optional)

export default testCloudinaryUpload;
