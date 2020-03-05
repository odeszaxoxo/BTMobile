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
import DatePicker from 'react-native-datepicker';

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
      showSecondModal: false,
      startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30 * 3),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 30 * 3),
      smallTime: 'key0',
      bigTime: 'key0',
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

  onSmallValueChange = async value => {
    this.setState({
      smallTime: value,
    });
  };

  onBigValueChange = async value => {
    this.setState({
      bigTime: value,
    });
  };

  setNotifications = async () => {
    var firstDate = new Date();
    var newMomentTime = moment(firstDate, 'YYYY-MM-DD');
    var lastMomentTime = moment(firstDate, 'YYYY-MM-DD').add(3, 'days');
    this.notif.cancelAll();
    this.notifLong.cancelAll();
    for (let i = 0; i < realm.objects('EventItem').length; i++) {
      let getId = '99' + i.toString();
      let getBigId = '98' + i.toString();
      this.notif.cancelNotif(getId);
      this.notif.cancelNotif({id: getId});
      this.notifLong.cancelNotif(getBigId);
      this.notifLong.cancelNotif({id: getBigId});
    }
    var registered = [];
    var notifId = 0;
    var notifIdLong = 0;
    if (realm.objects('EventItem').length > 0) {
      for (var id = 0; id < realm.objects('EventItem').length; id++) {
        if (
          realm.objects('EventItem')[id].date <=
            lastMomentTime.format('YYYY-MM-DD') &&
          realm.objects('EventItem')[id].date >=
            newMomentTime.format('YYYY-MM-DD')
        ) {
          registered.push(id);
          let result = realm.objects('EventItem')[id].time;
          let date = realm.objects('EventItem')[id].date;
          let startTime = date + ' ' + result.substring(0, 5) + ':00';
          let momentDate = moment(startTime);
          let datee = new Date(momentDate.toDate());
          let utcDate = moment.utc(datee);
          let title =
            realm.objects('Scene')[realm.objects('EventItem')[id].scene - 1]
              .title +
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
              new Date(
                Date.now() + 60 * 1000 * smallItems[this.state.smallTime],
              ) &&
            new Date(utcDate) < new Date(Date.now() + 60 * 1000 * 60 * 24)
          ) {
            if (this.state.smallCheck === true) {
              notifId++;
              this.notif.scheduleNotif(
                new Date(
                  utcDate - 60 * 1000 * smallItems[this.state.smallTime],
                ),
                title,
                message,
                notifId,
              );
            }
          }
          if (
            new Date(utcDate) >
              new Date(
                Date.now() + 60 * 1000 * 60 * bigItems[this.state.bigTime],
              ) &&
            new Date(utcDate) < new Date(Date.now() + 60 * 1000 * 60 * 24)
          ) {
            if (this.state.bigCheck === true) {
              notifIdLong++;
              this.notifLong.scheduleNotif(
                new Date(
                  utcDate - 60 * 1000 * 60 * bigItems[this.state.bigTime],
                ),
                title,
                messageLong,
                notifIdLong,
              );
            }
          }
        }
      }
      this.setState({registered: registered});
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

  onSmallCheck = async () => {
    this.setState({smallCheck: !this.state.smallCheck});
  };

  onBigCheck = async () => {
    this.setState({bigCheck: !this.state.bigCheck});
  };

  onRegister = token => {
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  };

  onNotif = notif => {
    console.log(notif);
  };

  fetchData = async testBody => {
    if (realm.objects('EventItem') !== null) {
      realm.write(() => {
        let allEvents = realm.objects('EventItem');
        realm.delete(allEvents);
      });
    }
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
                  resourceId: content.GetScenesResult[l - 1].ResourceId,
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
                  resourceId: content.GetScenesResult[l - 1].ResourceId,
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
        var scenesArr = [];
        for (var h = 0; h < contentScenes.GetScenesResult.length; h++) {
          scenesArr.push(contentScenes.GetScenesResult[h].ResourceId);
        }
        for (var l = 0; l < scenesArr.length; l++) {
          let urlTest =
            'https://calendar.bolshoi.ru:8050/WCF/BTService.svc/GetEventsByPeriod/' +
            scenesArr[l] +
            '/' +
            moment(this.state.startDate).format('YYYY-MM-DDTHH:mm:ss') +
            '/' +
            moment(this.state.endDate).format('YYYY-MM-DDTHH:mm:ss');
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
              var sceneId = content1.GetEventsByPeriodResult[p].ResourceId;
              var serverId = content1.GetEventsByPeriodResult[p].Id;
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
                    sceneId: sceneId,
                    serverId: serverId,
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

  fixedThreeUpdate = async () => {
    var months = 3;
    await this.setMonths(months);
    await this.onRefreshClick();
  };

  fixedSixUpdate = async () => {
    var months = 6;
    await this.setMonths(months);
    await this.onRefreshClick();
  };

  setMonths = months => {
    var date = new Date();
    var dateToday = moment(date);
    var refreshDate = moment(date, 'YYYY-MM-DD').add(months, 'months');
    this.setState({startDate: dateToday, endDate: refreshDate});
  };

  saveSettings = async () => {
    this.setState({showSecondModal: true});
    await AsyncStorage.removeItem('smallTime');
    await AsyncStorage.setItem('smallTime', this.state.smallTime);
    await AsyncStorage.removeItem('bigTime');
    await AsyncStorage.setItem('bigTime', this.state.bigTime);
    await AsyncStorage.removeItem('smallCheck');
    await AsyncStorage.setItem(
      'smallCheck',
      JSON.stringify(this.state.smallCheck),
    );
    await AsyncStorage.removeItem('bigCheck');
    await AsyncStorage.setItem('bigCheck', JSON.stringify(this.state.bigCheck));
    await this.setNotifications();
    this.setState({showSecondModal: false});
  };

  goToAgenda = async () => {
    await this.saveSettings();
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
        <Overlay
          isVisible={this.state.showSecondModal}
          overlayStyle={{
            width: '80%',
            height: '10%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center'}}>
            Подождите, идет обновление уведомлений.
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
        <SectionRow text="Настройка уведомлений">
          <Text
            style={{
              fontSize: 14,
              marginLeft: '2%',
              fontWeight: '700',
              marginBottom: 10,
            }}>
            Уведомления незадолго до события
          </Text>
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
          <Text
            style={{
              fontSize: 14,
              marginLeft: '2%',
              fontWeight: '700',
              marginBottom: 10,
              marginTop: 20,
            }}>
            Уведомления задолго до события
          </Text>
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
          <Button
            title="Сохранить"
            iconName="refresh"
            onPress={this.goToAgenda}
            buttonStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderRadius: 6,
              borderColor: '#42a5f5',
              width: '80%',
              alignSelf: 'center',
              margin: 10,
            }}
            titleStyle={{
              color: '#42a5f5',
              fontSize: 16,
              fontWeight: '700',
            }}
          />
        </SectionRow>
        <SectionRow text="Обновить данные">
          <Text style={{marginLeft: 15, marginRight: 15, marginBottom: 15}}>
            Это может занять много времени, в зависимости от выбранного Вами
            промежутка дат.
          </Text>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              zIndex: 0,
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'space-around',
                flexDirection: 'row',
              }}>
              <Button
                title="3 месяца"
                iconName="refresh"
                onPress={this.fixedThreeUpdate}
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 0.5,
                  borderRadius: 6,
                  borderColor: '#42a5f5',
                  margin: 5,
                  width: '80%',
                  alignSelf: 'center',
                }}
                titleStyle={{
                  color: '#42a5f5',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              />
              <Button
                title="6 месяцев"
                iconName="refresh"
                onPress={this.fixedSixUpdate}
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 0.5,
                  borderRadius: 6,
                  borderColor: '#42a5f5',
                  margin: 5,
                  width: '80%',
                  alignSelf: 'center',
                }}
                titleStyle={{
                  color: '#42a5f5',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              />
            </View>
            <View>
              <Text style={{marginBottom: 10, marginLeft: 5, fontSize: 14}}>
                Обновить с :
              </Text>
              <DatePicker
                style={{width: '95%', marginTop: 10, marginBottom: 10}}
                date={this.state.startDate}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                  dateInput: {
                    marginLeft: 36,
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={date => {
                  this.setState({startDate: date});
                }}
              />
            </View>
            <View>
              <Text style={{marginBottom: 0, marginLeft: 5, fontSize: 14}}>
                по :
              </Text>
              <DatePicker
                style={{width: '95%', marginTop: 10, marginBottom: 10}}
                date={this.state.endDate}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                  dateInput: {
                    marginLeft: 36,
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={date => {
                  this.setState({endDate: date});
                }}
              />
            </View>
          </View>
          <Button
            title="Обновить за выбранный период"
            iconName="refresh"
            onPress={this.onRefreshClick}
            buttonStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderRadius: 6,
              borderColor: 'red',
              margin: 5,
            }}
            titleStyle={{color: 'red', fontSize: 12, fontWeight: '700'}}
          />
        </SectionRow>
      </ReactNativeSettingsPage>
    );
  }
}
