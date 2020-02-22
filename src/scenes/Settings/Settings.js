/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, AsyncStorage, Text, ActivityIndicator} from 'react-native';
import ReactNativeSettingsPage, {
  SectionRow,
  SwitchRow,
} from 'react-native-settings-page';
import {Button, Avatar, Overlay} from 'react-native-elements';
import NotificationService from '../../services/NotificationService';
import NotificationServiceLong from '../../services/NotificationServiceLong';
import appConfig from '../../../app.json';
import moment from 'moment';
import {Item, Picker, Icon} from 'native-base';
import realm from '../../services/realm';
import NetInfo from '@react-native-community/netinfo';

const smallItems = {key0: 5, key1: 10, key2: 15, key3: 30};
const bigItems = {key0: 1, key1: 2, key2: 3, key3: 5};

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
      scenes: {
        1: 'Историческая сцена',
        2: 'Новая сцена',
        3: 'Бетховенский зал',
        4: 'Верхняя сцена',
        5: 'Балетный зал',
      },
      selectedShort: undefined,
      selectedLong: undefined,
      showModal: false,
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
  static navigationOptions = {
    title: 'Настройки',
  };

  UNSAFE_componentWillMount() {
    this.getUserPrefs();
  }

  componentDidMount() {
    var newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 1);
    var lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() - 1);
    var newMomentTime = moment(newDate);
    var lastMomentTime = moment(lastDate);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({startTime: newMomentTime, endTime: lastMomentTime});
  }

  onSmallValueChange = async value => {
    this.setState({
      selectedShort: value,
    });
    await AsyncStorage.removeItem('smallTime');
    await AsyncStorage.setItem('smallTime', value);
    if (this.state.smallCheck === true) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '99' + id.toString();
        this.notif.cancelNotif(getId);
        this.notif.cancelNotif({id: getId});
        let result = realm.objects('EventItem')[id].time;
        let date = realm.objects('EventItem')[id].date;
        let startTime = date + ' ' + result.substring(0, 5) + ':00';
        let momentDate = moment(startTime);
        let datee = new Date(momentDate.toDate());
        let utcDate = moment.utc(datee);
        let title =
          this.state.scenes[realm.objects('EventItem')[id].scene] +
          '.' +
          ' Соб./Через';
        let message =
          realm.objects('EventItem')[id].title +
          ' / ' +
          smallItems[value] +
          ' минут.';
        if (
          new Date(utcDate) >
          new Date(Date.now() + 60 * 1000 * smallItems[this.state.smallTime])
        ) {
          this.notif.scheduleNotif(
            new Date(utcDate - 60 * 1000 * smallItems[value]),
            title,
            message,
          );
        }
      }
    }
  };

  onBigValueChange = async value => {
    this.setState({
      selectedLong: value,
    });
    await AsyncStorage.removeItem('bigTime');
    await AsyncStorage.setItem('bigTime', value);
    if (this.state.bigCheck === true) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '98' + id.toString();
        this.notifLong.cancelNotif(getId);
        this.notifLong.cancelNotif({id: getId});
        let result = realm.objects('EventItem')[id].time;
        let date = realm.objects('EventItem')[id].date;
        let startTime = date + ' ' + result.substring(0, 5) + ':00';
        let momentDate = moment(startTime);
        let datee = new Date(momentDate.toDate());
        let utcDate = moment.utc(datee);
        let title =
          this.state.scenes[realm.objects('EventItem')[id].scene] +
          '.' +
          ' Соб./Через';
        if (bigItems[value] === 1) {
          var message =
            realm.objects('EventItem')[id].title +
            ' / ' +
            bigItems[value] +
            ' час.';
        } else {
          var arr = [2, 3, 4];
          if (arr.includes(bigItems[value])) {
            var message =
              realm.objects('EventItem')[id].title +
              ' / ' +
              bigItems[value] +
              ' часа';
          } else {
            var message =
              realm.objects('EventItem')[id].title +
              ' / ' +
              bigItems[value] +
              ' часов.';
          }
        }
        if (
          new Date(utcDate) >
          new Date(Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime])
        ) {
          this.notif.scheduleNotif(
            new Date(utcDate - 60 * 60 * 1000 * bigItems[value]),
            title,
            message,
          );
        }
      }
    }
  };

  getUserPrefs = async () => {
    try {
      const name = await AsyncStorage.getItem('user');
      this.setState({username: name});
      const userToken = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({userToken: userToken});
      const small = JSON.parse(await AsyncStorage.getItem('smallCheck'));
      this.setState({smallCheck: small});
      const big = JSON.parse(await AsyncStorage.getItem('bigCheck'));
      this.setState({bigCheck: big});
      const smallTime = await AsyncStorage.getItem('smallTime');
      this.setState({selectedShort: smallTime});
      const bigTime = await AsyncStorage.getItem('bigTime');
      this.setState({selectedLong: bigTime});
      return [name, small, big, smallTime, bigTime, userToken];
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
    let title = 'Тестовое уведомление';
    let message = 'Событие начнется через 30 секунд';
    let messageLong = 'Событие начнется через час';
    this.notif.scheduleNotif(new Date(Date.now() + 30 * 1000), title, message);
    this.notifLong.scheduleNotif(
      new Date(Date.now() + 30 * 1000),
      title,
      messageLong,
    );
  };

  onSmallCheck = async () => {
    await AsyncStorage.removeItem('smallCheck');
    this.setState({smallCheck: !this.state.smallCheck});
    await AsyncStorage.setItem(
      'smallCheck',
      JSON.stringify(this.state.smallCheck),
    );
    var value = await AsyncStorage.getItem('smallTime');
    if (this.state.smallCheck === true) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '99' + id.toString();
        this.notif.cancelNotif(getId);
        this.notif.cancelNotif({id: getId});
        let result = realm.objects('EventItem')[id].time;
        let date = realm.objects('EventItem')[id].date;
        let startTime = date + ' ' + result.substring(0, 5) + ':00';
        let momentDate = moment(startTime);
        let datee = new Date(momentDate.toDate());
        let utcDate = moment.utc(datee);
        let title =
          this.state.scenes[realm.objects('EventItem')[id].scene] +
          '.' +
          ' Соб./Через';
        let message =
          realm.objects('EventItem')[id].title +
          ' / ' +
          smallItems[value] +
          ' минут.';
        if (
          new Date(utcDate) >
          new Date(Date.now() + 60 * 1000 * smallItems[this.state.smallTime])
        ) {
          this.notif.scheduleNotif(
            new Date(datee - 60 * 1000 * smallItems[value]),
            title,
            message,
          );
        }
      }
    } else {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '99' + id.toString();
        this.notif.cancelNotif(getId);
        this.notif.cancelNotif({id: getId});
      }
    }
  };

  onBigCheck = async () => {
    await AsyncStorage.removeItem('bigCheck');
    this.setState({bigCheck: !this.state.bigCheck});
    await AsyncStorage.setItem('bigCheck', JSON.stringify(this.state.bigCheck));
    var value = await AsyncStorage.getItem('bigTime');
    if (this.state.bigCheck === true) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '98' + id.toString();
        this.notifLong.cancelNotif(getId);
        this.notifLong.cancelNotif({id: getId});
        let result = realm.objects('EventItem')[id].time;
        let date = realm.objects('EventItem')[id].date;
        let startTime = date + ' ' + result.substring(0, 5) + ':00';
        let momentDate = moment(startTime);
        let datee = new Date(momentDate.toDate());
        let utcDate = moment.utc(datee);
        let title =
          this.state.scenes[realm.objects('EventItem')[id].scene] +
          '.' +
          ' Соб./Через';
        if (bigItems[value] === 1) {
          var message =
            realm.objects('EventItem')[id].title +
            ' / ' +
            bigItems[value] +
            ' час.';
        } else {
          var arr = [2, 3, 4];
          if (arr.includes(bigItems[value])) {
            var message =
              realm.objects('EventItem')[id].title +
              ' / ' +
              bigItems[value] +
              ' часа';
          } else {
            var message =
              realm.objects('EventItem')[id].title +
              ' / ' +
              bigItems[value] +
              ' часов.';
          }
        }
        if (
          new Date(utcDate) >
          new Date(Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime])
        ) {
          this.notifLong.scheduleNotif(
            new Date(datee - 60 * 60 * 1000 * bigItems[value]),
            title,
            message,
          );
        }
      }
    } else {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        let getId = '98' + id.toString();
        this.notifLong.cancelNotif(getId);
        this.notifLong.cancelNotif({id: getId});
      }
    }
  };

  onRegister(token) {
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
  }

  fetchData = async testBody => {
    var testArr = [];
    await NetInfo.fetch().then(async state => {
      if (state.isConnected === true && this.state.usertoken !== null) {
        let rawResponseScenes = await fetch(
          'https://calendar.bolshoi.ru:8050/WCF/BTService.svc/GetScenes',
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
    await NetInfo.fetch().then(async state => {
      if (
        state.isConnected === true &&
        //realm.objects('EventItem') === null &&
        this.state.usertoken !== null
      ) {
        let rawResponse = await fetch(
          'https://calendar.bolshoi.ru:8050/WCF/BTService.svc/GetScenes',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          },
        );
        const contentScenes = await rawResponse.json();
        var id = 0;
        // if (realm.objects('EventItem') !== null) {
        //   realm.write(() => {
        //     let allEvents = realm.objects('EventItem');
        //     realm.delete(allEvents);
        //   });
        // }
        var scenesArr = [];
        for (var h = 0; h < contentScenes.GetScenesResult.length; h++) {
          scenesArr.push(contentScenes.GetScenesResult[h].ResourceId);
        }
        for (var l = 0; l < scenesArr.length; l++) {
          let urlTest =
            'https://calendar.bolshoi.ru:8050/WCF/BTService.svc/GetEventsByPeriod/' +
            scenesArr[l] +
            '/' +
            moment(this.state.endTime).format('YYYY-MM-DDTHH:MM:SS') +
            '/' +
            moment(this.state.startTime).format('YYYY-MM-DDTHH:MM:SS');
          let rawResponse1 = await fetch(urlTest, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody,
          });
          const content1 = await rawResponse1.json();
          for (var p = 0; p < content1.GetEventsByPeriodResult.length; p++) {
            if (
              content1.GetEventsByPeriodResult[p].StartDateStr !== undefined &&
              content1.GetEventsByPeriodResult[p].Title !== undefined
            ) {
              let beginTime = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(11);
              let endingTime = content1.GetEventsByPeriodResult[
                p
              ].EndDateStr.substring(11);
              let eventTime = beginTime + ' - ' + endingTime;
              let date = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(0, 10)
                .split('.')
                .join('-');
              let dateFormatted =
                date.substring(6) +
                '-' +
                date.substring(3).substring(0, 2) +
                '-' +
                date.substring(0, 2);
              let alertedPersons =
                content1.GetEventsByPeriodResult[p].AlertedPersons;
              let troups = content1.GetEventsByPeriodResult[p].Troups;
              let outer = content1.GetEventsByPeriodResult[p].OuterPersons;
              let required =
                content1.GetEventsByPeriodResult[p].RequiredPersons;
              var conductor = content1.GetEventsByPeriodResult[p].Conductor;
              realm.write(() => {
                realm.create(
                  'EventItem',
                  {
                    title: content1.GetEventsByPeriodResult[p].Title,
                    date: dateFormatted,
                    scene: l + 1,
                    time: eventTime,
                    alerted: alertedPersons,
                    outer: outer,
                    troups: troups,
                    required: required,
                    conductor: conductor,
                    id: id++,
                  },
                  'modified',
                );
                this.setState({realm});
              });
            }
          }
        }
      }
    });
  };

  refresh = async testBody => {
    this.setState({showModal: true});
    await this.fetchData(testBody);
    this.setState({showModal: false});
  };

  onRefreshClick = async () => {
    await this.refresh(this.state.userToken);
    this.props.navigation.navigate('Agenda');
  };

  render() {
    return (
      <ReactNativeSettingsPage>
        <Overlay
          isVisible={this.state.showModal}
          overlayStyle={{
            width: '80%',
            height: '10%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center'}}>
            Подождите, идет обновление данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
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
            <View>
              <Text
                style={{
                  fontSize: 30,
                  marginLeft: '5%',
                  textTransform: 'uppercase',
                }}>
                {this.state.username}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: '5%',
                  textTransform: 'uppercase',
                  color: 'lightgrey',
                }}>
                {this.state.username}
              </Text>
            </View>
            <View style={{marginTop: '15%'}}>
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
                  marginLeft: '5%',
                }}
                titleStyle={{color: 'red', fontSize: 12}}
              />
            </View>
          </View>
        </View>
        <SectionRow text="Уведомления перед началом">
          <SwitchRow
            text="Включить"
            iconName="toggle-on"
            _value={this.state.smallCheck}
            _onValueChange={this.onSmallCheck}
          />
          <Item picker>
            <Picker
              mode="dialog"
              iosIcon={
                <Icon
                  name="arrow-down"
                  style={{color: '#000', position: 'absolute', right: 0}}
                />
              }
              iosHeader="Выберите"
              style={{minWidth: '97%', position: 'relative'}}
              placeholder="Выберите время"
              placeholderStyle={{color: '#bfc6ea'}}
              placeholderIconColor="#007aff"
              selectedValue={this.state.selectedShort}
              onValueChange={this.onSmallValueChange.bind(this)}>
              <Picker.Item label="5 минут" value="key0" />
              <Picker.Item label="10 минут" value="key1" />
              <Picker.Item label="15 минут" value="key2" />
              <Picker.Item label="30 минут" value="key3" />
            </Picker>
          </Item>
        </SectionRow>
        <SectionRow text="Уведомления задолго">
          <SwitchRow
            text="Включить"
            iconName="toggle-on"
            _value={this.state.bigCheck}
            _onValueChange={this.onBigCheck}
          />
          <Item picker>
            <Picker
              mode="dialog"
              iosIcon={
                <Icon
                  name="arrow-down"
                  style={{color: '#000', position: 'absolute', right: 0}}
                />
              }
              style={{minWidth: '97%', position: 'relative'}}
              placeholder="Выберите время"
              placeholderStyle={{color: '#bfc6ea'}}
              placeholderIconColor="#007aff"
              selectedValue={this.state.selectedLong}
              onValueChange={this.onBigValueChange.bind(this)}>
              <Picker.Item label="1 час" value="key0" />
              <Picker.Item label="2 часа" value="key1" />
              <Picker.Item label="3 часа" value="key2" />
              <Picker.Item label="5 часов" value="key3" />
            </Picker>
          </Item>
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
        <SectionRow text="Обновить данные">
          <Button
            title="Обновить все"
            iconName="refresh"
            onPress={this.onRefreshClick}
            buttonStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderRadius: 6,
              borderColor: 'red',
              margin: 5,
            }}
            titleStyle={{color: 'red', fontSize: 16, fontWeight: '700'}}
          />
        </SectionRow>
      </ReactNativeSettingsPage>
    );
  }
}
