import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Text,
    SafeAreaView
  } from "react-native";

  const About = ( {navigation} ) => {
    const goToHome = () => navigation.navigate("Home") 

    return (
        <SafeAreaView>
            <TouchableOpacity style={styles.button} onPress={goToHome}>
                 <Text style={styles.back} >{'\u2190'}</Text >
            </TouchableOpacity>
        </SafeAreaView>
    )
  }

  const styles = StyleSheet.create({
    back: {
        fontSize: 35,
        color: "#710EF1",
        fontWeight: "bold",
      },
    horizontal: {
        flexDirection: 'row',
    },
    text: {
        alignContent: 'center',
    },
    button: {
        position: 'relative',
        bottom: 0,
        left: 20,
      }
  })

  export default About