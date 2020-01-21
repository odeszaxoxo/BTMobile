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
    };
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
  }

  render() {
    return <AppContainer />;
  }
}
