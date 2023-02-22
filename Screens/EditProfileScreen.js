import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Image, Text, TouchableOpacity, AsyncStorage, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

import { getAuth, updateEmail, signInWithEmailAndPassword, updateProfile } from "../firebase/firebase-auth";
import { uploadBytes, getDownloadURL, getStorage, ref as sRef } from "../firebase/firebase-storage";
import { initializeApp } from "../firebase/firebase-app";
import { firebaseConfig } from "../firebase-config";

import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditProfileScreen() {
  var [email, setEmail] = useState("");
  var [oldEmail, setOldEmail] = useState("");
  var [password, setPassword] = useState("");

  const [image, setImage] = useState(null);
  var [imageUrl, setImageUrl] = useState("https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png");
  var [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute()

  const user = route.params?.user;

  useEffect(() => {
    setEmail(email => user.email);
    if (user.photoURL != null) setImageUrl(imageUrl => user.photoURL);
    getCredentails();
  }, [user])

  async function getCredentails() {
    try {
      const value = await AsyncStorage.getItem('Password');
      const value1 = await AsyncStorage.getItem('Email');
      if (value !== null) {
        setOldEmail(oldEmail => value1);
        setPassword(password => value);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function updateAccount() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, oldEmail, password)
      .then((user) => {

      })
      .catch((error) => {
        console.log(error);
      })

    if (user.email != email) {
      updateEmail(auth.currentUser, email).then(() => {
        setOldEmail(oldEmail => email);
      }).catch((error) => {
        console.log(error)
      });
    }
    if (imageUrl != "https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png") {
      updateProfile(auth.currentUser, {
        photoURL: imageUrl
      }).then(() => {

      }).catch((error) => {
        alert(error);
        console.log(error);
      });
    }
    navigation.navigate("UserProfile");
  }

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) return;

    setLoading(true);

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", result.assets[0].uri, true);
      xhr.send(null);
    });

    const fileRef = sRef(storage, user.displayName);
    const FireResult = await uploadBytes(fileRef, blob);

    blob.close();

    let downloadUrl = await getDownloadURL(fileRef);
    setImageUrl(downloadUrl);
    setLoading(false);
  };

  function goBackAndSaveProgress() {
    navigation.navigate("UserProfile");
    updateAccount();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => pickImage()}>
        <ActivityIndicator style={{ position: 'absolute', top: 50, left: 50, zIndex: 1 }} size={50} color="#0000ff" animating={loading} />
        <Image source={{ uri: imageUrl }} style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => goBackAndSaveProgress()} style={{ position: 'absolute', top: 50, left: 25 }}>
        <Ionicons name="arrow-back" size={40} color="black" />
      </TouchableOpacity>
      <TextInput
        label="Email"
        placeholder='Enter your new Email'
        theme={{ colors: { text: 'black', primary: '#9F9DB3' } }}
        underlineStyle={{ backgroundColor: 'transparent' }}
        style={styles.textInput}
        onChangeText={setEmail}
        value={email}
        autoCorrect={false}
      />
      <Text />
      <TouchableOpacity style={styles.loginButton} onPress={() => updateAccount()}>
        <Text style={{ fontSize: 23, textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Update Account</Text>
      </TouchableOpacity>
      <Text />
    </View>
  )
}

const styles = StyleSheet.create({
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