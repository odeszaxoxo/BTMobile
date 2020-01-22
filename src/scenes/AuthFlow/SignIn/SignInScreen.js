/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {Button, Input, Icon, Text} from 'react-native-elements';
import login from '../../../images/login.jpg.png';

const Realm = require('realm');

const SceneSchema = {
  name: 'Scene',
  primaryKey: 'id',
  properties: {selected: 'bool', id: 'int', title: 'string'},
};

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

  componentDidMount() {
    const {realm} = this.state;
    Realm.open({schema: [SceneSchema]}).then(() => {
      realm.write(() => {
        realm.create(
          'Scene',
          {selected: false, id: 1, title: 'Историческая сцена'},
          'modified',
        );
        realm.create(
          'Scene',
          {selected: false, id: 2, title: 'Новая сцена'},
          'modified',
        );
        realm.create(
          'Scene',
          {selected: false, id: 3, title: 'Бетховенский зал'},
          'modified',
        );
        realm.create(
          'Scene',
          {selected: false, id: 4, title: 'Верхняя сцена'},
          'modified',
        );
        realm.create(
          'Scene',
          {selected: false, id: 5, title: 'Балетный зал'},
          'modified',
        );
      });
      //this.setState({scenes: realm.objects('Scene')});
      this.setState({realm});
    });
  }

  render() {
    return (
      <ImageBackground source={login} style={styles.container}>
        <KeyboardAvoidingView behavior="position">
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
          <View style={styles.credentials}>
            <Text h4 h4Style={{color: '#fff', fontSize: 10, fontWeight: '200'}}>
              Powered by Adamcode
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  _signInAsync = async () => {
    if (this.state.email === 'admin' && this.state.password === 'admin') {
      await AsyncStorage.setItem('userToken', 'abc');
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
    marginTop: '80%',
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
