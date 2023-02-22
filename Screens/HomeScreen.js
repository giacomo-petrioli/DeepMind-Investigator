import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View, Image, Button, Text, TouchableOpacity, TextInput, ImageBackground, ScrollView, RefreshControl } from 'react-native';
import { data } from "../data";
import * as stringSimilarity from "string-similarity";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { getAuth } from "../firebase/firebase-auth";
import { getDatabase, ref, child, get, set } from "../firebase/firebase-database";

import ProfileScreen from './ProfileScreen';
import LeaderboardScreen from './LeaderboardScreen';
import HomeScreen from './LobbyScreen';

function EventScreen() {

  var [prompt, setPrompt] = useState();
  var [imageUrl, setImageUrl] = useState();

  var [userText, onChangeuserText] = useState('');

  useEffect(() => {
    generateNewImage();
  }, [])

  function generateNewImage() {
    var randomNumber = Math.floor(Math.random() * 1000);
    const values = Object.keys(data);
    var name = values[randomNumber];
    setImageUrl(imageUrl => data[values[randomNumber]][0])
    setPrompt(prompt => values[randomNumber]);
  }

  function comparePrompts() {
    var similarity = stringSimilarity.compareTwoStrings(prompt, userText);
    generateNewImage();
    console.log(similarity)
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{prompt}</Text>
      <Image
        style={styles.image}
        source={{
          uri: imageUrl,
        }}
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeuserText}
        value={userText}
        onSubmitEditing={() => comparePrompts()}
      />
      <Button title='Compare Prompt' onPress={() => comparePrompts()} />
    </View>
  );
}

function ShopScreen() {
  
  var [gems, setGems] = useState(0);
  var [energy, setEnergy] = useState(0);

  useEffect(() => {
    refreshData();
  }, [])

  function refreshData() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + currentUser.displayName)).then((snapshot) => {
      if (snapshot.exists()) {
        setGems(gems => snapshot.val().g);
        setEnergy(energy => snapshot.val().e);
      }
    }).catch((error) => {
      alert(error);
      console.error(error);
    });
  }

  function addGems(amount) {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + currentUser.displayName)).then((snapshot) => {
      if (snapshot.exists()) {
        const db = getDatabase();
        set(ref(db, currentUser.displayName + '/'), {
          d: snapshot.val().d,
          e: snapshot.val().e,
          g: snapshot.val().g + amount,
          pt: snapshot.val().pt
        });
        setGems(gems + amount);
      }
    }).catch((error) => {
      alert(error);
      console.error(error);
    });
  }

  function buyEnergy() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + currentUser.displayName)).then((snapshot) => {
      if (snapshot.exists()) {
        const db = getDatabase();
        if (snapshot.val().g > 10) {
          set(ref(db, currentUser.displayName + '/'), {
            d: snapshot.val().d,
            e: snapshot.val().e + 10,
            g: snapshot.val().g - 10,
            pt: snapshot.val().pt
          });
        } else alert("Troppe poche gemme")
        setGems(gems - 10);
        setEnergy(energy + 10);
      }
    }).catch((error) => {
      alert(error);
      console.error(error);
    });
  }

  return (
    <ImageBackground source={require("../Images/background_image.jpg")} style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View style={styles.energyContainer}>
          <TouchableOpacity style={{ height: '100%', width: Dimensions.get("window").width * .09, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 20 }}>
            <MaterialIcons name="add" size={35} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}> {gems}</Text>
          <Image source={require("../Images/gem.png")} style={{ height: 60, width: 50, right: -10, position: 'absolute' }} />
        </View>
        <View style={[styles.energyContainer, { left: 25 }]}>
          <TouchableOpacity style={{ height: '100%', width: Dimensions.get("window").width * .09, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 20 }}>
            <MaterialIcons name="add" size={35} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{energy} / 10</Text>
          <MaterialIcons name="flash-on" size={46} color="#FFD50B" style={{ top: -2, right: -20, position: 'absolute' }} />
        </View>
      </View>
      <View style={{ width: Dimensions.get("window").width - 20, height: Dimensions.get("window").height * .75, backgroundColor: '#EEEEFC', position: 'absolute', bottom: 50, borderRadius: 20, alignItems: 'center' }}>
        <View style={{ width: '60%', height: 75, backgroundColor: '#EFAE2C', elevation: 15, borderRadius: 15, top: -37.5, justifyContent: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 40, textAlign: 'center', color: '#fff' }}>SHOP</Text>
          <View style={{ backgroundColor: '#BD7628', width: 20, height: 20, borderRadius: 10, position: 'absolute', left: 15 }} />
          <View style={{ backgroundColor: '#BD7628', width: 20, height: 20, borderRadius: 10, position: 'absolute', right: 15 }} />
        </View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 20, marginTop: -27.5 }} showsVerticalScrollIndicator={false}>
          <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 10 }}>GEMS</Text>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => addGems(100)} style={{ width: 150, paddingVertical: 10, backgroundColor: '#fff', alignItems: 'center', borderRadius: 15, elevation: 15, marginRight: 30 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>100 Gems</Text>
              <Image source={require("../Images/gem.png")} style={{ width: 90, height: 90 }} />
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>9.99$</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addGems(300)} style={{ width: 150, paddingVertical: 10, backgroundColor: '#fff', alignItems: 'center', borderRadius: 15, elevation: 15 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>300 Gems</Text>
              <Image source={require("../Images/gem.png")} style={{ width: 90, height: 90 }} />
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>19.99$</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 10, marginTop: 10 }}>ENERGY</Text>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity style={{ width: 150, paddingVertical: 10, backgroundColor: '#fff', alignItems: 'center', borderRadius: 15, marginRight: 30, elevation: 15 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>1 Energy</Text>
              <MaterialIcons name="flash-on" size={85} color="#FFD50B" style={{ elevation: 30 }} />
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>📽️ Watch ad</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => buyEnergy()} style={{ width: 150, paddingVertical: 10, backgroundColor: '#fff', alignItems: 'center', borderRadius: 15, elevation: 15 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>10 Energy</Text>
              <MaterialIcons name="flash-on" size={85} color="#FFD50B" style={{ elevation: 30 }} />
              <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>10 <Image source={require("../Images/gem.png")} style={{ width: 30, height: 30 }} /></Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#fff', paddingHorizontal: 20, height: 50, borderRadius: 30, justifyContent: 'center', marginTop: 30, elevation: 15, marginBottom: 15 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>🚫 Remove the Ads</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

    </ImageBackground>
  )
}

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -30,
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onPress={onPress}
    >
      <View style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#0187EA"
      }}>
        {children}
      </View>
    </TouchableOpacity>
  )
}

