import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { questions as importedQuestions } from '../questions';

export default function QuizScreen() {
  const router = useRouter();
  const questions = importedQuestions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    computeScore();
  }, [selected]);

  const computeScore = () => {
    let s = 0;
    for (const q of questions) {
      const sel = selected[q.id];
      if (q.type === 'checkbox') {
        if (!Array.isArray(sel)) continue;
        const correct = Array.isArray(q.answer) ? q.answer.slice().sort() : [];
        const picked = sel.slice().sort();
        if (JSON.stringify(correct) === JSON.stringify(picked)) s += 1;
      } else {
        if (sel && sel === q.answer) s += 1;
      }
    }
    setScore(s);
  };

  const toggleChoice = (q, key) => {
    if (q.type === 'checkbox') {
      const prev = Array.isArray(selected[q.id]) ? selected[q.id] : [];
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      setSelected({ ...selected, [q.id]: next });
    } else {
      setSelected({ ...selected, [q.id]: key });
    }
  };

  const goNext = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    // finish: store last and highest
    try {
      await AsyncStorage.setItem('quiz_last_score', String(score));
      const highest = parseInt((await AsyncStorage.getItem('quiz_highest_score')) || '0', 10);
      if (score > highest) {
        await AsyncStorage.setItem('quiz_highest_score', String(score));
      }
    } catch (e) {}

    router.push('/results');
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const q = questions[index];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.counter}>Question {index + 1} / {questions.length}</Text>
      <Text style={styles.question}>{q.question}</Text>

      <View style={styles.choices}>
        {Object.entries(q.choices).map(([key, txt]) => {
          const picked = q.type === 'checkbox'
            ? Array.isArray(selected[q.id]) && selected[q.id].includes(key)
            : selected[q.id] === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.choice, picked ? styles.choicePicked : null]}
              onPress={() => toggleChoice(q, key)}
            >
              <Text style={styles.choiceText}>{key}. {txt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navButton, index === 0 && styles.disabled]} onPress={goPrev} disabled={index === 0}>
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.score}>Score: {score}</Text>

        <TouchableOpacity style={styles.navButton} onPress={goNext}>
          <Text style={styles.navText}>{index === questions.length - 1 ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, flexGrow: 1 },
  counter: { fontSize: 14, marginBottom: 8 },
  question: { fontSize: 20, marginBottom: 16 },
  choices: { marginBottom: 24 },
  choice: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  choiceText: { fontSize: 16 },
  choicePicked: { backgroundColor: '#e6f0ff', borderColor: '#007AFF' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#007AFF', borderRadius: 8 },
  navText: { color: '#fff' },
  disabled: { backgroundColor: '#aaa' },
  score: { fontSize: 16 },
});
