import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Text,
    SafeAreaView
  } from "react-native";

  const SessionsSetting = ({navigation}) => {
    const goToHome = () => navigation.goBack();

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
        fontWeight: "bold",
      },
      button: {
        position: 'relative',
        bottom: 0,
        left: 20
      }
  })

  export default SessionsSetting