const Tab = createBottomTabNavigator();

export default function HomeScreenContainer() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 90,
          borderTopWidth: 0,
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 1,
          shadowRadius: 16.0,
          elevation: 24,
        }
      }}>
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? "shopping" : "shopping-outline"}
              color={focused ? "#0187EA" : "#D3D3D3"}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name={"leaderboard"}
              color={focused ? "#0187EA" : "#D3D3D3"}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name={"home"}
              color={"#fff"}
              size={25}
            />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        //initialParams={{ navigatione: navigation.navigate("Login") }}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name={focused ? "user-alt" : "user"}
              color={focused ? "#0187EA" : "#D3D3D3"}
              size={25}
            />
          )
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "calendar-sharp" : "calendar-outline"}
              color={focused ? "#0187EA" : "#D3D3D3"}
              size={25}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: Dimensions.get("window").width,
    height: undefined,
    aspectRatio: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    minWidth: 200,
    textAlign: 'center'
  },
  topBarContainer: {
    width: Dimensions.get("window").width * .9 + 10,
    height: Dimensions.get("window").width * .9 * .2,
    flexDirection: 'row',
    marginTop: 30,
  },
  lateralBarItem: {
    width: "18.5%",
    borderRadius: 10,
    backgroundColor: "#fff",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15
  },
  centralBarItem: {
    width: "60%",
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5
  },
  energyContainer: {
    backgroundColor: '#fff',
    width: Dimensions.get("window").width * .3,
    height: 40,
    flexDirection: 'row',
    marginTop: 50,
    borderRadius: 10,
    alignItems: 'center',
    overflow: "visible"
  }
});