import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import React from 'react';
import { GestureResponderEvent, Linking, Platform, Text, TouchableOpacity } from 'react-native';

type Props = {
  href: string;
  children?: React.ReactNode;
  style?: any;
};

export function ExternalLink({ href, children, style }: Props) {
  const handlePress = async (event?: GestureResponderEvent) => {
    if (Platform.OS === 'web') {
      await Linking.openURL(href);
    } else {
      await openBrowserAsync(href, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} accessibilityRole="link" style={style}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
