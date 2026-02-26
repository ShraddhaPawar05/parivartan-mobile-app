import { loadTensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import jpeg from 'jpeg-js';

let model: any = null;

const CLASS_LABELS = [
  'cardboard',
  'glass',
  'metal',
  'paper',
  'plastic',
  'trash',
];

// 🔹 Load Model
export const loadModel = async () => {
  try {
    model = await loadTensorflowModel(
      require('../../assets/model/waste_model_mobile.tflite')
    );

    console.log('✅ TFLite model loaded successfully');
  } catch (error) {
    console.log('❌ Model load error:', error);
  }
};

// 🔹 Predict Image
export const predictImage = async (imageUri: string) => {
  try {
    if (!model) {
      await loadModel();
      if (!model) throw new Error('Model failed to load');
    }

    console.log('📸 Starting prediction for:', imageUri);

    // 1️⃣ Resize to exactly 224x224
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
    );

    // 2️⃣ Read as base64
    const base64 = await FileSystem.readAsStringAsync(resized.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3️⃣ Decode JPEG to raw pixels
    const imageData = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
    console.log('✅ Image decoded:', imageData.width, 'x', imageData.height);

    // 4️⃣ Create input tensor [224, 224, 3]
    const input = new Float32Array(224 * 224 * 3);
    const pixels = imageData.data; // RGBA format

    // 5️⃣ Extract RGB and normalize
    let idx = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      input[idx++] = (pixels[i] / 127.5) - 1;     // R
      input[idx++] = (pixels[i + 1] / 127.5) - 1; // G
      input[idx++] = (pixels[i + 2] / 127.5) - 1; // B
      // Skip alpha channel (pixels[i + 3])
    }

    console.log('✅ Tensor prepared, sample:', input.slice(0, 6));

    // 6️⃣ Run inference
    const output = await model.run([input]);
    const probs = output[0];

    // 7️⃣ Display all predictions
    console.log('\n📈 ALL PREDICTIONS:');
    CLASS_LABELS.forEach((label, i) => {
      console.log(`  ${label.padEnd(12)} ${(probs[i] * 100).toFixed(2)}%`);
    });

    // 8️⃣ Find winner
    let maxIdx = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[maxIdx]) maxIdx = i;
    }

    console.log(`\n✅ FINAL: ${CLASS_LABELS[maxIdx].toUpperCase()} (${(probs[maxIdx] * 100).toFixed(2)}%)\n`);

    return {
      wasteType: CLASS_LABELS[maxIdx],
      confidence: probs[maxIdx] * 100
    };
  } catch (error) {
    console.error('❌ Prediction error:', error);
    return null;
  }
};
