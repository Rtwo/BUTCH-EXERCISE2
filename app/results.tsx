import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Results() {
  const router = useRouter();
  const [last, setLast] = useState<number | null>(null);
  const [highest, setHighest] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const l = await AsyncStorage.getItem('quiz_last_score');
        const h = await AsyncStorage.getItem('quiz_highest_score');
        setLast(l !== null ? Number(l) : 0);
        setHighest(h !== null ? Number(h) : 0);
      } catch (error) {
        // ignore
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.line}>Your score: {last ?? '-'}</Text>
      <Text style={styles.line}>Highest score: {highest ?? '-'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 16 },
  line: { fontSize: 18, marginBottom: 8 },
  button: { marginTop: 20, backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff' },
});
