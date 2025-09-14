import { View, Text } from 'react-native';
<<<<<<< HEAD
import React from 'react';
=======
import React, { useEffect } from 'react';
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
import RootNavigator from './RootNavigator';

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

<<<<<<< HEAD
=======

>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
export default function App() {
  return (
    <ErrorBoundary>
      <RootNavigator />
    </ErrorBoundary>
  );
}
<<<<<<< HEAD
>>>>>>> c2bd6f4 (Initial commit)
=======
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
