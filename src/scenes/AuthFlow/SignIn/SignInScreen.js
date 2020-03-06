/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {Button, Input, Icon, Text, Overlay} from 'react-native-elements';
import login from '../../../images/login.jpg.png';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import realm from '../../../services/realm';
import {Header} from 'react-navigation-stack';

var _ = require('lodash');

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      list: [],
      correct: 'none',
      showModal: false,
      showLoginModal: false,
      prodCheck: true,
    };
  }
  static navigationOptions = {
    title: '',
  };

  prodCheckHandler = () => [this.setState({prodCheck: !this.state.prodCheck})];

  render() {
    return (
      <ImageBackground source={login} style={styles.container}>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={Header.HEIGHT - 500}
          style={{
            flexDirection: 'column',
            justifyContent: 'space-around',
            flex: 1,
          }}>
          <View
            style={{
              width: '95%',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            <Switch
              value={this.state.prodCheck}
              onChange={this.prodCheckHandler}
              trackColor={{false: '#484848', true: '#212121'}}
            />
          </View>
          <View style={styles.loginForm}>
            <View style={styles.input}>
              <Input
                onChangeText={email => this.setState({email})}
                value={this.state.email}
                inputStyle={{color: '#fff', fontSize: 20}}
                autoCapitalize="none"
                leftIcon={
                  <Icon
                    name="user"
                    size={20}
                    color="white"
                    type="font-awesome"
                  />
                }
                leftIconContainerStyle={{marginRight: 10}}
              />
            </View>
            <View style={styles.input}>
              <Input
                onChangeText={password => this.setState({password})}
                value={this.state.password}
                inputStyle={{color: '#fff', fontSize: 20}}
                secureTextEntry={true}
                leftIcon={
                  <Icon
                    name="lock"
                    size={20}
                    color="white"
                    type="font-awesome"
                  />
                }
                leftIconContainerStyle={{marginRight: 10}}
              />
            </View>
            <View style={styles.loginButtonContainer}>
              <Button
                title="Войти!"
                onPress={this.signInFlow}
                buttonStyle={{backgroundColor: '#1E151A'}}
              />
              <Text
                style={{
                  display: this.state.correct,
                  color: 'red',
                  fontSize: 16,
                  alignSelf: 'center',
                }}>
                Неверный email/пароль.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.credentials}>
          <Text
            h4
            h4Style={{
              color: '#fff',
              fontSize: 10,
              fontWeight: '200',
              marginBottom: 20,
            }}>
            Powered by Adamcode
          </Text>
        </View>
        <Overlay
          isVisible={this.state.showModal}
          overlayStyle={{
            width: '90%',
            height: '20%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center', fontSize: 16}}>
            Подождите, идет первоначальная загрузка данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
        <Overlay
          isVisible={this.state.showLoginModal}
          overlayStyle={{
            width: '90%',
            height: '20%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center', fontSize: 16}}>
            Подождите, идет проверка данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
      </ImageBackground>
    );
  }

  componentDidMount() {
    var newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 1);
    var lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() - 1);
    var newMomentTime = moment(newDate);
    var lastMomentTime = moment(lastDate);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({startTime: newMomentTime, endTime: lastMomentTime});
  }

  fetchData = async testBody => {
    var testArr = [];
    if (this.state.prodCheck) {
      var port = '8050';
    } else {
      port = '8051';
    }
    await NetInfo.fetch().then(async state => {
      if (state.isConnected === true && this.state.usertoken !== null) {
        let rawResponseScenes = await fetch(
          'https://calendar.bolshoi.ru:' +
            port +
            '/WCF/BTService.svc/GetScenes',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          },
        );
        const content = await rawResponseScenes.json();
        for (var k = 1; k <= content.GetScenesResult.length; k++) {
          testArr.push(k);
        }
        realm.write(() => {
          if (realm.objects('Selected').length < 1) {
            realm.create(
              'Selected',
              {selected: JSON.stringify(testArr), id: 1},
              'modified',
            );
            this.setState({realm});
          }
        });
        realm.write(() => {
          if (realm.objects('Scene') !== null) {
            realm.delete(realm.objects('Scene'));
            for (var l = 1; l <= content.GetScenesResult.length; l++) {
              realm.create(
                'Scene',
                {
                  selected: false,
                  id: l,
                  title: content.GetScenesResult[l - 1].Name,
                  color: content.GetScenesResult[l - 1].Color,
                  resourceId: content.GetScenesResult[l - 1].ResourceId,
                },
                'modified',
              );
            }
          } else {
            for (var l = 1; l <= content.GetScenesResult.length; l++) {
              realm.create(
                'Scene',
                {
                  selected: false,
                  id: l,
                  title: content.GetScenesResult[l - 1].Name,
                  color: content.GetScenesResult[l - 1].Color,
                  resourceId: content.GetScenesResult[l - 1].ResourceId,
                },
                'modified',
              );
            }
          }
        });
        this.setState({realm});
      }
    });
    await NetInfo.fetch().then(async state => {
      if (
        state.isConnected === true &&
        //realm.objects('EventItem') === null &&
        this.state.usertoken !== null
      ) {
        let rawResponse = await fetch(
          'https://calendar.bolshoi.ru:' +
            port +
            '/WCF/BTService.svc/GetScenes',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          },
        );
        const contentScenes = await rawResponse.json();
        var id = 0;
        // if (realm.objects('EventItem') !== null) {
        //   realm.write(() => {
        //     let allEvents = realm.objects('EventItem');
        //     realm.delete(allEvents);
        //   });
        // }
        var scenesArr = [];
        for (var h = 0; h < contentScenes.GetScenesResult.length; h++) {
          scenesArr.push(contentScenes.GetScenesResult[h].ResourceId);
        }
        for (var l = 0; l < scenesArr.length; l++) {
          let urlTest =
            'https://calendar.bolshoi.ru:' +
            port +
            '/WCF/BTService.svc/GetEventsByPeriod/' +
            scenesArr[l] +
            '/' +
            moment(this.state.endTime).format('YYYY-MM-DDTHH:mm:ss') +
            '/' +
            moment(this.state.startTime).format('YYYY-MM-DDTHH:mm:ss');
          let rawResponse1 = await fetch(urlTest, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          });
          const content1 = await rawResponse1.json();
          for (var p = 0; p < content1.GetEventsByPeriodResult.length; p++) {
            if (
              content1.GetEventsByPeriodResult[p].StartDateStr !== undefined &&
              content1.GetEventsByPeriodResult[p].Title !== undefined
            ) {
              let beginTime = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(11);
              let endingTime = content1.GetEventsByPeriodResult[
                p
              ].EndDateStr.substring(11);
              let eventTime = beginTime + ' - ' + endingTime;
              let date = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(0, 10)
                .split('.')
                .join('-');
              let dateFormatted =
                date.substring(6) +
                '-' +
                date.substring(3).substring(0, 2) +
                '-' +
                date.substring(0, 2);
              let alertedPersons =
                content1.GetEventsByPeriodResult[p].AlertedPersons;
              let troups = content1.GetEventsByPeriodResult[p].Troups;
              let outer = content1.GetEventsByPeriodResult[p].OuterPersons;
              let required =
                content1.GetEventsByPeriodResult[p].RequiredPersons;
              var conductor = content1.GetEventsByPeriodResult[p].Conductor;
              var sceneId = content1.GetEventsByPeriodResult[p].ResourceId;
              var serverId = content1.GetEventsByPeriodResult[p].Id;
              realm.write(() => {
                realm.create(
                  'EventItem',
                  {
                    title: content1.GetEventsByPeriodResult[p].Title,
                    date: dateFormatted,
                    scene: l + 1,
                    time: eventTime,
                    alerted: alertedPersons,
                    outer: outer,
                    troups: troups,
                    required: required,
                    conductor: conductor,
                    id: id++,
                    sceneId: sceneId,
                    serverId: serverId,
                  },
                  'modified',
                );
                this.setState({realm});
              });
            }
          }
        }
      }
    });
  };

  navigate = async testBody => {
    this.setState({showModal: true});
    await this.fetchData(testBody);
    this.setState({showModal: false});
  };

  signInFlow = async () => {
    this.setState({showLoginModal: true});
    await this._signInAsync();
    this.setState({showLoginModal: false});
  };

  _signInAsync = async () => {
    await AsyncStorage.setItem(
      'development',
      JSON.stringify(this.state.prodCheck),
    );
    if (this.state.prodCheck) {
      var port = '8050';
    } else {
      port = '8051';
    }
    var mask = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (mask.test(this.state.email.toLowerCase()) === true) {
      var testBody = JSON.stringify({
        username: this.state.email,
        password: this.state.password,
        isLogin: '0',
      });
      (async () => {
        const rawResponse = await fetch(
          'https://calendar.bolshoi.ru:' +
            port +
            '/WCF/BTService.svc/TestLogin',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          },
        );
        const content2 = await rawResponse.json();
        if (content2.TestLoginResult) {
          await AsyncStorage.setItem('userToken', JSON.stringify(testBody));
          await AsyncStorage.setItem('user', this.state.email);
          await AsyncStorage.setItem('bigCheck', JSON.stringify(true));
          await AsyncStorage.setItem('smallCheck', JSON.stringify(true));
          await AsyncStorage.setItem('bigTime', 'key0');
          await AsyncStorage.setItem('smallTime', 'key0');
          if (_.isEmpty(realm.objects('EventItem'))) {
            await this.navigate(testBody);
          }
          this.props.navigation.navigate('App');
        } else {
          this.setState({correct: 'flex'});
        }
      })();
    } else {
      var testBody = JSON.stringify({
        username: 'TEST\\' + this.state.email,
        password: this.state.password,
        isLogin: '1',
      });
      (async () => {
        const rawResponse = await fetch(
          'https://calendar.bolshoi.ru:' +
            port +
            '/WCF/BTService.svc/TestLogin',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          },
        );
        const content2 = await rawResponse.json();
        if (content2.TestLoginResult) {
          await AsyncStorage.setItem('userToken', JSON.stringify(testBody));
          await AsyncStorage.setItem('user', this.state.email);
          await AsyncStorage.setItem('bigCheck', JSON.stringify(true));
          await AsyncStorage.setItem('smallCheck', JSON.stringify(true));
          await AsyncStorage.setItem('bigTime', 'key0');
          await AsyncStorage.setItem('smallTime', 'key0');
          if (_.isEmpty(realm.objects('EventItem'))) {
            await this.navigate(testBody);
          }
          this.props.navigation.navigate('App');
        } else {
          this.setState({correct: 'flex'});
        }
      })();
    }
  };
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  loginForm: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  loginButtonContainer: {
    width: 200,
    height: 50,
    alignSelf: 'center',
    marginTop: 40,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 10,
  },
  credentials: {
    alignSelf: 'center',
  },
});
