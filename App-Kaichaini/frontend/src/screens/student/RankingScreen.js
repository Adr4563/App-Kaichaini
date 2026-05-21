import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RankingScreen() {
  return (
    <View style={s.container}>
      <Text style={s.text}>Ranking</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text:      { fontSize: 20, fontWeight: '700', color: '#111' },
});
