import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';

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

const Realm = require('realm');

var _ = require('lodash');

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

const EventSchema = {
  name: 'EventItem',
  properties: {
    title: 'string',
    scene: 'int',
    time: 'string',
    date: 'string',
    id: 'int',
  },
  primaryKey: 'id',
};

const SelectedListSchema = {
  name: 'Selected',
  properties: {selected: 'string', id: 'int'},
  primaryKey: 'id',
};

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
      realm: new Realm(),
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
      return [small, big, smallTime, bigTime];
    } catch (error) {
      console.log(error.message);
    }
  };

  componentDidMount() {
    const {realm} = this.state;
    this.getUserPrefs();
    this.notif.cancelDelivered();
    this.notifLong.cancelDelivered();
    Realm.open({schema: [SelectedListSchema]}).then(() => {
      realm.write(() => {
        if (_.isEmpty(realm.objects('Selected'))) {
          realm.create(
            'Selected',
            {selected: JSON.stringify([1, 2, 3, 4, 5]), id: 1},
            'modified',
          );
          this.setState({realm});
        }
      });
    });
    Realm.open({schema: [EventSchema]}).then(() => {
      if (realm.objects('EventItem') == null) {
        realm.write(() => {
          for (var i = 0; i < Object.keys(this.state.data.events).length; i++) {
            realm.create('EventItem', {
              title: this.state.data.events[
                Object.keys(this.state.data.events)[i]
              ].text,
              date: this.state.data.events[
                Object.keys(this.state.data.events)[i]
              ].date,
              scene: this.state.data.events[
                Object.keys(this.state.data.events)[i]
              ].scene,
              time: this.state.data.events[
                Object.keys(this.state.data.events)[i]
              ].time,
              id: i,
            });
          }
          this.setState({realm});
        });
      } else {
        realm.write(() => {
          let allEvents = realm.objects('EventItem');
          realm.delete(allEvents);
        });
        realm.write(() => {
          for (var i = 0; i < Object.keys(this.state.data.events).length; i++) {
            realm.create(
              'EventItem',
              {
                title: this.state.data.events[
                  Object.keys(this.state.data.events)[i]
                ].text,
                date: this.state.data.events[
                  Object.keys(this.state.data.events)[i]
                ].date,
                scene: this.state.data.events[
                  Object.keys(this.state.data.events)[i]
                ].scene,
                time: this.state.data.events[
                  Object.keys(this.state.data.events)[i]
                ].time,
                id: i,
              },
              true,
            );
          }
          this.setState({realm});
        });
      }
    });
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
      let sendDate = moment(moment.utc(utcDate).toDate())
        .local()
        .format('YYYY-MM-DDTHH:mm:ss');
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
          console.log(
            new Date(utcDate),
            new Date(Date.now() + 60 * 1000 * smallItems[this.state.smallTime]),
            'small',
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
          console.log(
            new Date(utcDate),
            new Date(
              Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime],
            ),
            'big',
            new Date(utcDate) >
              new Date(
                Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime],
              ),
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
