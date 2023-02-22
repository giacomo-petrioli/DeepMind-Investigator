import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View, Image, Text, TouchableOpacity, ImageBackground, ScrollView, RefreshControl } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation , NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Swiper from "react-native-swiper";

import { getAuth } from "../firebase/firebase-auth";
import { getDatabase, ref, child, get, set } from "../firebase/firebase-database";

export default function HomeScreen() {

  var [user, setUser] = useState('');
  var [points, setPoints] = useState(0);
  var [leagueUrl, setLeagueUrl] = useState('../Images/league_bronze.png');
  var [gems, setGems] = useState(0);
  var [energy, setEnergy] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  var [images, setImages] = useState([require("../Images/1.png"), require("../Images/2.png"), require("../Images/3.png"), require("../Images/4.png"), require("../Images/5.png"), require("../Images/6.png"), require("../Images/7.png"), require("../Images/8.png"), require("../Images/9.png"), require("../Images/10.png"),]);

  const navigation = useNavigation();

  useEffect(() => {
    getUserData();
  }, [])

  function getUserData() {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser)
    } else {
      console.log("No User")
    }

    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + currentUser.displayName)).then((snapshot) => {
      if (snapshot.exists()) {
        setPoints(points => snapshot.val().pt);
        setGems(gems => snapshot.val().g);
        setEnergy(energy => snapshot.val().e);
        if (snapshot.val().e < 10) {
          let prevDate = new Date(snapshot.val().d);
          let newDate = new Date();
          let energyToAdd = snapshot.val().e + parseInt((((newDate - prevDate) / 1000).toFixed(0) / 60).toFixed(0));
          const db = getDatabase();
          console.log(energyToAdd);
          if (energyToAdd >= 10) {
            set(ref(db, currentUser.displayName + '/'), {
              d: new Date().toString(),
              e: 10,
              g: snapshot.val().g,
              pt: snapshot.val().pt
            });
            setEnergy(10);
          } else {
            set(ref(db, currentUser.displayName + '/'), {
              d: new Date().toString(),
              e: energyToAdd,
              g: snapshot.val().g,
              pt: snapshot.val().pt
            });
            setEnergy(energyToAdd);
          }
        }
        if (snapshot.val().pt > 700) setLeagueUrl(require("../Images/league_legend.png"));
        else if (snapshot.val().pt > 600) setLeagueUrl(require("../Images/league_champion.png"));
        else if (snapshot.val().pt > 500) setLeagueUrl(require("../Images/league_elite.png"));
        else if (snapshot.val().pt > 400) setLeagueUrl(require("../Images/league_crystal.png"));
        else if (snapshot.val().pt > 300) setLeagueUrl(require("../Images/league_silver.png"));
        else if (snapshot.val().pt > 200) setLeagueUrl(require("../Images/league_bronze.png"));
        else if (snapshot.val().pt > 100) setLeagueUrl(require("../Images/league_stone.png"));
        else setLeagueUrl(require("../Images/league_wood.png"));
      } else {
        setLeagueUrl(require("../Images/league_wood.png"));
        setPoints(points => 0);
      }
    }).catch((error) => {
      console.error(error);
    });

  }

  function refreshData() {
    setRefreshing(true);
    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + user.displayName)).then((snapshot) => {
      if (snapshot.exists()) {
        setPoints(points => snapshot.val().pt);
        setGems(gems => snapshot.val().g);
        setEnergy(energy => snapshot.val().e);
        setRefreshing(false);
      }
    }).catch((error) => {
      alert(error);
      console.error(error);
    });
  }

  function startGame() {
    navigation.navigate("Play")
  }
  return (
    <ImageBackground source={require("../Images/background_image.jpg")} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
        scrollEnabled={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={styles.energyContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={{ height: '100%', width: Dimensions.get("window").width * .09, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 20 }}>
              <MaterialIcons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}> {gems}</Text>
            <Image source={require("../Images/gem.png")} style={{ height: 60, width: 50, right: -10, position: 'absolute' }} />
          </View>
          <View style={[styles.energyContainer, { left: 25 }]}>
            <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={{ height: '100%', width: Dimensions.get("window").width * .09, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 20 }}>
              <MaterialIcons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{energy} / 10</Text>
            <MaterialIcons name="flash-on" size={46} color="#FFD50B" style={{ top: -2, right: -20, position: 'absolute' }} />
          </View>
        </View>
        <View style={styles.topBarContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={[styles.lateralBarItem, { marginRight: 5 }]}>
            <FontAwesome5 name={"user-alt"} color={"#0187EA"} size={40} />
          </TouchableOpacity>
          <View style={styles.centralBarItem}>
            <Image source={leagueUrl} style={{ width: 50, height: 50 }} />
            <Text style={{ fontSize: 25, fontWeight: 'bold', }}> {user.displayName}</Text>
            <View style={{ flexDirection: 'row', position: 'absolute', right: 0 }}>
              <Text style={{ fontSize: 25, fontWeight: 'bold', }}>{points} </Text>
              <AntDesign name="star" size={35} color="#0187EA" />
            </View>
          </View>
          <TouchableOpacity style={[styles.lateralBarItem, { marginLeft: 5 }]}>
            <Ionicons name="ios-settings-sharp" color={"#0187EA"} size={40} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 50 }} />
        <View style={{ backgroundColor: 'transparent', width: 300, height: 300, alignItems: 'center' }}>
          <Swiper
            key={images.length}
            autoplay={true}
            autoplayTimeout={5}
            width={300}
            height={300}
            showsPagination={false}
          >
            {images.map((url, index) => {
              return (
                <View key={index}>
                  <Image
                    source={url}
                    style={{ width: 300, height: 300, borderRadius: 10, elevation: 15 }}
                  />
                </View>
              );
            })}
          </Swiper>
        </View>
        <View style={{ height: 50 }} />
        <TouchableOpacity onPress={() => startGame()} style={{ backgroundColor: '#fff', borderRadius: 5, padding: 15, elevation: 15, paddingHorizontal: 50, }}>
          <Text style={{ color: 'black', fontSize: 50, fontWeight: 'bold', textAlign: 'center' }}>Play</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  )
}

function PlayScreen() {
  return(
    <View>
      <Text>Hele</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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