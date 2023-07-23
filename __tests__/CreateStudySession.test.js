import { render, fireEvent, act } from '@testing-library/react-native';
import React from 'react';
import CreateStudySession from '../src/screen/Home/Tabs/StudyDashboard/CreateStudySession';
import { Alert } from 'react-native';
import {ref, onValue, get, push, runTransaction, child, set} from 'firebase/database';
import SelectToDo from '../src/screen/Home/Tabs/StudyDashboard/SelectToDo';
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

jest.mock('firebase/auth');
jest.mock('firebase/app');
jest.mock('firebase/database');
jest.mock('firebase/storage');

beforeEach(() => {
    initializeApp.mockImplementation(() => {});
    getAuth.mockImplementation(() => {});
    getDatabase.mockImplementation(() => {});
    getStorage.mockImplementation(() => {});
});

const navigation = {
    navigate: jest.fn(),
    pop: jest.fn()
};

let alertSpy;
beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert');
});
afterEach(() => {
    alertSpy.mockRestore();
    navigation.navigate.mockRestore();
    navigation.pop.mockRestore();
});


jest.useFakeTimers();

let setIntervalSpy;
let setTimeoutSpy;
beforeEach(() => {
    setIntervalSpy = jest.spyOn(window, 'setInterval');
    setTimeoutSpy = jest.spyOn(window, 'setTimeout');
});
afterEach(() => {
    setIntervalSpy.mockRestore();
    setTimeoutSpy.mockRestore();
})

describe('Create Study Session', () => {
    it('should move on to select buddy with all required field selected', async () => {
        const {getByPlaceholderText, getByTestId, getByText} = render(<CreateStudySession navigation={navigation}/>);
        const  now = new Date();
        await act(async () => {
            await fireEvent.changeText(getByPlaceholderText('Enter session name'), 'test');
            await fireEvent.press(getByTestId('date'));
            await fireEvent(getByTestId('datePicker'), 'confirm', now);
            //await fireEvent.press(getByTestId('Confirm'));
            await fireEvent.press(getByTestId('startTime'));
            await fireEvent(getByTestId('startTimePicker'), 'confirm', now);
            //await fireEvent.press(getByText('Confirm'));
            await fireEvent.press(getByTestId('endTime'));
            await fireEvent(getByTestId('endTimePicker'), 'confirm', now);
            //await fireEvent.press(getByText('Confirm'));
            await fireEvent.press(getByTestId('CreateStudySession'));
        });

        expect(alertSpy).not.toHaveBeenCalled();
        //session info matches
        expect(navigation.navigate).toHaveBeenCalledWith('SelectBuddies', {
            sessionName: 'test',
            sessionDescription: '',
            selectedDate: now.toDateString(),
            startTime: {
                string: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                timestamp: now.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
              },
              endTime:  {
                string: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: now.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
              }
        });
    });

    it('start time must be before end time', async () => {
        const {getByPlaceholderText, getByTestId, getByText} = render(<CreateStudySession navigation={navigation}/>);
        const end = new Date();
        const start = new Date(end.getTime() + 120000);

        await act(async () => {
            await fireEvent.changeText(getByPlaceholderText('Enter session name'), 'test');
            await fireEvent.press(getByTestId('date'));
            await fireEvent(getByTestId('datePicker'), 'confirm', end);
            await fireEvent.press(getByTestId('endTime'));
            await fireEvent(getByTestId('endTimePicker'), 'confirm', end);
            await fireEvent.press(getByTestId('startTime'));
            await fireEvent(getByTestId('startTimePicker'), 'confirm', start);
        });
        expect(alertSpy).toHaveBeenCalledWith('End time cannot be earlier than start time');
    });

    it('can create study session after select to do', async () => {
        //mock session info
        const route = {
            params: {
                sessionName: 'test', 
                sessionDescription: 'test',
                selectedDate: 'test',
                startTime: {
                    string: 'test',
                    timestamp: new Date()
                },
                endTime:  {
                    string: 'test',
                    timestamp: new Date()
                },
                buddiesInvited: ['test1', 'test2'],
            }
        };
        ref.mockReturnValue();
        push.mockReturnValue({key: 'test'});
        child.mockReturnValue();
        set.mockResolvedValue();
        runTransaction.mockResolvedValue();
        
        const {getByText} = render(<SelectToDo navigation={navigation} route={route}/>);
        await act(async () => {
            fireEvent.press(getByText('Finish'));
            //to mock the animation
            jest.advanceTimersByTime(4000);
        });
        expect(runTransaction.mock.calls).toHaveLength(3);
        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(set.mock.calls).toHaveLength(2);
        expect(navigation.pop).toHaveBeenCalledWith(3)
    })
});
