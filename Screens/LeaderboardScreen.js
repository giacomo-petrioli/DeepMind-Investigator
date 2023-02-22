import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, Image, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileViewer from './ProfileViewer';

import { getAuth } from "../firebase/firebase-auth";
import { getDatabase, ref, child, get } from "../firebase/firebase-database";

function MainLeaderboardScreen() {
  var [users, setUsers] = useState([]);
  var [user, setUser] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser)
    } else {
      console.log("No User")
    }

    const dbRef = ref(getDatabase());
    get(child(dbRef, '/')).then((snapshot) => {
      if (snapshot.exists()) {
        const array = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value }));
        array.sort((a, b) => b.pt - a.pt);
        setUsers(array);
      } else {

      }
    }).catch((error) => {
      console.error(error);
    });
  }, [])
  return (
    <ImageBackground source={require("../Images/background_image.jpg")} style={styles.container}>
      <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 60, position: 'absolute', top: 100, textAlign: 'center', top: 75 }}>Gloabal{"\n"}Leaderboard</Text>
      <View style={styles.leaderboardContainer}>
        <ScrollView contentContainerStyle={{ borderRadius: 50 }} showsVerticalScrollIndicator={false}>
          {users.map((item, index) => {
            return (
              <LeaderboardComponent key={index} rank={index} name={item.key} points={item.pt} navigation={navigation} userName={user.displayName} />
            );
          })}
          <View style={{ height: 45 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  )
}

function LeaderboardComponent(props) {

  var [leagueUrl, setLeagueUrl] = useState('../Images/league_bronze.png');

  useEffect(() => {
    if (props.points > 700) setLeagueUrl(require("../Images/league_legend.png"));
    else if (props.points > 600) setLeagueUrl(require("../Images/league_champion.png"));
    else if (props.points > 500) setLeagueUrl(require("../Images/league_elite.png"));
    else if (props.points > 400) setLeagueUrl(require("../Images/league_crystal.png"));
    else if (props.points > 300) setLeagueUrl(require("../Images/league_silver.png"));
    else if (props.points > 200) setLeagueUrl(require("../Images/league_bronze.png"));
    else if (props.points > 100) setLeagueUrl(require("../Images/league_stone.png"));
    else setLeagueUrl(require("../Images/league_wood.png"));
  }, [])

  return (
    <TouchableOpacity onPress={() => props.navigation.navigate("ViewProfile", { data: props })} style={{ backgroundColor: props.userName == props.name ? "#f5f5f5" : '#fff', width: Dimensions.get("window").width - 40, height: 75, marginTop: 10, borderRadius: 30, alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', paddingHorizontal: 15 }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', minWidth: 40 }}>{props.rank + 1}.</Text>
      <Image source={leagueUrl} style={{ width: 50, height: 50 }} />
      <Text style={{ fontSize: 25, fontWeight: 'bold', }}> {props.name}</Text>
      <View style={{ flexDirection: 'row', right: 10, position: 'absolute', padding: 5 }}>
        <Text style={{ fontSize: 25, textAlign: 'right' }}>{props.points} </Text>
        <AntDesign name="star" size={35} color="#0187EA" />
      </View>
    </TouchableOpacity>
  )
}

const Stack = createNativeStackNavigator();

export default function LeaderboardScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={MainLeaderboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ViewProfile" component={ProfileViewer} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#6A5BE2'
  },
  leaderboardContainer: {
    backgroundColor: '#EEEEFC',
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height * 0.65,
    marginBottom: 50,
    borderRadius: 40,
    alignItems: 'center',
    overflow: 'hidden',
  }
})