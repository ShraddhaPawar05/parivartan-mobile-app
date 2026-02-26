# CLOUDINARY UPLOAD DEBUGGING GUIDE

## Current Status: Images NOT uploading to Cloudinary

### Problem:
Images are being saved as local file paths (`file:///...`) instead of Cloudinary URLs (`https://res.cloudinary.com/...`)

---

## STEP 1: Check Console Logs

When you create a new waste request, look for these logs:

### ✅ If Upload is Working:
```
🔵 IMAGE URI PROVIDED: file:///data/user/0/.../image.jpg
🔵 ATTEMPTING CLOUDINARY UPLOAD...
📤 Starting Cloudinary upload...
  Image URI: file:///...
  Cloud Name: dffdxldj2
  Upload Preset: partner_documents
📡 Sending request to Cloudinary...
📥 Response status: 200
✅ Upload successful!
  Cloudinary URL: https://res.cloudinary.com/dffdxldj2/image/upload/v1234567890/abc.jpg
✅ CLOUDINARY UPLOAD SUCCESS!
✅ UPLOADED URL: https://res.cloudinary.com/dffdxldj2/...
📦 FINAL IMAGE URL TO SAVE: https://res.cloudinary.com/dffdxldj2/...
```

### ❌ If Upload is Failing:
```
🔵 IMAGE URI PROVIDED: file:///data/user/0/.../image.jpg
🔵 ATTEMPTING CLOUDINARY UPLOAD...
📤 Starting Cloudinary upload...
❌ Upload failed: 400 - Invalid upload preset
❌ CLOUDINARY UPLOAD FAILED!
❌ ERROR: Error: Upload failed: 400
❌ CONTINUING WITHOUT IMAGE
📦 FINAL IMAGE URL TO SAVE: null
```

### ⚠️ If Upload is Not Being Called:
```
⚠️ NO IMAGE URI PROVIDED
📦 FINAL IMAGE URL TO SAVE: null
```

---

## STEP 2: Verify Cloudinary Configuration

### Check Settings in Cloudinary Dashboard:

1. **Login**: https://cloudinary.com/console
2. **Account**: dffdxldj2
3. **Go to**: Settings → Upload → Upload Presets
4. **Find**: `partner_documents` preset
5. **Verify**:
   - ✅ Preset name: `partner_documents` (exact match, case-sensitive)
   - ✅ Signing Mode: `Unsigned`
   - ✅ Status: `Enabled`

### If Preset Doesn't Exist:

**Create New Upload Preset:**
1. Click "Add upload preset"
2. Preset name: `partner_documents`
3. Signing mode: `Unsigned`
4. Click "Save"

---

## STEP 3: Test Cloudinary Upload Directly

### Add Test Button to Your App:

```typescript
// In ConfirmRequestScreen.tsx or any screen
import { testCloudinaryUpload } from '../services/testCloudinary';

// Add this button
<TouchableOpacity 
  onPress={async () => {
    try {
      await testCloudinaryUpload();
      alert('Cloudinary test passed!');
    } catch (error) {
      alert('Cloudinary test failed: ' + error);
    }
  }}
  style={{ backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, margin: 20 }}
>
  <Text style={{ color: '#fff', fontWeight: '700' }}>Test Cloudinary Upload</Text>
</TouchableOpacity>
```

---

## STEP 4: Check Network/Permissions

### Android Permissions (android/app/src/main/AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS Permissions (ios/YourApp/Info.plist):
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

---

## STEP 5: Verify Image URI is Valid

### Check if image exists:
```typescript
// Add this before upload
console.log('Checking if image exists...');
const fileInfo = await FileSystem.getInfoAsync(imageUri);
console.log('File exists:', fileInfo.exists);
console.log('File size:', fileInfo.size);
```

---

## STEP 6: Alternative Cloudinary Configuration

If `partner_documents` preset doesn't work, try creating a new one:

### Option A: Use Default Preset
```typescript
// In cloudinaryService.ts
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Cloudinary's default unsigned preset
```

### Option B: Create New Preset
1. Go to Cloudinary Dashboard
2. Settings → Upload → Upload Presets
3. Click "Add upload preset"
4. Name: `parivartan_app`
5. Signing mode: `Unsigned`
6. Save

Then update code:
```typescript
const CLOUDINARY_UPLOAD_PRESET = 'parivartan_app';
```

---

## STEP 7: Check Firestore After Upload

### Open Firebase Console:
1. Go to Firestore Database
2. Open `wasteRequests` collection
3. Find latest document
4. Check `imageUrl` field

### Expected Values:

✅ **CORRECT**:
```
imageUrl: "https://res.cloudinary.com/dffdxldj2/image/upload/v1234567890/abc.jpg"
```

❌ **WRONG**:
```
imageUrl: "file:///data/user/0/com.app/cache/image.jpg"
imageUrl: null
imageUrl: undefined
```

---

## STEP 8: Common Issues & Solutions

### Issue 1: "Upload preset not found"
**Solution**: Create `partner_documents` preset in Cloudinary dashboard (see Step 2)

### Issue 2: "Invalid signature"
**Solution**: Ensure preset is set to `Unsigned` mode

### Issue 3: "Network request failed"
**Solution**: Check internet connection and permissions (see Step 4)

### Issue 4: "File not found"
**Solution**: Verify image URI is valid (see Step 5)

### Issue 5: Upload succeeds but imageUrl is still null
**Solution**: Check if error is being caught silently - look for "CONTINUING WITHOUT IMAGE" in logs

---

## STEP 9: Manual Test with Postman/cURL

### Test Cloudinary API directly:

```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/dffdxldj2/image/upload \
  -F "file=@/path/to/test/image.jpg" \
  -F "upload_preset=partner_documents"
```

**Expected Response:**
```json
{
  "secure_url": "https://res.cloudinary.com/dffdxldj2/image/upload/v1234567890/abc.jpg",
  "public_id": "abc123",
  ...
}
```

---

## STEP 10: Contact Support

If all steps fail, provide this information:

1. **Console logs** from creating a request
2. **Cloudinary account** details (cloud name, preset name)
3. **Firestore document** showing imageUrl field
4. **Network logs** (if available)
5. **Error messages** from console

---

## Quick Checklist:

- [ ] Cloudinary account `dffdxldj2` exists
- [ ] Upload preset `partner_documents` exists
- [ ] Preset is set to `Unsigned`
- [ ] Internet permission is granted
- [ ] Image URI is valid
- [ ] Console shows upload attempt
- [ ] Console shows success or error
- [ ] Firestore has correct URL format
- [ ] Partner can access the URL in browser

---

## Expected Flow:

```
1. User captures image → Local URI (file:///)
2. Call uploadImageToCloudinary(uri)
3. Upload to Cloudinary API
4. Receive Cloudinary URL (https://res.cloudinary.com/...)
5. Save URL to Firestore
6. Partner reads URL from Firestore
7. Partner displays image
```

**Current Issue**: Step 3 or 4 is failing, causing Step 5 to save null or local path instead of Cloudinary URL.
