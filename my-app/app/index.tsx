import { StyleSheet, Text, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useEffect } from 'react';


export default function HomeScreen() {
  // return (
  //   <View style={styles.container}>
  //     <Text style={styles.text}>HappyMapper First Screen</Text>
  //   </View>
  // );

  // debuggging firebase connection
  useEffect(() => {
    firestore().collection('ping').limit(1).get()
      .then(() => console.log('Firestore OK'))
      .catch(e => console.log('Firestore ERR', e));
  }, []);
  return <View styles={ styles.container }><Text>Home page, testing firebase connection, check logs</Text></View>;
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
