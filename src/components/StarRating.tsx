import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const StarRating: React.FC<{ initial?: number; onChange?: (n: number) => void }> = ({ initial = 4, onChange }) => {
  const [rating, setRating] = useState(initial);
  const set = (n: number) => {
    setRating(n);
    onChange?.(n);
  };
  return (
    <View style={styles.row}>
      {[1,2,3,4,5].map((n) => (
        <Pressable key={n} onPress={() => set(n)} style={{padding:6}}>
          <AntDesign name={n <= rating ? 'star' : 'staro'} size={22} color={n <= rating ? '#f59e0b' : '#d1d5db'} />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });

export default StarRating;
