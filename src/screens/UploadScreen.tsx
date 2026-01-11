import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const UploadScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload</Text>
      <Text style={styles.subtitle}>Use this screen to upload waste photos and start identification.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f7f7', padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 8, color: '#6b7280', textAlign: 'center' },
});

export default UploadScreen;
