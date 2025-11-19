import { StyleSheet, View, Text } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>HappyMapper</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e71212ff' },
  header: {
    backgroundColor: '#F5EBE0',
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E8886B',
    letterSpacing: 1,
  },
});
