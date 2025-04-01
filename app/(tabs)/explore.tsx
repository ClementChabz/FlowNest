// Nouvelle approche : affichage du mois avec chevrons < > pour navigation et données depuis MongoDB

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;
const totalMonthsPast = 18;
const totalMonthsFuture = 18;
const totalMonths = totalMonthsPast + totalMonthsFuture + 1;
const BACKEND_URL = 'https://flownest.onrender.com'; // 🔗 ton backend en ligne

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const [moodHistory, setMoodHistory] = useState<{ date: string; mood: string }[]>([]);
  const [months, setMonths] = useState<{ label: string; weeks: (string | null)[][] }[]>([]);
  const [activeIndex, setActiveIndex] = useState(totalMonthsPast);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMoodHistory();
    generateMonths();
  }, []);

  useEffect(() => {
    if (months.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: totalMonthsPast, animated: false });
    }
  }, [months]);

  const fetchMoodHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/moods`);
      const data = await res.json();
      setMoodHistory(data);
    } catch (error) {
      console.error('Erreur fetch moods MongoDB :', error);
    }
  };

  const generateMonthGrid = (offset: number) => {
    const start = dayjs().add(offset, 'month').startOf('month');
    const end = start.endOf('month');
    const startDay = start.day();
    const totalDays = end.date();
    const grid: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];
    const emptyStart = startDay === 0 ? 6 : startDay - 1;
    for (let i = 0; i < emptyStart; i++) currentWeek.push(null);
    for (let day = 1; day <= totalDays; day++) {
      const date = start.date(day).format('YYYY-MM-DD');
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      grid.push(currentWeek);
    }
    return {
      label: start.format('MMMM YYYY'),
      weeks: grid,
    };
  };

  const generateMonths = () => {
    const generated = [];
    for (let i = -totalMonthsPast; i <= totalMonthsFuture; i++) {
      generated.push(generateMonthGrid(i));
    }
    setMonths(generated);
  };

  const moodColor = (mood: string) => {
    switch (mood) {
      case '😄': return '#4ade80';
      case '😊': return '#a3e635';
      case '😐': return '#facc15';
      case '😔': return '#f97316';
      case '😢': return '#ef4444';
      default: return 'transparent';
    }
  };

  const renderMonth = ({ item }: { item: { label: string; weeks: (string | null)[][] } }) => (
    <View style={[styles.monthContainer, { width: screenWidth }]}> 
      {item.weeks.map((week, i) => (
        <View key={i} style={styles.weekRow}>
          {week.map((date, j) => {
            const mood = date ? (moodHistory.find((m) => m.date === date)?.mood ?? '') : '';
            return (
              <View
                key={j}
                style={[styles.dayCell, {
                  backgroundColor: date ? moodColor(mood) : 'transparent',
                  borderWidth: date ? 1 : 0,
                  borderColor: isDark ? '#333' : '#ccc',
                }]} />
            );
          })}
        </View>
      ))}
    </View>
  );

  const handlePrev = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: newIndex });
      setActiveIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < months.length - 1) {
      const newIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: newIndex });
      setActiveIndex(newIndex);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>🧠 Historique des humeurs</Text>

      <View style={styles.monthHeader}>
        <Pressable onPress={handlePrev}><Text style={{ color: textColor }}>{'<'}</Text></Pressable>
        <Text style={[styles.monthLabel, { color: textColor }]}> {months[activeIndex]?.label} </Text>
        <Pressable onPress={handleNext}><Text style={{ color: textColor }}>{'>'}</Text></Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={months}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderMonth}
        keyExtractor={(item) => item.label}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
        initialScrollIndex={totalMonthsPast}
        getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dayCell: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
});