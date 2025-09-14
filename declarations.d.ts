declare module 'react-native-vector-icons/Ionicons';
declare module 'expo-image-manipulator';
declare module '@env' {
  export const OPENAI_API_KEY: string;
  export const GOOGLE_CLOUD_API_KEY: string;
}

// Remove Expo-specific module declarations. If you use a new image manipulation library, add its type here if needed.

declare module 'base-64';
