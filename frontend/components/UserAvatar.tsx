import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';

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
  // 检查uri是否有效
  const isValidUri = uri && uri.trim() !== '';
  
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
      {isValidUri ? (
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
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              borderRadius: (size - borderWidth * 2) / 2
            }
          ]}
        >
          <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
            {size > 30 ? 'U' : 'U'}
          </Text>
        </View>
      )}
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
  },
  placeholder: {
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#6B7280'
  }
});