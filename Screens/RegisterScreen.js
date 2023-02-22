import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import { TextInput } from 'react-native-paper';

import { getAuth, createUserWithEmailAndPassword, updateProfile } from "../firebase/firebase-auth";
import { firebaseConfig } from "../firebase-config";
import { initializeApp } from "../firebase/firebase-app";
import { getDatabase, ref, set, child, get } from "../firebase/firebase-database";

import { useNavigation } from "@react-navigation/native"

export default function RegisterScreen() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [username, setUsername] = useState("");

  var [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  var [missingEmail, setMissingEmail] = useState(false);
  var [missingPassword, setMissingPassword] = useState(false);
  var [missingUsername, setMissingUsername] = useState(false);

  const navigation = useNavigation();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  function handleCreateAccount() {

    if (email.length == 0) setMissingEmail(true);

    if (password.length == 0) setMissingPassword(true);

    if (username.length == 0) setMissingUsername(true);

    if ((email.length == 0) || (password.length == 0) || (username.length == 0)) return;

    if (!isUsernameAvailable) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then((user) => {
        uploadUsername();
        uploadCredentials();
        const auth = getAuth();
        updateProfile(auth.currentUser, {
          displayName: username
        }).then(() => {

        }).catch((error) => {
          alert(error);
          console.log(error);
        });
        navigation.navigate("Home");
      })
      .catch(error => {
        console.log(error);
        alert(error);
      })

  }

  async function uploadUsername() {
    const db = getDatabase();
    set(ref(db, username + '/'), {
      pt: 0
    });
  }

  async function readUsernames(text) {
    const dbRef = ref(getDatabase());
    setUsername(username => text);
    get(child(dbRef, '/')).then((snapshot) => {
      if (snapshot.exists()) {
        let matchFound = Object.keys(snapshot.val()).some(key => key === text);
        setIsUsernameAvailable(!matchFound);
      } else {

      }
    }).catch((error) => {
      console.error(error);
    });
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
    <View style={{ flex: 1, backgroundColor: "#fff", alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        label="Username"
        placeholder='Enter your Username'
        theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
        underlineStyle={{ backgroundColor: 'transparent' }}
        style={styles.textInput}
        onChangeText={(text) => readUsernames(text)}
        value={username}
        maxLength={11}
      />
      {username.length == 0 ?
        missingUsername ? <Text style={{ marginBottom: 5 }}>Enter the Username</Text> : <Text /> :
        <Text style={{ textAlign: 'justify', marginBottom: 5 }}>{username} {isUsernameAvailable ? "is" : "isn't"} available</Text>
      }
      <TextInput
        label="Email"
        placeholder='Enter your Email'
        theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
        underlineStyle={{ backgroundColor: 'transparent' }}
        style={styles.textInput}
        onChangeText={setEmail}
        value={email}
      />
      {missingEmail && email.length == 0 ? <Text style={{ marginBottom: 5 }}>Enter the Email</Text> : <Text />}
      <TextInput
        label="Password"
        placeholder='Enter your Password'
        theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
        underlineStyle={{ backgroundColor: 'transparent' }}
        style={styles.textInput}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      {missingPassword && password.length == 0 ? <Text style={{ marginBottom: 5 }}>Enter the Password</Text> : <Text />}
      <TouchableOpacity style={styles.loginButton} onPress={() => handleCreateAccount()}>
        <Text style={{ fontSize: 23, textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Create Account</Text>
      </TouchableOpacity>
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