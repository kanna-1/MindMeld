import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  View,
  Keyboard,
  Alert
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { auth } from '../../../../../firebase';

const CreateStudySession = ({ navigation }) => {

  const isAnonymous = auth.currentUser.isAnonymous;
  const [sessionType, setSessionType] = useState(isAnonymous? 'private': 'group');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [studyModeEnabled, setStudyModeEnabled] = useState(isAnonymous);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');

  const goToHome = () => navigation.navigate('StudyDashboard');

  const handleSessionTypeChange = (type) => {
    setSessionType(type);
    if (type === 'private') {
      setStudyModeEnabled(true);
    } else {
      setStudyModeEnabled(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (time) => {
    setStartTime(time);
    hideStartTimePicker();
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (time) => {
    setEndTime(time);
    hideEndTimePicker();
  };

  const renderSessionTypeButtons = () => (
    <View style={styles.buttonGroup}>
      <TouchableOpacity
        style={[
          styles.sessionTypeButton,
          sessionType === 'group' && styles.activeButton,
        ]}
        onPress={() => handleSessionTypeChange('group')}
        disabled={isAnonymous}
      >
        <Text style={styles.buttonText}>Group</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sessionTypeButton,
          sessionType === 'private' && styles.activeButton,
        ]}
        onPress={() => handleSessionTypeChange('private')}
      >
        <Text style={styles.buttonText}>Private</Text>
      </TouchableOpacity>
    </View>
  );

  const minimumDate = new Date(new Date().getTime() + 60000); 

  const createStudySession = () => {
    if (!sessionName) {
      Alert.alert('Session Name cannot be empty');
      return;
    } else if (!selectedDate) {
      Alert.alert("Please select date");
      return;
    } else if (!startTime) {
      Alert.alert("Please select start time");
      return;
    } else if (!endTime) {
      Alert.alert("Please select end time");
    } else {
      if (isAnonymous) {
        //anonymous user does not have study buddy feature
        navigation.navigate('SelectToDo', {
          sessionName, 
          sessionType, 
          sessionDescription,
          studyModeEnabled,
          selectedDate: selectedDate.toDateString(),
          startTime: startTime.toLocaleTimeString(),
          endTime: endTime.toLocaleTimeString()
        })
      } else {
        navigation.navigate('SelectBuddies', {
          sessionName, 
          sessionType, 
          sessionDescription,
          studyModeEnabled,
          selectedDate: selectedDate.toDateString(),
          startTime: startTime.toLocaleTimeString(),
          endTime: endTime.toLocaleTimeString()
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goToHome}>
        <Text style={styles.back}>{'\u2190'}</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Create Study Session</Text>
      <Text style={styles.subheading}>Session Name</Text>
      <TextInput 
      style={styles.input1} 
      placeholder="Enter session name"
      autoCapitalize='none'
      autoCorrect={false}
      clearButtonMode='while-editing'
      value={sessionName}
      onChangeText={(text) => setSessionName(text)}/>
      <Text style={styles.subheading}>Session Type</Text>
      {renderSessionTypeButtons()}

      <View>
        <Text style={styles.subheading}>Session Description</Text>
        <TextInput 
        value={sessionDescription}
        onChangeText={(text) => setSessionDescription(text)}
        style={styles.input2} 
        multiline
        placeholder='Description'
        autoCapitalize='none'
        autoCorrect={false}
        blurOnSubmit
        clearButtonMode='while-editing'
        />
      </View>

      <View style={styles.checkboxContainer}>
        <Text style={styles.checkboxLabel}>Enable Study Mode</Text>
        <TouchableOpacity
          style={[styles.checkbox, studyModeEnabled && styles.checkboxActive]}
          onPress={() => setStudyModeEnabled(!studyModeEnabled)}
          disabled={sessionType === 'private'}
        >
          {studyModeEnabled && <Text style={styles.checkmark}>&#x2713;</Text>}
        </TouchableOpacity>
        {sessionType === 'private' && (
          <Text style={styles.checkboxLabel2}>      This must be enabled {"\n"}      during private sessions </Text>
        )}
      </View>
      <Text style={styles.subheading}>Select Date</Text>
      <TouchableOpacity style={styles.calendarButton} onPress={showDatePicker}>
        <Text style={styles.calendarButtonText}>
          {selectedDate ? selectedDate.toDateString() : 'Select Date'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.subheading}>Select Time</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.startTimeButton} onPress={showStartTimePicker}>
            <Text style={styles.startTimeButtonText}>
            {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Start Time'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endTimeButton} onPress={showEndTimePicker}>
            <Text style={styles.endTimeButtonText}>
            {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select End Time'}
            </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.createButton} onPress={createStudySession}>
        <Text style={styles.createButtonText}>Create Study Session</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        textColor="#000000"
        minimumDate={minimumDate}
      />
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
        textColor="#000000"
        minimumDate={minimumDate}
      />
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={hideEndTimePicker}
        textColor="#000000"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingHorizontal: 20,
   // paddingTop: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    top: 40
  },
  backButton: {
    position: 'absolute',
    top: -15,
    left: 10,
    zIndex: 1,
  },
  back: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    bottom: 5
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sessionTypeButton: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#DC582A',
  },
  input1: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  input2: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    marginBottom: 30,
    height: 130,
    width: "100%",
    textAlign: 'left',
    paddingHorizontal: 10,
  },
  calendarButton: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  startTimeButton: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: 170,
  },
  startTimeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  endTimeButton: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: 170,
  },
  endTimeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#DC582A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: "90%",
    alignSelf: 'center'
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  checkboxLabel2: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    left: 170
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#DC582A',
  },
});

export default CreateStudySession;
