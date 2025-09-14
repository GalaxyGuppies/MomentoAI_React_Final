import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';

interface SubcategoryChipsProps {
  subcategories: string[];
  selectedSubcategory: string | null;
  onSelect: (sub: string) => void;
}

const SubcategoryChips: React.FC<SubcategoryChipsProps> = ({
  subcategories,
  selectedSubcategory,
  onSelect,
}) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, paddingHorizontal: 8 }}>
    {subcategories.map((sub, idx) => (
      <TouchableOpacity
        key={sub}
        style={{
          backgroundColor: selectedSubcategory === sub ? '#43C6AC' : '#f5f5f5',
          borderRadius: 22,
          paddingVertical: 8,
          paddingHorizontal: 18,
          marginRight: 10,
          marginBottom: 2,
          borderWidth: selectedSubcategory === sub ? 2 : 0,
          borderColor: selectedSubcategory === sub ? '#007aff' : 'transparent',
          elevation: selectedSubcategory === sub ? 6 : 2,
          shadowColor: selectedSubcategory === sub ? '#43C6AC' : '#aaa',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: selectedSubcategory === sub ? 0.25 : 0.12,
          shadowRadius: 8,
          transform: [{ scale: selectedSubcategory === sub ? 1.08 : 1 }],
        }}
        onPress={() => onSelect(sub)}
      >
        <Text style={{ color: selectedSubcategory === sub ? '#fff' : '#333', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }}>{sub.length > 24 ? sub.slice(0, 24) + '…' : sub}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default SubcategoryChips;
