import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import React, {Component} from 'react';

import SignInScreen from './src/scenes/AuthFlow/SignIn/SignInScreen';
import AuthLoadingScreen from './src/scenes/AuthFlow/AuthLoadingScreen/AuthLoadingScreen';
import Scenes from './src/scenes/ScenesList/ScenesList';
import AgendaScreen from './src/scenes/Agenda/AgendaScreen';
import Settings from './src/scenes/Settings/Settings';
import jsonData from './src/data/data1.json';

const Realm = require('realm');

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
  name: 'Event',
  properties: {title: 'string', scene: 'int', time: 'string', date: 'string'},
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
    };
  }

  componentDidMount() {
    const {realm} = this.state;
    if (realm.objects('Selected') == null) {
      Realm.open({schema: [SelectedListSchema]}).then(() => {
        realm.write(() => {
          realm.create(
            'Selected',
            {selected: JSON.stringify([1, 2, 3, 4, 5]), id: 1},
            'modified',
          );
          this.setState({realm});
        });
      });
    }
    Realm.open({schema: [EventSchema]}).then(() => {
      if (realm.objects('Event') == null) {
        for (var i = 0; i < Object.keys(this.state.data.events).length; i++) {
          realm.write(() => {
            realm.create('Event', {
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
            });
            this.setState({realm});
          });
        }
      } else {
        realm.write(() => {
          for (var k = 0; k < Object.keys(this.state.data.events).length; k++) {
            realm.objects('Event')[k].title = this.state.data.events[
              Object.keys(this.state.data.events)[k]
            ].text;
            realm.objects('Event')[k].date = this.state.data.events[
              Object.keys(this.state.data.events)[k]
            ].date;
            realm.objects('Event')[k].scene = this.state.data.events[
              Object.keys(this.state.data.events)[k]
            ].scene;
            realm.objects('Event')[k].time = this.state.data.events[
              Object.keys(this.state.data.events)[k]
            ].time;
          }
          this.setState({realm});
        });
        console.log('exists', realm.objects('Event'));
      }
    });
  }

  render() {
    return <AppContainer />;
  }
}
