import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ImageBackground, Image, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import * as stringSimilarity from "string-similarity";
import { data } from "../data";

export default function PlayScreen() {

  var [loaded, setLoaded] = useState(false);
  var [prompt, setPrompt] = useState();
  var [imageUrl, setImageUrl] = useState();
  var [numberOfWords, setNumberOfWords] = useState(null);
  var [difficultyImage, setDifficultyImage] = useState(require("../Images/easy.png"))
  var [seconds, setSeconds] = useState(10);

  var [numberOfImages, setNumberOfImages] = useState(0);
  var [history, setHistory] = useState([]);
  var [playing, setPlaying] = useState(true);
  var [totalScore, setTotalScore] = useState(0);
  var [trhopy, setTrhopy] = useState(0);

  var [show0, setShow0] = useState(false);
  var [show1, setShow1] = useState(false);
  var [show2, setShow2] = useState(false);

  var [userText, onChangeuserText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setSeconds(seconds++), 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!playing) return;
    generateNewImage();
  }, [])

  useEffect(() => {
    if (numberOfImages == 3) {
      setPlaying(false);
      var media = (history[0].score + history[1].score + history[2].score) / 3;
      setTotalScore(media);
      if (media > 0.20){
        setTrhopy(((media - 0.20) / 0.025).toFixed(0))
      } else {
        setTrhopy(((0.20 - media) / 0.025).toFixed(0));
      }
    }
  }, [numberOfImages])

  useEffect(() => {
    if (show0) {
      if (show1 || show2) setShow0(false);
    }
  }, [show0])

  useEffect(() => {
    if (show1) {
      if (show0 || show2) setShow1(false);
    }
  }, [show1])

  useEffect(() => {
    if (show2) {
      if (show0 || show1) setShow2(false);
    }
  }, [show2])

  function generateNewImage() {
    var randomNumber = Math.floor(Math.random() * 1000);
    const values = Object.keys(data);
    var name = values[randomNumber];
    setImageUrl(imageUrl => data[values[randomNumber]][0])
    setPrompt(prompt => values[randomNumber]);
    var lunghezza = (values[randomNumber].match(/ /g) || []).length + 1;
    setNumberOfWords(numberOfWords => lunghezza);
    if (lunghezza < 2) setDifficultyImage(require("../Images/easy.png"));
    else if (lunghezza < 5) setDifficultyImage(require("../Images/moderate.png"));
    else setDifficultyImage(require("../Images/hard.png"));

    preloadImage(data[values[randomNumber]][0]);
  }

  async function preloadImage(url) {
    setLoaded(false);
    let load = await Image.prefetch(url);
    setLoaded(load);
  }

  function comparePrompts() {
    var similarity = stringSimilarity.compareTwoStrings(prompt, userText);
    console.log(similarity, numberOfImages);
    if (numberOfImages < 3) {
      setNumberOfImages(numberOfImages + 1);
      onChangeuserText("");
      generateNewImage();
      let info = {
        "userPrompt": userText,
        "realPrompt": prompt,
        "imageUrl": imageUrl,
        "score": similarity
      };
      console.log(info);
      setHistory([...history, info]);
    } else {
      setPlaying(false);
    }
  }
  function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
  }
  return (
    <ImageBackground source={require("../Images/background_image.jpg")} style={styles.container}>
      {!playing ?
        <View style={styles.container}>
          <View style={styles.scoreContainer}>
            <View style={{ width: '60%', height: 75, backgroundColor: '#EFAE2C', elevation: 15, borderRadius: 15, top: -37.5, justifyContent: 'center', position: 'absolute' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 40, textAlign: 'center', color: '#fff' }}>SCORE</Text>
              <View style={[styles.dot, { left: 15 }]} />
              <View style={[styles.dot, { right: 15 }]} />
            </View>
            <Text /><Text />
            <ScrollView contentContainerStyle={{ width: Dimensions.get("window").width - 20, minHeight: Dimensions.get("window").height * 0.8, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShow0(!show0)} style={[styles.roundContainer, { borderBottomLeftRadius: show0 ? 0 : 20, borderBottomRightRadius: show0 ? 0 : 20, borderBottomColor: 'lightgrey', borderBottomWidth: 1 }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 5, textAlign: 'center' }}>{capitalize(history[0].realPrompt)}</Text>
              </TouchableOpacity>
              {
                show0 ?
                  <TouchableOpacity onPress={() => setShow0(!show0)} style={styles.roundEspansion}>
                    <Text style={{ fontSize: 20 }}> Your answer: <Text style={{ fontWeight: 'bold' }}>{history[0].userPrompt}</Text></Text>
                    <Image
                      style={{ width: "80%", height: undefined, aspectRatio: 1, borderRadius: 15, elevation: 20, marginTop: 10 }}
                      source={{
                        uri: history[0].imageUrl,
                      }}
                    />
                    <Text style={{ fontSize: 20, marginTop: 10 }}> Score: <Text style={{ fontWeight: 'bold' }}>{(history[0].score * 100).toFixed(0)}</Text></Text>
                  </TouchableOpacity>
                  : null
              }
              <TouchableOpacity onPress={() => setShow1(!show1)} style={[styles.roundContainer, { borderBottomLeftRadius: show1 ? 0 : 20, borderBottomRightRadius: show1 ? 0 : 20, borderBottomColor: 'lightgrey', borderBottomWidth: 1 }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 5, textAlign: 'center' }}>{capitalize(history[1].realPrompt)}</Text>
              </TouchableOpacity>
              {
                show1 ?
                  <TouchableOpacity onPress={() => setShow1(!show1)} style={styles.roundEspansion}>
                    <Text style={{ fontSize: 20 }}> Your answer: <Text style={{ fontWeight: 'bold' }}>{history[1].userPrompt}</Text></Text>
                    <Image
                      style={{ width: "80%", height: undefined, aspectRatio: 1, borderRadius: 15, elevation: 20, marginTop: 10 }}
                      source={{
                        uri: history[1].imageUrl,
                      }}
                    />
                    <Text style={{ fontSize: 20, marginTop: 10 }}> Score: <Text style={{ fontWeight: 'bold' }}>{(history[1].score * 100).toFixed(0)}</Text></Text>
                  </TouchableOpacity>
                  : null
              }
              <TouchableOpacity onPress={() => setShow2(!show2)} style={[styles.roundContainer, { borderBottomLeftRadius: show2 ? 0 : 20, borderBottomRightRadius: show2 ? 0 : 20, borderBottomColor: 'lightgrey', borderBottomWidth: 1 }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 5, textAlign: 'center' }}>{capitalize(history[2].realPrompt)}</Text>
              </TouchableOpacity>
              {
                show2 ?
                  <TouchableOpacity onPress={() => setShow2(!show2)} style={styles.roundEspansion}>
                    <Text style={{ fontSize: 20 }}> Your answer: <Text style={{ fontWeight: 'bold' }}>{history[2].userPrompt}</Text></Text>
                    <Image
                      style={{ width: "80%", height: undefined, aspectRatio: 1, borderRadius: 15, elevation: 20, marginTop: 10 }}
                      source={{
                        uri: history[2].imageUrl,
                      }}
                    />
                    <Text style={{ fontSize: 20, marginTop: 10 }}> Score: <Text style={{ fontWeight: 'bold' }}>{(history[2].score * 100).toFixed(0)}</Text></Text>
                  </TouchableOpacity>
                  : null
              }
              <Text style={{ fontSize: 25, fontWeight: 'bold', top: 25 }}>Total Score: <Text style={{ color: totalScore > 0.20 ? 'green' : 'red' }}>{totalScore.toFixed(2) * 100}</Text></Text>
              <Text style={{ fontSize: 25, fontWeight: 'bold', top: 35 }}>{trhopy > 0 ? '+' : ''} {trhopy}</Text>
            </ScrollView>
          </View>
        </View>
        :
        loaded ?
          <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View style={[styles.infoContainer, { padding: 17 }]}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', left: 10 }}>Level: </Text>
                <Image source={difficultyImage} />
              </View>
              <View style={[styles.infoContainer, { left: 10, marginRight: 20 }]}>
                <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Words:</Text>
                <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}>{(userText.match(/ /g) || []).length}/{numberOfWords}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Timer:</Text>
                <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}>{seconds}</Text>
              </View>
            </View>
            <Image
              style={styles.image}
              source={{
                uri: imageUrl,
              }}
            />
            <View style={styles.input}>
              <TextInput
                onChangeText={onChangeuserText}
                value={userText}
                style={{ color: '#fff', fontSize: 30, fontWeight: 'bold', textAlign: 'center', width: Dimensions.get("window").width * 0.6 }}
                autoCorrect={false}
                multiline={true}
              />
              <TouchableOpacity onPress={() => comparePrompts()} style={{ height: 45, width: 45, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 10, top: 10 }}>
                <AntDesign name="arrowup" size={30} color="black" />
              </TouchableOpacity>
            </View>

          </View>
          :
          <View>
            <ActivityIndicator size={50} color="#0000ff" />
            <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', top: 10 }}>Loading ...</Text>
          </View>
      }
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: Dimensions.get("window").width * 0.9,
    height: undefined,
    aspectRatio: 1,
    top: 15,
    borderRadius: 10,
    elevation: 15
  },
  input: {
    width: Dimensions.get("window").width * 0.8,
    minHeight: 75,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    padding: 10,
    top: 30,
    flexDirection: 'row',
    alignItems: 'center'
  },
  difficultyContainer: {
    backgroundColor: '#EFEFEF',
    height: 50,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 20,
    elevation: 15
  },
  scoreContainer: {
    width: Dimensions.get("window").width - 20,
    minHeight: Dimensions.get("window").height * 0.8,
    backgroundColor: '#EEEEFC',
    borderRadius: 20,
    elevation: 20,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'absolute',
    bottom: -20
  },
  dot: {
    backgroundColor: '#BD7628',
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  roundContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    elevation: 20,
    padding: 5,
    marginTop: 25
  },
  roundEspansion: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center'
  }
})