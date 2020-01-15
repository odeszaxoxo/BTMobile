import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import SignInScreen from './src/scenes/AuthFlow/SignIn/SignInScreen';
import AuthLoadingScreen from './src/scenes/AuthFlow/AuthLoadingScreen/AuthLoadingScreen';
import Scenes from './src/scenes/ScenesList/ScenesList';
import AgendaScreen from './src/scenes/Agenda/AgendaScreen';
import Settings from './src/scenes/Settings/Settings';

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

export default createAppContainer(
  createSwitchNavigator(
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
  ),
);
