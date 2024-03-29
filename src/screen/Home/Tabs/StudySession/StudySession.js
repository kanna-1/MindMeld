import { View, StyleSheet, TextInput, Text, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import React, { useState, useEffect } from "react";
import { auth, database } from '../../../../../firebase';
import { onValue, ref, get, runTransaction, child, update, remove } from "firebase/database";
import { AntDesign } from '@expo/vector-icons';



const StudySession = ({navigation}) => {
    const [invitationIds, setInvitationIds] = useState([]); 
    const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
    const [invitationData, setInvitationData] = useState([]);
    const [inDetail, setInDetail] = useState([]);
    const [join, setJoin] = useState(false);
    const [decline, setDecline] = useState(false);
    const [sessionIds, setSessionIds] = useState([]);
    const [sessionData, setSessionData] = useState([]);
    const [currentTimestamp, setCurrentTimestamp] = useState(new Date().getTime());
    const [sessionDeleted, setSessionDelected] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [xpEarned, setXpEarned] = useState(0);

    const currentUser = auth?.currentUser;


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(new Date().getTime());
        }, 10000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        // to remove all ongoing sessions
        runTransaction(ref(database, 'userId/' + currentUser?.uid), (user) => {
            if (user) {
                if (user.ongoingSessions) {
                    user.ongoingSessions = null;
                    return user;
                } else {
                    return user;
                }
            } else {
                return user;
            }
        })
    }, []);

    useEffect(() => {
        const unsubscribe = onValue(ref(database, 'userId/' + currentUser?.uid), async (snapshot) => {
            let sessions = [];
            let ended = [];
            const sessionList = snapshot.exists()? (snapshot.val().upcomingSessions? snapshot.val().upcomingSessions: []): [];
            if (sessionList.length > 0) {
                await Promise.all(sessionList.map(async (sessionObj) => {
                    const sessionRef = ref(database, 'sessions/' + sessionObj.id);
                    await get(sessionRef)
                    .then(async (session) => {
                        if (session.exists()) {
                            if (session.val().endTime.timestamp <= currentTimestamp) {
                                ended.push(session.val().id);
                            } else {
                                const hostId = session.val().host;
                                const participantsId = session.val().participants? session.val().participants: [];
                                let hostName;
                                let participantsName = [];
                                await Promise.all([
                                    //to get host name
                                    await get(ref(database, 'userId/' + hostId))
                                    .then((snapshot) => {
                                        if (snapshot.exists()) {
                                            hostName = snapshot.val().username;
                                        }
                                    })
                                    .catch((error) => console.log(error)),
                                    //to get the participants name
                                    participantsId.forEach((id) => {
                                        get(ref(database, 'userId/' + id))
                                        .then((snapshot) => {
                                            if (snapshot.exists()) {
                                                participantsName.push(snapshot.val().username);
                                            }
                                        })
                                        .catch((error) => console.log(error));
                                    })
                                ])
                                .then(() => {
                                    sessions.push({
                                        ...session.val(),
                                        hostName: hostName,
                                        participantsName: participantsName
                                    });
                                });
                            }
                        } else {
                            ended.push(sessionObj.id);
                            return;
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        Alert.alert("An error occurs1");
                    });
                    return;
                }));
                ended.map((sessionId) => {
                    const db = ref(database);
                    runTransaction(child(db, 'sessions/' + sessionId), (session) => {
                        if (session) {
                            return null;
                        } else {
                            return session;
                        }
                    });
                    runTransaction(child(db, 'chat/' + sessionId), (chat) => {
                        if (chat) {
                            return null;
                        } else {
                            return chat;
                        }
                    })

                });
                let xp = 0;
                const newSessionsList = sessionList.filter((sessionObj) => {
                    if (!ended.includes(sessionObj.id)) {
                        return true;
                    } else {
                        //if ended includes
                        xp += sessionObj.timeStay;
                        return false;
                    }
                });
                runTransaction(ref(database, 'userId/' + currentUser?.uid), (user) => {
                    if (user) {
                        user.upcomingSessions = newSessionsList;
                        user.xp += xp;
                        return user;
                    } else {
                        return user;
                    }
                })
                .then(() => {
                    setSessionIds(newSessionsList);
                    setSessionData(sessions);
                    setXpEarned(xp);
                })
                .catch((error) => {
                    console.log(error);
                    Alert.alert("An error occurs");
                });
            } else {
                setSessionIds([]);
                setSessionData([]);
            }
        });
        return () => {
            unsubscribe();
        }
    }, [currentTimestamp]);

    useEffect(() => {
        //to check if any invitation expired
        //listen to the change of invitation list
        //to get the latest invitation list
        const unsubscribe = onValue(ref(database, 'userId/' + currentUser?.uid), async (snapshot) => {
            let invitation = [];
            let expired = [];
            const invitationList = snapshot.exists()? (snapshot.val().invitationList? snapshot.val().invitationList: []): [];
            if (invitationList.length > 0) {
                await Promise.all(invitationList.map(async (id) => {
                    const sessionRef = ref(database, 'sessions/' + id);   
                    await get(sessionRef)
                    .then(async (session) => {
                        if (session.exists()) {
                            if (session.val().endTime.timestamp <= currentTimestamp ) {
                                expired.push(session.val().id);
                            } else {
                                    const hostId = session.val().host;
                                    const participantsId = session.val().participants? session.val().participants: [];
                                    let hostName;
                                    let participantsName = [];
                                    await Promise.all([
                                        //to get host name
                                        await get(ref(database, 'userId/' + hostId))
                                        .then((snapshot) => {
                                            if (snapshot.exists()) {
                                                hostName = snapshot.val().username;
                                            }
                                        })
                                        .catch((error) => console.log(error)),
                                        //to get the participants name
                                        participantsId.forEach((id) => {
                                            get(ref(database, 'userId/' + id))
                                            .then((snapshot) => {
                                                if (snapshot.exists()) {
                                                    participantsName.push(snapshot.val().username);
                                                }
                                            })
                                            .catch((error) => console.log(error));
                                        })
                                    ])
                                    .then(() => {
                                        invitation.push({
                                            ...session.val(),
                                            hostName: hostName,
                                            participantsName: participantsName
                                        });
                                    });
                            }
                        } else {
                            expired.push(id);
                            return;
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        Alert.alert("Error");
                    });
                    return;
                }));
                const newInvitationList = invitationList.filter((id) => !expired.includes(id));
                update(ref(database, 'userId/' + currentUser?.uid), {
                    invitationList: newInvitationList
                })
                .then(() => {
                    setInvitationIds(newInvitationList);
                    setInvitationData(invitation);
                });
            } else {
                setInvitationIds([]);
                setInvitationData([]);
            }
        });
        return () => {
            unsubscribe();
        }
    }, [currentTimestamp]);
    

    const showJoin = () => {
        setJoin(true);
        setTimeout(() => {
            setJoin(false);
        }, 2000);
    };

    const showDecline = () => {
        setDecline(true);
        setTimeout(() => {
            setDecline(false);
        }, 2000);
    };

    const acceptInvitation = async (session) => {
        const db = ref(database);
        //add the user into participants list of the session
        try {
                await runTransaction(child(db, 'sessions/' + session.id), (session2) => {
                    if (session2) {
                        session2.participants.push(currentUser?.uid);
                        return session2;
                    } else {
                        return session2;
                    }
                }).then(() => {
                    //remove the invitation from the user
                runTransaction(child(db, 'userId/' + currentUser?.uid), (user) => {
                    if (user) {
                        if (user.invitationList) {
                            user.invitationList = user.invitationList.filter((id) => id !== session.id);
                        }
                        if (user.upcomingSessions) {
                            user.upcomingSessions.push({id: session.id, timeStay: 0});
                        } else {
                            user.upcomingSessions = [{id: session.id, timeStay: 0}];
                        }
                        return user;
                    } else {
                        return user;
                    }
                }).then(() => {
                    showJoin();
                    setInDetail(inDetail.filter((id) => id !== session.id));
                    //setSessionData([...sessionData, session])
                });
                })
        } catch (error) {
            console.log(error);
            Alert.alert("An error occurs during accepting invitation");
        }
    };

    const declineInvitation = (sessionId) => {
        //add the user into participants list of the session
        try {
            //remove the invitation from the user
            runTransaction(ref(database, 'userId/' + currentUser?.uid), (user) => {
                if (user) {
                    user.invitationList = user.invitationList.filter((id) => id !== sessionId);
                    return user;
                } else {
                    return user;
                }
            }).then(() => {
                showDecline();
                setInDetail(inDetail.filter((id) => id !== sessionId));
            });
        } catch (error) {
            console.log(error);
            Alert.alert("An error occurs during deleting invitation");
        }
    };

    const deleteSession = (sessionId) => {
        try {
            const db = ref(database);
            const userRef = child(db, 'userId/' + currentUser?.uid);
            const sessionRef = child(db, 'sessions/' + sessionId);
            let xp = 0;
            runTransaction(userRef, (user) => {
                if (user) {
                    //to delete the session from user's upcoming sessions
                    user.upcomingSessions = user.upcomingSessions.filter((session) => {
                        if (session.id === sessionId) {
                            xp = session.timeStay;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    user.xp += xp;
                    return user;
                } else {
                    return user;
                }
            });
            runTransaction(sessionRef, (session) => {
                if (session) {
                    if (session.host === currentUser?.uid) {
                        //only host can delete the whole study session
                        remove(child(db, 'chat/' + sessionId));
                        return null;
                    } else {
                        //to delete the user from session's participants
                        session.participants = session.participants.filter((uid) => uid !== currentUser?.uid);
                        return session;
                    }
                } else {
                    return session;
                }
            }).then(() =>{
                setSessionDelected('');
                setXpEarned(xp);
            });
        } catch(error) {
            console.log(error);
            Alert.alert("An error occurs during deleting session");
        }
    };

    const joinSession = (session) => {
       try {
            const db = ref(database);
            //Promise.all([
                //add user into online list of the session
                /*runTransaction(child(db, 'sessions/' + session.id), (session) => {
                    if (session) {
                        if (session.onlineParticipants) {
                            session.onlineParticipants.push(currentUser.uid);
                            return session;
                        } else {
                            session.onlineParticipants = [currentUser.uid];
                            return session;
                        }
                    } else {
                        return session;
                    }
                }), */
                //add the session into user's ongoing sessions
                runTransaction(child(db, 'userId/' + currentUser?.uid), (user) => {
                    if (user) {
                        user.ongoingSessions = session.id;
                        return user;
                    } else {
                        return user;
                    }
                })
           // ])
            .then(() => navigation.navigate("SessionRoom", {session}));
        } catch (error) {
            console.log(error);
            Alert.alert("An error occurs during joining session");
        }
    };

    const renderSession = ({item}) => {
        const inProgress = item.startTime.timestamp < currentTimestamp;
        console.log(item.startTime);
        if (item.sessionName.startsWith(sessionName) || item.sessionName === sessionName || !sessionName) {
            return (
                <View style={[styles.session, inProgress && {backgroundColor: 'lavender'}]}>
                    <View style={styles.sessionInfo2}>
                        <Text style={styles.sessionName2}>{item.sessionName}</Text>
                        <Text style={styles.sessionDescription2}>{item.sessionDescription}</Text>
                        <View style={styles.separator}/>
                            <View style={{flexDirection: 'row'}}>
                                <Ionicons name='calendar-outline' size={20}/>
                                <Text style={[{marginLeft: 5}, styles.text]}>{item.startTime.string.slice(0, 11)} - {item.endTime.string.slice(0, 11)}</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Ionicons name='time-outline' size={20}/>
                                <Text style={[{marginLeft: 5}, styles.text]}>{item.startTime.string.slice(-5)} - {item.endTime.string.slice(-5)}</Text>
                            </View>
                        <Text style={styles.text2}>Host: {item.hostName}</Text>
                        <Text style={styles.text2}>Participants: {item.participantsName.join(', ')}</Text>
                        <Text style={styles.text2}>To-do's: {item.tasks ? item.tasks.map((task) => task.title).join(', ') : ''}</Text>
                        {/* <Text style={[styles.text2, !item.studyModeEnabled && {textDecorationLine: 'line-through'}]}>Study Mode</Text> */}
                    </View>
                    <View style={styles.acceptOrDecline2}>
                        {inProgress && (
                            <View style={styles.inProgress}>
                                <Text style={styles.inProgressText}>In Progress</Text>
                            </View>
                        )}
                        <TouchableOpacity  
                        style={{right: 4, bottom: 5}}
                        disabled={!inProgress}
                        onPress={() => joinSession(item)}>
                            <Ionicons name="enter-outline" color={'black'} size={35}/>
                        </TouchableOpacity>
                        <TouchableOpacity  
                        style={{top: 5}}
                        onPress={() => setSessionDelected(item.id)}>
                            <MaterialCommunityIcons name="delete-outline" color={'red'} size={30}/>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    const renderInvitation = ({item}) => {
        if (inDetail.includes(item.id)) {
            return (
                <TouchableOpacity 
                onPress={() => setInDetail(inDetail.filter((i) => i !== item.id))}
                style={styles.flatListItem}>
                    <View style={styles.sessionInfo}>
                        <Text style={styles.sessionName}>{item.sessionName}</Text>
                        <Text style={styles.sessionDescription}>{item.sessionDescription}</Text>
                        <View style={styles.separator}/>
                        {/* <View style={{flexDirection: 'row', alignItems:'center', right: 1}}>
                            <Ionicons name='time-outline' size={20}/>
                            <Text style={[{marginLeft: 5}, styles.text]}>{item.startTime.string} - 
                            {'\n'}
                            {item.endTime.string}</Text>
                        </View> */}
                                                    <View style={{flexDirection: 'row'}}>
                                <Ionicons name='calendar-outline' size={20}/>
                                <Text style={[{marginLeft: 5}, styles.text]}>{item.startTime.string.slice(0, 11)} - {item.endTime.string.slice(0, 11)}</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Ionicons name='time-outline' size={20}/>
                                <Text style={[{marginLeft: 5}, styles.text]}>{item.startTime.string.slice(-5)} - {item.endTime.string.slice(-5)}</Text>
                            </View>
                        <Text style={styles.text}>Host: {item.hostName}</Text>
                        <Text style={styles.text}>Participants: {item.participantsName.join(', ')}</Text>
                        <Text style={styles.text}>To-do's: {item.tasks ? item.tasks.map((task) => task.title).join(', '): ''}</Text>
                    </View>
                    <View style={styles.acceptOrDecline3}>
                        <TouchableOpacity onPress={() => acceptInvitation(item)}>
                            <Ionicons name="checkmark" color={'green'} size={35}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => declineInvitation(item.id)}>
                            <Entypo name="cross" color={'red'} size={35}/>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity 
                style={styles.flatListItem}
                onPress={() => setInDetail([...inDetail, item.id])}>
                    <View style={styles.sessionInfo}>
                        <Text style={styles.sessionName}>{item.sessionName}</Text>
                        <Text style={styles.sessionDescription}>{item.sessionDescription}</Text>
                    </View>
                    
                    <View style={styles.acceptOrDecline}>
                        <TouchableOpacity onPress={() => acceptInvitation(item)}>
                            <Ionicons name="checkmark" color={'green'} size={35}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => declineInvitation(item.id)}>
                            <Entypo name="cross" color={'red'} size={35}/>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    return (
        <View>
            <SessionHeader 
            setIsCheckingInvitation={setIsCheckingInvitation}
            setSessionName={setSessionName}
            invitationIds={invitationIds}/>
            <FlatList 
            data={sessionData}
            renderItem={renderSession}
            contentContainerStyle={{alignItems: 'center'}}
            keyExtractor={(session) => session.id}
            style={{height: '81%'}}
            />

            <TouchableOpacity 
            style={styles.add}
            onPress={() => navigation.navigate("CreateStudySession")}>
                <Ionicons name={'add'} size={50} style={{left: 1}}/>
            </TouchableOpacity>


            {/* Inivitation message */}
            <Modal visible={isCheckingInvitation} transparent animationType="fade">
                <View style={styles.invitationBackground}>
                    <View style={styles.invitationContainer}>
                        <View style={styles.invitationHeader}>
                            <TouchableOpacity
                            onPress={() => setIsCheckingInvitation(false)}>
                                <Text style={styles.back}>{'\u2190'}</Text >  
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Invitation</Text>
                        </View>

                        {invitationData.length === 0 ? (
                        <Text style={styles.noInvitationsText}>No current invitations</Text>
                        ) : (
                        <FlatList
                        data={invitationData}
                        renderItem={renderInvitation}
                        keyExtractor={(item) => item.id}
                        style={{flex: 1}}
                        contentContainerStyle={{alignItems: 'center'}}
                        />
                        )}
                    </View>
                </View>

                {/* message when accept the invitation */}
                {join && (
                    <View style={styles.joinContainer}>
                        <Text style={styles.joinText}>Accepted</Text>
                    </View>
                )}

                {/* message when decline the invitation */}
                {decline && (
                    <View style={styles.declineContainer}>
                        <Text style={styles.declineText}>Declined</Text>
                    </View>
                )}
            </Modal>


            <Modal
            visible={sessionDeleted !== ''}
            animationType="fade"
            transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.labelContainer}>
                            <AntDesign name="exclamationcircle" style={styles.warningIcon} />
                            <Text style={styles.label}>Confirm to delete the session?</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setSessionDelected('')}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={() => deleteSession(sessionDeleted)}>
                            <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* to display the duration user stayed in the previous session */}
            <Modal
            visible={xpEarned > 0}
            animationType="fade"
            transparent>
                <View style={styles.timeBackground}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.congrats}>Congratulations!!!</Text>
                        <Text style={styles.xpEarned}>You have earned a total of {xpEarned} XP from previous study sessions.</Text>
                        <TouchableOpacity style={styles.continueButton} onPress={() => setXpEarned(0)}>
                            <Text style={styles.continue}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const SessionHeader = ({setIsCheckingInvitation, setSessionName, invitationIds}) => {
    return (
        <View style={styles.headerContainer}>
            <View/>
            <Text style={styles.title}>Study Session</Text>
            <View style={styles.searchContainer}>
                <Ionicons 
                style={styles.searchIcon}
                name='search' 
                color='white' 
                size={30}/>
                <TextInput 
                style={styles.search}
                placeholder='Search'
                autoCapitalize='none'
                clearButtonMode='while-editing'
                autoCorrect={false}
                onChangeText={(text) => setSessionName(text)}>
                </TextInput>

                <TouchableOpacity
                    style={styles.news}
                    onPress={() => setIsCheckingInvitation(true)}
                    >
                    {invitationIds.length >= 0 && (
                        <View style={styles.notificationContainer}>
                            <View style={styles.notificationCircle}>
                                <Text style={styles.notificationText}>{invitationIds.length}</Text>
                            </View>
                        </View>
                    )}
                    <MaterialCommunityIcons
                        name='bell-outline'
                        size={30}
                        color={'white'}
                    />
                    </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        right: 10,
        top: 5,
        alignItems: 'center'
    },
    searchIcon: {
        right: 5
    },
    search: {
        backgroundColor: 'white',
        width: "50%",
        height: 30,
        borderRadius: 10,
        textAlign: 'left',
        paddingLeft: 10,
    }, 
    headerContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#8A2BE2',
        marginBottom: 5,
        borderBottomEndRadius: 20,
        borderBottomStartRadius: 20
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        bottom: 10,
        marginLeft: 15,
    },
    news: {
        left: 45,
    },
    invitationBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    invitationContainer: {
        height: '45%',
        width: '85%',
        borderRadius: 20,
        backgroundColor: 'white'
    },
    back: {
        fontSize: 35,
        fontWeight: 'bold',
        right: 65,
        color: 'white'
    },
    headerText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        right: 15
    },
    invitationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#8A2BE2',
        height: '20%'
    },
    flatListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingVertical: 5,
        backgroundColor: 'lavender',
        borderWidth: 0.2,
        marginVertical: 6,
        width: '95%'
    },
    session: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingVertical: 5,
        backgroundColor: 'lightgray',
        borderWidth: 0.2,
        marginVertical: 6,
        width: '95%',
    },
    acceptOrDecline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        right: 5,
    },
    acceptOrDecline2: {
        alignItems: 'center',
        right: 15,
    },
    acceptOrDecline3: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        right: 5,
        bottom: 60
    },
    sessionInfo: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '70%',
    },
    sessionInfo2: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '80%',
        right: 5
    },
    sessionName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'purple',
        width: '90%'
    },
    sessionName2: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'purple',
        width: '90%'
    },
    sessionDescription: {
        fontSize: 18,
        width: '90%'
    },
    sessionDescription2: {
        fontSize: 20,
        width: '90%'
    },
    text: {
        fontSize: 15,
        marginTop: 2,
        width: '90%'
    },
    text2: {
        fontSize: 18,
        marginTop: 2,
        width: '90%'
    },
    separator: {
        height: 1,
        backgroundColor: 'black',
        width: '90%',
        marginVertical: 7
    },
    joinContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(100, 100, 250, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 40,
        top: 160,
        left: 110,
        borderRadius: 20,
    },
    joinText: {
        fontSize: 16,
        color: 'white'
    },
    declineContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(200, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
        height: 40,
        top: 160,
        left: 125,
        borderRadius: 20,
    },
    declineText: {
        fontSize: 16,
        color: 'white'
    },
    inProgress: {
        position: 'absolute',
        width: 120,
        top: -50,
        right: 5,
        borderRadius: 10,
        backgroundColor: '#8A2BE2',
        alignItems: 'center',
        paddingVertical: 5
    },
    inProgressText: {
        fontSize: 18,
        color: 'white',
        fontWeight: '600'
    },
    add: {
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: 15,
        left: 170,
        backgroundColor: 'lavender',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: 'gray',
        shadowOpacity: 0.5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        width: '80%',
        maxHeight: '50%',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    warningIcon: {
        marginRight: 10,
        fontSize: 24,
        color: '#FF0000',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },  
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    cancelButton: {
        backgroundColor: '#999',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginRight: 6, 
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginLeft: 6, 
    },
    notificationContainer: {
        position: 'absolute',
        top: -10,
        right: -10,
      },
    notificationCircle: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
    notificationText: {
        color: 'black',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noInvitationsText: {
        fontSize: 18,
        color: 'gray',
        textAlign: 'center',
        marginTop: 10,
    },
    timeBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    timeContainer: {
        height: '30%',
        width: '75%',
        borderRadius: 20,
        backgroundColor: "lavender",
        justifyContent: 'center',
        alignItems: 'center'
    },
    congrats: {
        fontSize: 25,
        fontWeight: 'bold',
        bottom: 30,
    },
    xpEarned: {
        fontSize: 18,
        maxWidth: '90%'
    },
    continue: {
        fontSize: 16,
        color: 'white'
    },
    continueButton: {
        height: '15%',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'dodgerblue',
        top: 40
    }
});

export default StudySession;