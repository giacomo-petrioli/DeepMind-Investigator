import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Image, Text, Platform, TouchableOpacity, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';

import { getAuth, signOut } from "../firebase/firebase-auth";
import { getDatabase, ref, child, get } from "../firebase/firebase-database";

import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfileScreen from './EditProfileScreen';

function UserProfileScreen({ route }) {

  var [user, setUser] = useState('');
  var [rank, setRank] = useState(1);
  var [points, setPoints] = useState('');
  var [leagueUrl, setLeagueUrl] = useState('../Images/league_bronze.png');

  const navigation = useNavigation();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfileInfo();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getProfileInfo()
  }, [])

  function getProfileInfo() {
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
        if (snapshot.val().pt > 700) setLeagueUrl(require("../Images/league_legend.png"));
        else if (snapshot.val().pt > 600) setLeagueUrl(require("../Images/league_champion.png"));
        else if (snapshot.val().pt > 500) setLeagueUrl(require("../Images/league_elite.png"));
        else if (snapshot.val().pt > 400) setLeagueUrl(require("../Images/league_crystal.png"));
        else if (snapshot.val().pt > 300) setLeagueUrl(require("../Images/league_silver.png"));
        else if (snapshot.val().pt > 200) setLeagueUrl(require("../Images/league_bronze.png"));
        else if (snapshot.val().pt > 100) setLeagueUrl(require("../Images/league_stone.png"));
        else setLeagueUrl(require("../Images/league_wood.png"));
      } else {
        console.log("no user found")
      }
    }).catch((error) => {
      console.error(error);
    });

    get(child(dbRef, '/')).then((snapshot) => {
      if (snapshot.exists()) {
        const array = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value }));
        array.sort((a, b) => b.pt - a.pt);
        array.map((item, index) => {
          if (item.key == currentUser.displayName) {
            setRank(index + 1);
            return;
          }
        })
      } else {

      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function logOutUser() {
    const auth = getAuth();
    signOut(auth).then(() => {
      navigation.navigate("Login");
    }).catch((error) => {
      alert(error);
      console.log(error);
    });
  }

  return (
    <ImageBackground source={require("../Images/background_image.jpg")} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: 'flex-end' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEnabled={false}
      >
        <TouchableOpacity onPress={() => navigation.navigate("EditUserProfile", { user: user })} style={{ position: 'absolute', top: (Dimensions.get("window").height * 0.3) / 2 - 20, right: 25 }}>
          <Feather name="edit" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => logOutUser()} style={{ position: 'absolute', top: (Dimensions.get("window").height * 0.3) / 2 - 20, left: 25 }}>
          <MaterialIcons name="logout" size={40} color="white" />
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <Image
            style={{ width: 100, height: 100, borderRadius: 50, top: -50, borderColor: '#000', borderWidth: 3 }}
            source={{
              uri: user.photoURL ? user.photoURL : 'https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png',
            }} />
          <Text style={{ fontSize: 40, fontWeight: 'bold', marginTop: -50, textAlign: 'center' }}>{user.displayName}</Text>
          <View style={styles.rankingContainer}>
            <View style={styles.pointsContainer}>
              <AntDesign name="staro" size={35} color="white" />
              <Text style={{ color: '#B0A4FF', top: 5 }}>POINTS</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', top: 5 }}>{points}</Text>
            </View>
            <View style={{ height: 70, width: 1, backgroundColor: 'white', top: 25 }} />
            <View style={styles.pointsContainer}>
              <AntDesign name="earth" size={35} color="white" />
              <Text style={{ color: '#B0A4FF', top: 5 }}>WORLD RANK</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', top: 5 }}>#{rank}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0187EA', top: 10 }}>Badges</Text>
          <View style={styles.badgeContainer}>
            <Image source={leagueUrl} style={{ width: 100, height: 100 }} />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const Stack = createNativeStackNavigator();

export default function ProfileScreen() {
  return (
    <Stack.Navigator initialRouteName="UserProfile">
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditUserProfile" component={EditProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#6A5BE2',
  },
  statsContainer: {
    backgroundColor: '#fff',
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height * 0.7,
    marginBottom: 50,
    borderRadius: 40,
    alignItems: 'center',
    elevation: 15
  },
  rankingContainer: {
    marginTop: 20,
    width: Dimensions.get("window").width - 80,
    height: 120,
    backgroundColor: '#0187EA',
    borderRadius: 30,
    flexDirection: 'row'
  },
  pointsContainer: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeContainer: {
    padding: 10,
    flexDirection: 'row',
    top: 10,
    maxWidth: Dimensions.get("window").width - 20
  }
});