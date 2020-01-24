/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, AsyncStorage, Text} from 'react-native';
import ReactNativeSettingsPage, {
  SectionRow,
  NavigateRow,
  SwitchRow,
} from 'react-native-settings-page';
import {Button, Avatar} from 'react-native-elements';
import NotificationService from '../../services/NotificationService';
import appConfig from '../../../app.json';
import moment from 'moment';

const Realm = require('realm');

export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      switch: true,
      value: 80,
      senderId: appConfig.senderID,
      username: '',
      smallCheck: false,
      bigCheck: false,
      realm: new Realm(),
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
  }
  static navigationOptions = {
    title: 'Настройки',
  };

  componentDidMount() {
    this.getUserPrefs();
  }

  getUserPrefs = async () => {
    try {
      const name = await AsyncStorage.getItem('user');
      this.setState({username: name});
      const small = JSON.parse(await AsyncStorage.getItem('smallCheck'));
      this.setState({smallCheck: small});
      const big = JSON.parse(await AsyncStorage.getItem('bigCheck'));
      this.setState({bigCheck: big});
      return [name, small, big];
    } catch (error) {
      console.log(error.message);
    }
  };

  _navigateToScreen = () => {
    const {navigation} = this.props;
    navigation.navigate('Your-Screen-Name');
  };

  _logout = async () => {
    const {navigation} = this.props;
    navigation.navigate('SignIn');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  };

  _send = () => {
    console.log('notification');
    let title = 'Тестовое уведомление';
    let message = 'Событие начнется через 30 секунд';
    this.notif.scheduleNotif(new Date(Date.now() + 30 * 1000), title, message);
  };

  onSmallCheck = async () => {
    const {realm} = this.state;
    await AsyncStorage.removeItem('smallCheck');
    this.setState({smallCheck: !this.state.smallCheck});
    await AsyncStorage.setItem(
      'smallCheck',
      JSON.stringify(this.state.smallCheck),
    );
    if (this.state.smallCheck === true) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let result = realm.objects('EventItem')[id].time;
        let date = realm.objects('EventItem')[id].date;
        let startTime = date + ' ' + result.substring(0, 5) + ':00';
        let momentDate = moment(startTime);
        let datee = new Date(momentDate.toDate());
        let title = this.state.scenes[realm.objects('EventItem')[id].scene];
        let message =
          'Событие ' +
          realm.objects('EventItem')[id].title +
          ' начнется через 5 минут.';
        this.notif.scheduleNotif(
          new Date(datee - 60 * 1000 * 5),
          title,
          message,
        );
      }
      console.log('added', this.notif);
    } else {
      this.notif.cancelAll();
      console.log('deleted', this.notif);
    }
  };
  /*for (var id = 0; id < realm.objects('EventItem').length; id++) {
      let result = realm.objects('EventItem')[id].time;
      let date = realm.objects('EventItem')[id].date;
      let startTime = date + ' ' + result.substring(0, 5) + ':00';
      let momentDate = moment(startTime);
      let datee = new Date(momentDate.toDate());
      let title = this.state.scenes[realm.objects('EventItem')[id].scene];
      let message =
        'Событие ' +
        realm.objects('EventItem')[id].title +
        ' начнется через 5 минут.';
      this.notif.scheduleNotif(new Date(datee - 60 * 1000 * 5), title, message);
    } */

  onBigCheck = async () => {
    await AsyncStorage.removeItem('bigCheck');
    this.setState({bigCheck: !this.state.bigCheck});
    await AsyncStorage.setItem(
      'bigCheck',
      JSON.stringify(this.state.smallCheck),
    );
  };

  onRegister(token) {
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
  }

  render() {
    return (
      <ReactNativeSettingsPage>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '10%',
            marginBottom: '5%',
          }}>
          <View style={{marginLeft: '5%'}}>
            <Avatar
              rounded
              title={this.state.username.substring(0, 2).toUpperCase()}
              size="xlarge"
            />
          </View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '50%',
            }}>
            <View style={{marginTop: '5%'}}>
              <Text
                style={{
                  fontSize: 30,
                  marginLeft: '2%',
                  textTransform: 'uppercase',
                }}>
                {this.state.username}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: '2%',
                  textTransform: 'uppercase',
                  color: 'lightgrey',
                }}>
                {this.state.username}
              </Text>
            </View>
            <Button
              title="Выйти"
              iconName="sign-out"
              onPress={this._logout}
              buttonStyle={{
                backgroundColor: 'transparent',
                width: '50%',
                borderColor: 'red',
                borderRadius: 100,
                borderWidth: 0.5,
              }}
              titleStyle={{color: 'red', fontSize: 12}}
            />
          </View>
        </View>
        <SectionRow text="Уведомления перед началом">
          <SwitchRow
            text="Включить"
            iconName="toggle-on"
            _value={this.state.smallCheck}
            _onValueChange={this.onSmallCheck}
          />
          <NavigateRow
            text="Время"
            iconName="calendar"
            onPressCallback={this._navigateToScreen}
          />
        </SectionRow>
        <SectionRow text="Уведомления задолго">
          <SwitchRow
            text="Включить"
            iconName="toggle-on"
            _value={this.state.bigCheck}
            _onValueChange={this.onBigCheck}
          />
          <NavigateRow
            text="Время"
            iconName="calendar"
            onPressCallback={this._navigateToScreen}
          />
        </SectionRow>
        <SectionRow text="Тест уведомлений">
          <Button
            title="Отправить уведомление"
            iconName="exclamation"
            onPress={this._send}
            buttonStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderRadius: 6,
              borderColor: '#42a5f5',
              margin: 5,
            }}
            titleStyle={{color: '#42a5f5', fontSize: 16, fontWeight: '700'}}
          />
        </SectionRow>
      </ReactNativeSettingsPage>
    );
  }
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
