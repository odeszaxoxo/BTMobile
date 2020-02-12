/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import {Button, Input, Icon, Text} from 'react-native-elements';
import login from '../../../images/login.jpg.png';

const Realm = require('realm');

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      list: [],
      realm: new Realm(),
      correct: 'none',
    };
  }
  static navigationOptions = {
    title: '',
  };

  render() {
    return (
      <ImageBackground source={login} style={styles.container}>
        <KeyboardAvoidingView
          behavior="position"
          style={{
            minHeight: '45%',
            flexDirection: 'column',
            justifyContent: 'space-around',
            marginTop: '50%',
          }}>
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
                onPress={this._signInAsync}
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
          <Text h4 h4Style={{color: '#fff', fontSize: 10, fontWeight: '200'}}>
            Powered by Adamcode
          </Text>
        </View>
      </ImageBackground>
    );
  }

  _signInAsync = async () => {
    if (
      (this.state.email === 'admin' && this.state.password === 'admin') ||
      (this.state.email === 'user' && this.state.password === 'user')
    ) {
      await AsyncStorage.setItem('userToken', 'abc');
      await AsyncStorage.setItem('user', this.state.email);
      await AsyncStorage.setItem('bigCheck', JSON.stringify(true));
      await AsyncStorage.setItem('smallCheck', JSON.stringify(true));
      await AsyncStorage.setItem('bigTime', 'key0');
      await AsyncStorage.setItem('smallTime', 'key0');
      this.props.navigation.navigate('App');
    } else {
      this.setState({correct: 'flex'});
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
    height: '50%',
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
