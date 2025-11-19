import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';


export default function HomeScreen() {
  useEffect(() => {
    console.log('Home screen loaded');
  }, []);

  return <View style={styles.container}><Text>Home page - Go to Upload tab to upload menus!</Text></View>;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#020911ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
