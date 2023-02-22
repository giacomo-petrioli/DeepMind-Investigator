import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, TouchableOpacity, AsyncStorage, Keyboard } from 'react-native';
import { useNavigation } from "@react-navigation/native"
import { TextInput } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword, } from "../firebase/firebase-auth";
import { firebaseConfig } from "../firebase-config";
import { initializeApp } from "../firebase/firebase-app";

export default function LoginScreen() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  const navigation = useNavigation();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const [keyboardStatus, setKeyboardStatus] = useState(true);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(false);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(true);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        uploadCredentials();
        navigation.navigate("Home");
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      })
  }

  async function uploadCredentials() {
    try {
      await AsyncStorage.setItem('Email', email);
      await AsyncStorage.setItem('Password', password);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  return (
    <View style={styles.container}>
      {keyboardStatus ?
        <Text style={{ color: '#333647', fontWeight: 'bold', fontSize: 60, position: 'absolute', top: 100, textAlign: 'center' }}>Welcome{"\n"}DeepDream Detective</Text>
        :
        <View />
      }
      <Text>{keyboardStatus}</Text>
      <View style={styles.loginContainer}>
        <TextInput
          label="Email"
          placeholder='Enter the Email'
          theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
          underlineStyle={{ backgroundColor: 'transparent' }}
          style={styles.textInput}
          onChangeText={setEmail}
          value={email}
        />
        <Text />
        <TextInput
          label="Password"
          placeholder='Enter the Password'
          theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
          underlineStyle={{ backgroundColor: 'transparent' }}
          style={styles.textInput}
          onChangeText={setPassword}
          value={password}
        />
        <Text />
        <TouchableOpacity style={styles.loginButton} onPress={() => handleSignIn()}>
          <Text style={{ fontSize: 23, textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Sign Up</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', color: '#6A5BE2', marginTop: 10, fontWeight: 'bold', fontSize: 13 }}>Forgot Password</Text>
        <Text style={{ position: 'absolute', bottom: 15, textAlign: 'center', color: '#9F9DB3' }}>Don't have an account?<Text style={{ color: '#6A5BE2' }} onPress={() => navigation.navigate("Register")}> Register!</Text></Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    minWidth: 200,
    textAlign: 'center'
  },
  loginContainer: {
    backgroundColor: 'transparent',
    height: Dimensions.get("window").height * 0.6,
    width: Dimensions.get("window").width - 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    alignItems: 'center'
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    width: Dimensions.get("window").width - 30,
    height: 60,
    borderRadius: 5,
  },
  loginButton: {
    width: Dimensions.get("window").width - 30,
    backgroundColor: '#6A5BE2',
    borderRadius: 5,
    padding: 15,
    marginTop: 5
  }
});