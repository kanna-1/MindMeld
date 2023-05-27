import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Leaderboard from './Leaderboard';
import Badge from './Badge'

const Tab = createMaterialTopTabNavigator();

const AchievementTab = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBarOptions={{
          labelStyle: styles.tabLabel,
          indicatorStyle: styles.tabIndicator,
          style: styles.tabBar,
          activeTintColor: '#710ef1',
          inactiveTintColor: '#000000',
        }}
      >
        <Tab.Screen name="Leaderboard" component={Leaderboard} />
        <Tab.Screen name="Badges" component={Badge} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: '#ffffff',

  },
  tabLabel: {
    textTransform: 'none', // Disable Uppercase
  },
  tabIndicator: {
    backgroundColor: '#710ef1',
  },
});

export default AchievementTab;
