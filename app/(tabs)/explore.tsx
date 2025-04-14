import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import LottieView from 'lottie-react-native';
import Carousel from 'react-native-reanimated-carousel';

dayjs.extend(isBetween);

const screenWidth = Dimensions.get('window').width;
const totalMonthsPast = 18;
const totalMonthsFuture = 18;

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#d4d4d4' : '#2e2e2e';

  const [moodMap, setMoodMap] = useState<Map<string, string>>(new Map());
  const [months, setMonths] = useState<{ label: string; weeks: (string | null)[][] }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(totalMonthsPast);
  const [loadingMoods, setLoadingMoods] = useState(true);
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [thisMonthStats, setThisMonthStats] = useState({ count: 0, total: 0 });
  const [deltaMinutes, setDeltaMinutes] = useState<number | null>(null);

  useEffect(() => {
    fetchMoodHistory();
    generateMonths();
    fetchReadingStats();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      setLoadingMoods(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://flownest.onrender.com/api/moods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const map = new Map<string, string>();
      data.forEach(({ date, mood }: { date: string; mood: string }) => map.set(date, mood));
      setMoodMap(map);
    } catch (error) {
      console.error('❌ fetchMoodHistory error:', error);
    } finally {
      setLoadingMoods(false);
    }
  };

  const fetchReadingStats = async () => {
    try {
      setLoadingStats(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://flownest.onrender.com/api/reading-sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const now = dayjs();
      const startOfThisMonth = now.startOf('month');
      const startOfLastMonth = now.subtract(1, 'month').startOf('month');
      const endOfLastMonth = now.startOf('month');
      let thisMonthCount = 0;
      let thisMonthTotal = 0;
      let lastMonthTotal = 0;
      data.forEach((session: { startedAt: string; duration: number }) => {
        const date = dayjs(session.startedAt);
        if (date.isAfter(startOfThisMonth)) {
          thisMonthCount++;
          thisMonthTotal += session.duration;
        } else if (date.isBetween(startOfLastMonth, endOfLastMonth, null, '[)')) {
          lastMonthTotal += session.duration;
        }
      });
      setThisMonthStats({ count: thisMonthCount, total: thisMonthTotal });
      setDeltaMinutes(thisMonthTotal - lastMonthTotal);
    } catch (err) {
      console.error('❌ Erreur fetchReadingStats :', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const generateMonthGrid = (offset: number): { label: string; weeks: (string | null)[][] } => {
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
    const generated: { label: string; weeks: (string | null)[][] }[] = [];
    for (let i = -totalMonthsPast; i <= totalMonthsFuture; i++) {
      generated.push(generateMonthGrid(i));
    }
    setMonths(generated);
    setLoadingMonths(false);
  };

  const moodColor = (mood: string) => {
    switch (mood) {
      case '🤩': return '#22c55e';
      case '🙂': return '#a3e635';
      case '😐': return '#facc15';
      case '😕': return '#fcd34d';
      case '😣': return '#f97316';
      case '😢': return '#ef4444';
      case '😡': return '#dc2626';
      case '🥱': return '#94a3b8';
      default: return 'transparent';
    }
  };

  const renderMonth = (item: { label: string; weeks: (string | null)[][] }) => (
    <View key={item.label} style={styles.monthContainer}>
      <Text style={styles.monthLabel}>{item.label}</Text>
      {item.weeks.map((week, i) => (
        <View key={i} style={styles.weekRow}>
          {week.map((date, j) => {
            const mood = date ? moodMap.get(date) ?? '' : '';
            return (
              <View
                key={j}
                style={[styles.dayCell, {
                  backgroundColor: date ? moodColor(mood) : 'transparent',
                  borderWidth: date ? 1 : 0,
                  borderColor: isDark ? '#333' : '#ccc',
                }]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );

  const isLoading = loadingMoods || loadingMonths || loadingStats;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ minHeight: 750, justifyContent: isLoading ? 'center' : 'flex-start' }}>
          {isLoading ? (
            <SplashScreen backgroundColor={backgroundColor} />
          ) : (
            <>
              <View style={styles.itemcontainer}>
                <Text style={[styles.title, { color: textColor }]}>🧠 Historique des humeurs</Text>
                <Carousel
                  width={screenWidth}
                  height={300}
                  data={months}
                  scrollAnimationDuration={400}
                  onSnapToItem={setActiveIndex}
                  renderItem={({ item }) => renderMonth(item)}
                  loop={false}
                  defaultIndex={totalMonthsPast}
                />
              </View>

              <View style={styles.itemcontainer}>
                <Text style={[styles.itemtitle, { color: textColor }]}>📖 Lecture du mois !</Text>
                <View style={styles.itembody}>
                  <Text style={{ color: textColor, fontSize: 16 }}>
                    Ce mois-ci, vous avez lu {thisMonthStats.count} fois, pour un total de {thisMonthStats.total} minutes.
                  </Text>
                  {deltaMinutes !== null && (
                    <Text style={{
                      color: deltaMinutes >= 0 ? '#22c55e' : '#ef4444',
                      fontSize: 14,
                      textAlign: 'center',
                      marginTop: 8
                    }}>
                      {deltaMinutes >= 0
                        ? `🔺 ${deltaMinutes} minutes de plus que le mois dernier !`
                        : `🔻 ${Math.abs(deltaMinutes)} minutes de moins que le mois dernier.`}
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 25,
    textAlign: 'center',
  },
  itemcontainer: {
    padding: 12,
    width: '95%',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  itemtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itembody: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  monthContainer: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#888',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dayCell: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
});

const SplashScreen = ({ backgroundColor }: { backgroundColor: string }) => (
  <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
    <LottieView
      source={require('../../assets/lottie/loading.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
    <Text style={{ marginTop: 20, fontSize: 18, color: '#888' }}>
      Chargement des statistiques de ton profil
    </Text>
  </View>
);
