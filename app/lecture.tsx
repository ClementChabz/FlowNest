import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export default function LectureScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        📚 Définis ton temps de lecture
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});
