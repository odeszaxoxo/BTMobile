import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import React, {Component} from 'react';

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

  componentDidMount() {
    const {realm} = this.state;
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
      let result = realm.objects('EventItem')[id].time;
      let date = realm.objects('EventItem')[id].date;
      let startTime = date + ' ' + result.substring(0, 5) + ':00';
      let momentDate = moment(startTime);
      let datee = new Date(momentDate.toDate());
      var test = moment.utc(datee).format();
      var dateTime = moment.utc(test, 'YYYY-MM-DD HH:mm');
      var local = new Date(dateTime.local().format('YYYY-MM-DDTHH:mm'));
      console.log(datee, local);
      let title = this.state.scenes[realm.objects('EventItem')[id].scene];
      let message =
        'Событие ' +
        realm.objects('EventItem')[id].title +
        ' начнется через 5 минут.';
      let messageLong =
        'Событие ' +
        realm.objects('EventItem')[id].title +
        ' начнется через 1 час.';
      this.notif.scheduleNotif(new Date(datee - 60 * 1000 * 5), title, message);
      this.notifLong.scheduleNotif(
        new Date(datee - 60 * 1000 * 60),
        title,
        messageLong,
      );
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
