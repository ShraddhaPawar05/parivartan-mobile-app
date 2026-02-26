// Environment Variables Verification Script
// Run this to verify your .env is set up correctly

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
];

let allSet = true;
let missingVars = [];

console.log('Firebase Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`API Key: ${process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`Auth Domain: ${process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}`);
console.log(`Project ID: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`Storage Bucket: ${process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}`);
console.log(`Messaging Sender ID: ${process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`App ID: ${process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}`);

console.log('\nCloudinary Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Cloud Name: ${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing'}`);
console.log(`Upload Preset: ${process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅ Set' : '❌ Missing'}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    allSet = false;
    missingVars.push(varName);
  }
});

if (allSet) {
  console.log('✅ All environment variables are set!');
  console.log('✅ Your .env file is configured correctly.');
  console.log('\n🚀 You can now run: npx expo start\n');
} else {
  console.log('❌ Some environment variables are missing:\n');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please check your .env file and add the missing variables.');
  console.log('📖 See ENVIRONMENT_SETUP.md for instructions.\n');
}

export default function verifyEnv() {
  return allSet;
}
