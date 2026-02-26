import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAMERA_RATIO = 4 / 3;
const CAMERA_HEIGHT = SCREEN_WIDTH * CAMERA_RATIO;

const CameraScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera" size={64} color="#10b981" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      setCapturedImage(photo.uri);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    navigation.navigate('Main', {
      screen: 'Identify',
      params: {
        screen: 'WasteIdentified',
        params: { imageUri: capturedImage }
      }
    });
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <MaterialCommunityIcons name="close" size={32} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.useButton} onPress={handleUsePhoto}>
            <MaterialCommunityIcons name="check" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView 
          style={styles.camera} 
          ref={cameraRef} 
          facing={facing}
          ratio="4:3"
        />
      </View>
      <View style={styles.cameraOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.captureContainer}>
          <TouchableOpacity style={styles.galleryButton} onPress={handleGallery}>
            <MaterialCommunityIcons name="image" size={28} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-flip" size={28} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  cameraWrapper: {
    width: SCREEN_WIDTH,
    height: CAMERA_HEIGHT,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  closeButton: {
    marginTop: 50,
    marginLeft: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 40,
  },
  retakeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  useButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default CameraScreen;
