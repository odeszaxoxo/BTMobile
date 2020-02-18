/* eslint-disable react/no-did-mount-set-state */
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import SignInScreen from './src/scenes/AuthFlow/SignIn/SignInScreen';
import AuthLoadingScreen from './src/scenes/AuthFlow/AuthLoadingScreen/AuthLoadingScreen';
import Scenes from './src/scenes/ScenesList/ScenesList';
import AgendaScreen from './src/scenes/Agenda/AgendaScreen';
import Settings from './src/scenes/Settings/Settings';
import jsonData from './src/data/data1.json';
import moment from 'moment';
import NotificationService from './src/services/NotificationService';
import NotificationServiceLong from './src/services/NotificationServiceLong';
import appConfig from './app.json';
import realm from './src/services/realm';

//var _ = require('lodash');

const smallItems = {key0: 5, key1: 10, key2: 15, key3: 30};
const bigItems = {key0: 1, key1: 2, key2: 3, key3: 5};

const AppStack = createStackNavigator({
  Agenda: AgendaScreen,
  Scenes: Scenes,
  Settings: Settings,
});

const AuthStack = createStackNavigator(
  {SignIn: SignInScreen},
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#000',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  },
);

const SwitchNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#1E151A',
      },
      headerTintColor: '#1E151A',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  },
);

