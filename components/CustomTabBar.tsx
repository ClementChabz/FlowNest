import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.tabBar}>
      <Pressable onPress={() => router.push('/')} style={styles.tab}>
        <Text style={pathname === '/' ? styles.active : styles.inactive}>🏠</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/explore')} style={styles.tab}>
        <Text style={pathname === '/explore' ? styles.active : styles.inactive}>🔍</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/lecture')} style={styles.tab}>
        <Text style={pathname === '/lecture' ? styles.active : styles.inactive}>📚</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  tab: {
    padding: 10,
  },
  active: {
    fontSize: 20,
    color: '#3b82f6',
  },
  inactive: {
    fontSize: 20,
    color: '#999',
  },
});
