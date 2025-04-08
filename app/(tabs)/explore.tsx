// Nouvelle approche : affichage du mois avec chevrons < > pour navigation

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { ScrollView } from 'react-native-gesture-handler';
dayjs.extend(isBetween);


const screenWidth = Dimensions.get('window').width;
const totalMonthsPast = 18;
const totalMonthsFuture = 18;

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const [moodMap, setMoodMap] = useState<Map<string, string>>(new Map());
  const [hasFakeDates, setHasFakeDates] = useState(false);
  const [months, setMonths] = useState<{ label: string; weeks: (string | null)[][] }[]>([]);
  const [activeIndex, setActiveIndex] = useState(totalMonthsPast);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [thisMonthStats, setThisMonthStats] = useState({ count: 0, total: 0 });
  const [deltaMinutes, setDeltaMinutes] = useState<number | null>(null);
  console.log("Je suis dans l'écran exolore")
  const fetchReadingStats = async () => {  //pour aller fetch les stats de lecture propre à l'utilisateur pour le mois courant et dernier pour utiliser lors de l'affichage !
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
  
      const res = await fetch('https://flownest.onrender.com/api/reading-sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error('Erreur sessions lecture :', data);
        return;
      }
  
      const now = dayjs();
      const startOfThisMonth = now.startOf('month');
      const startOfLastMonth = now.subtract(1, 'month').startOf('month');
      const endOfLastMonth = now.startOf('month');
  
      let thisMonthCount = 0; //nombre de sessions de lecture ce mois-ci en occcurrence
      let thisMonthTotal = 0; //durée totale de lecture ce mois-ci en minutes
      let lastMonthTotal = 0; //durée totale de lecture le mois dernier en minutes
  
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
    }
  };
  

  useEffect(() => {
    fetchMoodHistory();
    generateMonths();
    fetchReadingStats();
  }, []);

  useEffect(() => {
    if (months.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: totalMonthsPast, animated: false });
    }
  }, [months]);

  const fetchMoodHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('https://flownest.onrender.com/api/moods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur API:', data);
        return;
      }

      const map = new Map<string, string>();
      data.forEach((item: { date: string; mood: string }) => {
        map.set(item.date, item.mood);
      });
      setMoodMap(map);

      setHasFakeDates(
        data.some((item: { date: string }) => dayjs(item.date).isAfter(dayjs()))
      );
    } catch (error) {
      console.error('❌ fetchMoodHistory error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFakeDates = async () => {
    try {
      await fetchMoodHistory();
    } catch (err) {
      console.error('Erreur suppression des dates fake :', err);
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
      case '🤩': return '#22c55e'; // vert vif - euphorique
      case '🙂': return '#a3e635'; // vert citron - content
      case '😐': return '#facc15'; // jaune - neutre
      case '😕': return '#fcd34d'; // jaune doux - un peu mal
      case '😣': return '#f97316'; // orange - stressé
      case '😢': return '#ef4444'; // rouge - très triste
      case '😡': return '#dc2626'; // rouge foncé - en colère
      case '🥱': return '#94a3b8'; // gris bleuté - fatigué
      default: return 'transparent';
    }
  };
  

  const renderMonth = ({ item }: { item: { label: string; weeks: (string | null)[][] } }) => (
    <View style={[styles.monthContainer, { width: screenWidth }]}>
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView style={[styles.container, { backgroundColor }]}>
    <ScrollView>
      {/* Section mood ! */}
      <View style={[styles.item]}>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMoodHistory();
              }}
              tintColor={textColor}
            />
          }
        />
      </View>

      {/* 📖 Nouvelle section lecture du mois ici */}
      <View style={[styles.item]}>
        <Text style={[styles.title, { color: textColor, marginTop: 32 }]}>📖 Lecture du mois !</Text>

        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <Text style={{ color: textColor, fontSize: 16 }}>
            Ce mois-ci, vous avez lu {thisMonthStats.count} fois, pour un total de {thisMonthStats.total} minutes.
          </Text>
          {deltaMinutes !== null && (
            <Text style={{ color: deltaMinutes >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign:'center', marginTop: 8 }}>
              {deltaMinutes >= 0
                ? `🔺 ${deltaMinutes} minutes de plus que le mois dernier !`
                : `🔻 ${Math.abs(deltaMinutes)} minutes de moins que le mois dernier.`}
            </Text>
          )}
        </View>
      </View>


      {/* Section travail du mois ici */}
      <View style={[styles.item]}>
        <Text style={[styles.title, { color: textColor, marginTop: 32 }]}>💯 Travail du mois !</Text>

        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <Text style={{ color: textColor, fontSize: 16 }}>
            Ce mois-ci, vous avez fait {thisMonthStats.count} séance de sport. Votre sport préféré du mois étant ... , pour un total de {thisMonthStats.total} minutes.
          </Text>
          {deltaMinutes !== null && (
            <Text style={{ color: deltaMinutes >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign:'center', marginTop: 8 }}>
                  {deltaMinutes > 0
                      ? `🔺 ${deltaMinutes} minutes de plus que le mois dernier !`
                      : deltaMinutes < 0
                      ? `🔻 ${Math.abs(deltaMinutes)} minutes de moins que le mois dernier.`
                      : `📊 Autant que le mois dernier !`}
            </Text>
          )}
        </View>
      </View>

      {/* Section sport du mois ici */}
      <View style={[styles.item]}>
        <Text style={[styles.title, { color: textColor, marginTop: 32 }]}>🏅 Sport du mois !</Text>

        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <Text style={{ color: textColor, fontSize: 16 }}>
            Ce mois-ci, vous avez fait {thisMonthStats.count} séance de sport. Votre sport préféré du mois étant ... , pour un total de {thisMonthStats.total} minutes.
          </Text>
          {deltaMinutes !== null && (
            <Text style={{ color: deltaMinutes >= 0 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign:'center', marginTop: 8 }}>
              {deltaMinutes >= 0
                ? `🔺 ${deltaMinutes} minutes de plus que le mois dernier !`
                : `🔻 ${Math.abs(deltaMinutes)} minutes de moins que le mois dernier.`}
            </Text>
          )}
        </View>
      </View>


   {/* Section sport du mois ici */}
   <View style={[styles.item]}>
        <Text style={[styles.title, { color: textColor, marginTop: 32 }]}>Section d'après !!</Text>

        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <Text style={{ color: textColor, fontSize: 16 }}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus, aut!
          </Text>
        </View>
      </View>


      </ScrollView>  
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },

  item: {
    gap: 0,

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