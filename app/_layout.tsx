
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
<<<<<<< HEAD
import { FileProvider } from '@/context/FileContext';
import { PersonalityProvider } from '../utils/PersonalityContext';
import { DropShadowProvider } from '../utils/DropShadowContext';
// import DrawerNav for static navigation
import DrawerNav from '@/components/DrawerNav';
=======
import { FileProvider } from '../context/FileContext';
import { PersonalityProvider } from '../utils/PersonalityContext';
import { DropShadowProvider } from '../utils/DropShadowContext';
// import DrawerNav for static navigation
import DrawerNav from '../components/DrawerNav';
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)

// ErrorBoundary component to catch React errors
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // Log error to console and possibly to a service
    console.error('Global ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' }}>
          <Text style={{ color: 'red', fontFamily: 'monospace', fontSize: 22, marginBottom: 16 }}>Something went wrong.</Text>
          <Text style={{ color: '#333', fontFamily: 'monospace', fontSize: 16 }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}



export default function RootLayout() {
  return (
    <ErrorBoundary>
      <FileProvider>
        <DropShadowProvider>
          <PersonalityProvider>
            <View style={{ flex: 1 }}>
              <DrawerNav />
            </View>
          </PersonalityProvider>
        </DropShadowProvider>
      </FileProvider>
    </ErrorBoundary>
  );
}