const AppContainer = createAppContainer(SwitchNavigator);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: jsonData,
      dataAPI: {},
      senderId: appConfig.senderID,
      scenes: {
        1: 'Историческая сцена',
        2: 'Новая сцена',
        3: 'Бетховенский зал',
        4: 'Верхняя сцена',
        5: 'Балетный зал',
      },
      smallTime: 'key0',
      bigTime: 'key0',
      bigCheck: true,
      smallCheck: true,
      username: null,
    };
    this.notif = new NotificationService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
    this.notifLong = new NotificationServiceLong(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
  }

  getUserPrefs = async () => {
    try {
      const small = JSON.parse(await AsyncStorage.getItem('smallCheck'));
      this.setState({smallCheck: small});
      const big = JSON.parse(await AsyncStorage.getItem('bigCheck'));
      this.setState({bigCheck: big});
      const smallTime = await AsyncStorage.getItem('smallTime');
      this.setState({smallTime: smallTime});
      const bigTime = await AsyncStorage.getItem('bigTime');
      this.setState({bigTime: bigTime});
      const token = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({usertoken: token});
      return [small, big, smallTime, bigTime, token];
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchData = async () => {
    const token = JSON.parse(await AsyncStorage.getItem('userToken'));
    this.setState({usertoken: token});
    var testBody = this.state.usertoken;
    var testArr = [];
    NetInfo.fetch().then(async state => {
      if (state.isConnected === true && this.state.usertoken !== null) {
        let rawResponseScenes = await fetch(
          'http://calendar.bolshoi.ru:8050/GetScenes',
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
                },
                'modified',
              );
            }
          }
        });
        this.setState({realm});
      }
    });
    NetInfo.fetch().then(async state => {
      if (
        state.isConnected === true &&
        //realm.objects('EventItem') === null &&
        this.state.usertoken !== null
      ) {
        var testBody1 = this.state.usertoken;
        let rawResponse = await fetch(
          'http://calendar.bolshoi.ru:8050/GetScenes',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody1,
          },
        );
        const contentScenes = await rawResponse.json();
        var testData = [];
        var id = 0;
        // if (realm.objects('EventItem') !== null) {
        //   realm.write(() => {
        //     let allEvents = realm.objects('EventItem');
        //     realm.delete(allEvents);
        //   });
        // }
        for (var l = 1; l <= contentScenes.GetScenesResult.length; l++) {
          let rawResponse1 = await fetch(
            'http://calendar.bolshoi.ru:8050/GetEvents/' +
              contentScenes.GetScenesResult[l - 1].ResourceId,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: testBody,
            },
          );
          const content1 = await rawResponse1.json();
          for (var p = 1; p <= content1.GetEventsResult.length; p++) {
            var beginTime = content1.GetEventsResult[
              p - 1
            ].StartDateStr.substring(11);
            var endingTime = content1.GetEventsResult[
              p - 1
            ].EndDateStr.substring(11);
            var eventTime = beginTime + ' - ' + endingTime;
            var date = content1.GetEventsResult[p - 1].StartDateStr.substring(
              0,
              10,
            )
              .split('.')
              .join('-');
            var dateFormatted =
              date.substring(6) +
              '-' +
              date.substring(3).substring(0, 2) +
              '-' +
              date.substring(0, 2);
            testData.push({
              text: content1.GetEventsResult[p - 1].Title,
              scene: content1.GetEventsResult[p - 1].ResourceId,
              time: eventTime,
              date: dateFormatted,
            });
            realm.write(() => {
              realm.create(
                'EventItem',
                {
                  title: content1.GetEventsResult[p - 1].Title,
                  date: dateFormatted,
                  scene: l,
                  time: eventTime,
                  id: id++,
                },
                'modified',
              );
              this.setState({realm});
            });
          }
        }
      }
    });
  };

  async componentDidMount() {
    this.getUserPrefs();
    this.fetchData();
    for (var id = 0; id < realm.objects('EventItem').length; id++) {
      let getId = '99' + id.toString();
      let getBigId = '98' + id.toString();
      this.notif.cancelNotif(getId);
      this.notif.cancelNotif({id: getId});
      this.notifLong.cancelNotif(getBigId);
      this.notifLong.cancelNotif({id: getBigId});
      let result = realm.objects('EventItem')[id].time;
      let date = realm.objects('EventItem')[id].date;
      let startTime = date + ' ' + result.substring(0, 5) + ':00';
      let momentDate = moment(startTime);
      let datee = new Date(momentDate.toDate());
      let utcDate = moment.utc(datee);
      // let sendDate = moment(moment.utc(utcDate).toDate())
      //   .local()
      //   .format('YYYY-MM-DDTHH:mm:ss');
      let title =
        this.state.scenes[realm.objects('EventItem')[id].scene] +
        '.' +
        ' Соб./Через';
      let message =
        realm.objects('EventItem')[id].title +
        ' / ' +
        smallItems[this.state.smallTime] +
        ' минут.';
      if (bigItems[this.state.bigTime] === 1) {
        var messageLong =
          realm.objects('EventItem')[id].title +
          ' / ' +
          bigItems[this.state.bigTime] +
          ' час.';
      } else {
        var arr = [2, 3, 4];
        if (arr.includes(bigItems[this.state.bigTime])) {
          var messageLong =
            realm.objects('EventItem')[id].title +
            ' / ' +
            bigItems[this.state.bigTime] +
            ' часа';
        } else {
          var messageLong =
            realm.objects('EventItem')[id].title +
            ' / ' +
            bigItems[this.state.bigTime] +
            ' часов.';
        }
      }
      if (
        new Date(utcDate) >
        new Date(Date.now() + 60 * 1000 * smallItems[this.state.smallTime])
      ) {
        if (this.state.smallCheck === true) {
          this.notif.scheduleNotif(
            new Date(utcDate - 60 * 1000 * smallItems[this.state.smallTime]),
            title,
            message,
          );
        }
      }
      if (
        new Date(utcDate) >
        new Date(Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime])
      ) {
        if (this.state.bigCheck === true) {
          this.notifLong.scheduleNotif(
            new Date(utcDate - 60 * 1000 * 60 * bigItems[this.state.bigTime]),
            title,
            messageLong,
          );
        }
      }
    }
  }

  onRegister(token) {
    console.log('Registered !', JSON.stringify(token));
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
    console.log(notif.title, notif.message);
  }

  render() {
    return <AppContainer />;
  }
}
