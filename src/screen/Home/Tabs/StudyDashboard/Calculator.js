import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  View,
  Alert,
} from 'react-native';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';

const Calculator = ({ navigation }) => {
  const goToHome = () => navigation.goBack();

  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  

  const handleCalculation = async () => {
    try {
      const apiUrl = `http://api.wolframalpha.com/v1/result?appid=${process.env.EXPO_PUBLIC_CALC_API_KEY}&i=${encodeURIComponent(
        input
      )}`;

      const response = await axios.get(apiUrl);
      const result = response.data;

      setResult(result);
    } catch (error) {
      Alert.alert('Incorrect mathematical expression');
      //console.log(error);
    }
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  const reset = () => {
    setInput('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goToHome}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Calculator</Text>
        <TouchableOpacity style={styles.closeButton} onPress={reset} testID='reset'>
          <AntDesign name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.displayContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setInput}
          value={input}
          placeholder="Enter your calculation"
          placeholderTextColor="#777777"
          keyboardType="numeric"
          editable={false}
        />

        <Text style={styles.resultValue}>{result}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <CalcButton onPress={() => setInput(input + '7')} text="7" />
          <CalcButton onPress={() => setInput(input + '8')} text="8" />
          <CalcButton onPress={() => setInput(input + '9')} text="9" />
          <CalcButton onPress={() => setInput(input + '/')} text="/" />
        </View>
        <View style={styles.row}>
          <CalcButton onPress={() => setInput(input + '4')} text="4" />
          <CalcButton onPress={() => setInput(input + '5')} text="5" />
          <CalcButton onPress={() => setInput(input + '6')} text="6" />
          <CalcButton onPress={() => setInput(input + '*')} text="*" />
        </View>
        <View style={styles.row}>
          <CalcButton onPress={() => setInput(input + '1')} text="1" />
          <CalcButton onPress={() => setInput(input + '2')} text="2" />
          <CalcButton onPress={() => setInput(input + '3')} text="3" />
          <CalcButton onPress={() => setInput(input + '-')} text="-" />
        </View>
        <View style={styles.row}>
          <CalcButton onPress={() => setInput(input + '0')} text="0" />
          <CalcButton onPress={() => setInput(input + '.')} text="." />
          <CalcButton onPress={handleCalculation} text="=" />
          <CalcButton onPress={() => setInput(input + '+')} text="+" />
        </View>
        <View style={styles.row}>
          <CalcButton onPress={() => setInput(input + '(')} text="(" />
          <CalcButton onPress={() => setInput(input + ')')} text=")" />
          <CalcButton onPress={() => setInput(input + '^')} text="^" />
          <CalcButton onPress={handleBackspace} text="⌫" />
        </View>
      </View>

      <View style={styles.attributionContainer}>
        <Text style={styles.attributionText}>Powered by Wolfram Alpha</Text>
      </View>
    </View>
  );
};

const CalcButton = ({ onPress, text, color }) => (
  <TouchableOpacity
    style={[styles.calcButton, { backgroundColor: color || '#e0e0e0' }]}
    onPress={onPress}
  >
    <Text style={styles.calcButtonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 10,
  },
  back: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  input: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 32,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'right',
    width: '100%',
    color: '#333333',
  },
  resultValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 10,
    color: 'gray',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  calcButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: 65,
    marginHorizontal: 5,
  },
  calcButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333',
  },
  attributionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -20,
  },
  attributionText: {
    fontSize: 14,
    color: '#777777',
  },
});

export default Calculator;
