import React from 'react';

import {ActivityIndicator, StatusBar, View, AsyncStorage} from 'react-native';

export default class AuthLoadingScreen extends React.Component {
  componentDidMount() {
    console.log(123);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    console.log(userToken);
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  // Loading content
  render() {
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
