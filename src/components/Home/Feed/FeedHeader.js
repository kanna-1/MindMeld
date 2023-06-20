import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommunityHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Feeds</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#8A2BE2',
    marginBottom: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default CommunityHeader;