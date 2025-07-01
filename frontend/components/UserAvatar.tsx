import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface UserAvatarProps {
  uri: string;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
}

export function UserAvatar({
  uri,
  size = 40,
  borderWidth = 2,
  borderColor = '#FFFFFF'
}: UserAvatarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor
        }
      ]}
    >
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size - borderWidth * 2,
            height: size - borderWidth * 2,
            borderRadius: (size - borderWidth * 2) / 2
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  image: {
    backgroundColor: '#F3F4F6'
  }
});