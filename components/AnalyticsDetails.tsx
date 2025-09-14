import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AnalyticsDetailsProps {
  analytics?: {
    date?: string;
    time?: string;
    location?: string;
    [key: string]: any;
  };
  analysis?: {
    labels?: string[];
    objects?: string[];
    keywords?: string[];
    extractedText?: string;
    [key: string]: any;
  };
}

const AnalyticsDetails: React.FC<AnalyticsDetailsProps> = ({ analytics, analysis }) => {
  const [showKeywords, setShowKeywords] = useState(false);
  if (!analytics && !analysis) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Extracted Details</Text>
      {analytics?.date && <Text style={styles.item}>Date: {analytics.date}</Text>}
      {analytics?.time && <Text style={styles.item}>Time: {analytics.time}</Text>}
      {analytics?.location && <Text style={styles.item}>Location: {analytics.location}</Text>}
      {analysis?.labels?.length ? <Text style={styles.item}>Labels: {analysis.labels.join(', ')}</Text> : null}
      {analysis?.objects?.length ? <Text style={styles.item}>Objects: {analysis.objects.join(', ')}</Text> : null}
      {analysis?.extractedText ? <Text style={styles.item}>Text: {analysis.extractedText}</Text> : null}
      {analysis?.keywords?.length ? (
        <View style={{ marginTop: 6 }}>
          <Text
            style={[styles.item, { color: '#1976d2', fontWeight: 'bold' }]}
            onPress={() => setShowKeywords((prev) => !prev)}
          >
            {showKeywords ? '▼' : '▶'} Keywords ({analysis.keywords.length})
          </Text>
          {showKeywords && (
            <View style={{ marginLeft: 12, marginTop: 2 }}>
              {analysis.keywords.map((kw, i) => (
                <Text key={i} style={styles.item}>• {kw}</Text>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 8, padding: 8, backgroundColor: '#f7f7f7', borderRadius: 8 },
  header: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  item: { fontSize: 14, color: '#333', marginBottom: 2 },
});

export default AnalyticsDetails;
