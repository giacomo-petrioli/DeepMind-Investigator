import { StyleSheet, Text, View, Dimensions, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, Ionicons } from '@expo/vector-icons';

import { useNavigation, useRoute } from "@react-navigation/native";
import { getDatabase, ref, child, get } from "../firebase/firebase-database";
import { uploadBytes, getDownloadURL, getStorage, ref as sRef } from "../firebase/firebase-storage";

export default function ProfileViewer() {

  const navigation = useNavigation();
  const route = useRoute()

  var [points, setPoints] = useState('');
  var [imageUrl, setImageUrl] = useState(null);
  var [leagueUrl, setLeagueUrl] = useState('../Images/league_bronze.png');

  const user = route.params?.data;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, '/' + user.name)).then((snapshot) => {
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
        console.log("no user found");
      }
    }).catch((error) => {
      console.error(error);
    });

    GetProfileImageUrl();
    
  }, [user])

  async function GetProfileImageUrl(){
    const storage = getStorage();
    const obj = sRef(storage, user.name);
    var url = await getDownloadURL(obj);
    setImageUrl(imageUrl => url);
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
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={{ position: 'absolute', top: (Dimensions.get("window").height * 0.3) / 2 - 20, left: 25 }}>
          <Ionicons name="arrow-back" size={40} color="white" />
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <Image
            style={{ width: 100, height: 100, borderRadius: 50, top: -50, borderColor: '#000', borderWidth: 3 }}
            source={{
              uri: imageUrl ? imageUrl : 'https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png',
            }} />
          <Text style={{ fontSize: 40, fontWeight: 'bold', marginTop: -50, textAlign: 'center' }}>{user.name}</Text>
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', top: 5 }}>#{user.rank + 1}</Text>
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
    alignItems: 'center'
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
})