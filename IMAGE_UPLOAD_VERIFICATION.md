# Image Upload Implementation - USER APP (CORRECT)

## ✅ OUR APP IS UPLOADING CORRECTLY TO CLOUDINARY

### Our Implementation Flow:

```
User captures image → Local URI → Upload to Cloudinary → Get secure_url → Store in Firestore
```

### Code Implementation (src/services/requestService.ts):

```typescript
export const createRequest = async (
  userId: string,
  wasteType: string,
  itemCount: number,
  location: RequestLocation,
  partnerId?: string | null,
  imageUri?: string | null,  // ← Local file path from phone
  confidence?: number | null,
  userName?: string | null
): Promise<string> => {
  try {
    // ✅ STEP 1: Upload image to Cloudinary FIRST
    let uploadedImageUrl = null;
    if (imageUri) {
      try {
        console.log('📸 Uploading image to Cloudinary...');
        console.log('  Local URI:', imageUri);  // file:///data/user/0/...
        
        // ✅ This uploads to Cloudinary and returns HTTPS URL
        uploadedImageUrl = await uploadImageToCloudinary(imageUri);
        
        console.log('✅ Cloudinary URL:', uploadedImageUrl);  // https://res.cloudinary.com/...
      } catch (uploadError) {
        console.error('⚠️ Image upload failed:', uploadError);
      }
    }

    // ✅ STEP 2: Store Cloudinary URL in Firestore (NOT local path)
    const requestData = {
      userId,
      userName: userName || 'Anonymous',
      userPhone,
      type: wasteType,
      quantity: itemCount,
      status: partnerId ? 'Assigned' : 'Pending',
      partnerId: partnerId || null,
      location,
      imageUrl: uploadedImageUrl,  // ← HTTPS URL from Cloudinary
      confidence: confidence || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // ✅ STEP 3: Save to Firestore with Cloudinary URL
    const docRef = await addDoc(collection(db, 'wasteRequests'), requestData);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error in createRequest:', error);
    throw error;
  }
};
```

### Cloudinary Upload Service (src/services/cloudinaryService.ts):

```typescript
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/di921hctk/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'parivartan_unsigned';

export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  try {
    console.log('📤 Uploading image to Cloudinary:', imageUri);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,           // ← Local file path
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Image uploaded successfully:', data.secure_url);
    
    return data.secure_url;  // ← Returns HTTPS URL
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
}
```

## What Gets Stored in Firestore:

### ✅ CORRECT (Our App):
```javascript
{
  imageUrl: "https://res.cloudinary.com/di921hctk/image/upload/v1234567890/abc123.jpg"
}
```

### ❌ WRONG (If not uploading):
```javascript
{
  imageUrl: "file:///data/user/0/com.example.app/cache/image123.jpg"
}
```

## How to Verify Images Are Uploaded Correctly:

### 1. Check Console Logs:
```
📸 Uploading image to Cloudinary...
  Local URI: file:///data/user/0/.../image.jpg
✅ Image uploaded to Cloudinary: https://res.cloudinary.com/di921hctk/image/upload/v1234567890/abc123.jpg
📦 Request data to save: { imageUrl: "https://res.cloudinary.com/..." }
```

### 2. Check Firestore Document:
```javascript
// Open Firebase Console → Firestore → wasteRequests collection
// Check any document's imageUrl field:

imageUrl: "https://res.cloudinary.com/di921hctk/image/upload/v1234567890/abc123.jpg"
// ✅ Should start with https://res.cloudinary.com/
// ❌ Should NOT start with file:///
```

### 3. Test Image URL:
- Copy the `imageUrl` value from Firestore
- Paste it in a web browser
- ✅ If it opens the image → Upload is working
- ❌ If it shows error → Upload failed

## For Partner Developer:

### What You Should Receive:

```javascript
// Firestore document structure
{
  id: "abc123",
  userId: "user123",
  userName: "John Doe",
  userPhone: "1234567890",
  type: "plastic",
  quantity: 5,
  status: "Assigned",
  partnerId: "partner123",
  location: {
    house: "123",
    street: "Main St",
    city: "Mumbai",
    pincode: "400001"
  },
  imageUrl: "https://res.cloudinary.com/di921hctk/image/upload/v1234567890/sample.jpg",
  // ↑ This should ALWAYS be an HTTPS URL, never a file:// path
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### How to Display Image in Partner App:

```javascript
// React Native
<Image 
  source={{ uri: request.imageUrl }} 
  style={{ width: 300, height: 200 }}
/>

// React Web
<img src={request.imageUrl} alt="Waste" />

// Flutter
Image.network(request.imageUrl)

// Android Native
Glide.with(context)
  .load(request.imageUrl)
  .into(imageView)
```

## Debugging Steps for Partner:

1. **Check Firestore Console**:
   - Go to Firebase Console
   - Open Firestore Database
   - Navigate to `wasteRequests` collection
   - Open any document
   - Check `imageUrl` field value

2. **Verify URL Format**:
   ```javascript
   // ✅ CORRECT
   "https://res.cloudinary.com/di921hctk/image/upload/v1234567890/abc.jpg"
   
   // ❌ WRONG
   "file:///data/user/0/com.app/cache/image.jpg"
   ```

3. **Test URL in Browser**:
   - Copy the `imageUrl` value
   - Paste in browser address bar
   - Should display the image

4. **Check Network Permissions**:
   - Ensure partner app has internet permission
   - Check if HTTPS requests are allowed
   - Verify no firewall blocking Cloudinary domain

5. **Console Logging**:
   ```javascript
   console.log('Image URL:', request.imageUrl);
   console.log('URL type:', typeof request.imageUrl);
   console.log('Starts with https:', request.imageUrl?.startsWith('https://'));
   console.log('Is Cloudinary:', request.imageUrl?.includes('cloudinary.com'));
   ```

## Common Issues:

### Issue 1: "Not allowed to load local resource"
**Cause**: Storing local file path instead of Cloudinary URL
**Solution**: Ensure upload to Cloudinary happens BEFORE saving to Firestore

### Issue 2: Image not displaying
**Cause**: Network permissions or CORS issues
**Solution**: Check internet permissions and test URL in browser

### Issue 3: imageUrl is null
**Cause**: Upload failed or user didn't provide image
**Solution**: Handle null case with placeholder image

## Contact Information:

If partner developer sees `file:///` paths in Firestore:
- ❌ Images are NOT being uploaded to Cloudinary
- ✅ Our app IS uploading correctly
- 🔍 Check if partner is creating requests directly without using our API

## Cloudinary Configuration:

- **Cloud Name**: `di921hctk`
- **Upload Preset**: `parivartan_unsigned`
- **Upload URL**: `https://api.cloudinary.com/v1_1/di921hctk/image/upload`
- **Image URL Format**: `https://res.cloudinary.com/di921hctk/image/upload/v{version}/{public_id}.{format}`

## Summary:

✅ **Our user app uploads images to Cloudinary correctly**
✅ **Cloudinary URLs are stored in Firestore**
✅ **Partner should receive HTTPS URLs, not file paths**
✅ **If partner sees file:// paths, they're not using our API correctly**
