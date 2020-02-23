/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableHighlight,
  Alert,
  TouchableOpacity,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import {Agenda, LocaleConfig} from 'react-native-calendars';
import {Button} from 'react-native-elements';
import jsonData from '../../data/data.json';
import NotificationService from '../../services/NotificationService';
import appConfig from '../../../app.json';
import realm from '../../services/realm';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import {Overlay} from 'react-native-elements';
import NotificationServiceLong from '../../services/NotificationServiceLong';

var _ = require('lodash');

LocaleConfig.locales.en = LocaleConfig.locales[''];
LocaleConfig.locales.ru = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв.',
    'Февр.',
    'Март',
    'Апр.',
    'Май',
    'Июнь',
    'Июль',
    'Авг.',
    'Сент.',
    'Окт.',
    'Нояб.',
    'Дек.',
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
  dayNamesShort: ['Вс.', 'Пн.', 'Вт.', 'Ср.', 'Чт.', 'Пт.', 'Сб.'],
};

const smallItems = {key0: 5, key1: 10, key2: 15, key3: 30};
const bigItems = {key0: 1, key1: 2, key2: 3, key3: 5};

export default class AgendaView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: jsonData,
      eventsList: {},
      evs: {},
      selectedDate: new Date(),
      selectedScenes: [],
      startDate: undefined,
      endDate: undefined,
      modalVisible: false,
      selectedTime: '',
      selectedText: '',
      selectedScene: '',
      eventTest: {},
      update: 1,
      refresh: false,
      senderId: appConfig.senderID,
      smallTime: 'key0',
      bigTime: 'key0',
      bigCheck: true,
      smallCheck: true,
      username: null,
      showModal: false,
      registered: [],
    };
    this.searchButton = this.searchButton.bind(this);
    this.reset = this.reset.bind(this);
    this.show = this.show.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.notif = new NotificationService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
    this.notifLong = new NotificationServiceLong(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
  }
  static navigationOptions = ({navigation}) => {
    const reset = navigation.getParam('reset', () => {});
    return {
      title: 'События',
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <Button
            onPress={() => reset()}
            icon={{
              name: 'refresh',
              type: 'material-community',
              size: 25,
              color: '#000',
            }}
            buttonStyle={{backgroundColor: '#fff'}}
          />
          <Button
            onPress={() => navigation.navigate('Datepicker')}
            icon={{
              name: 'calendar-today',
              type: 'material-community',
              size: 25,
              color: '#000',
            }}
            buttonStyle={{backgroundColor: '#fff'}}
          />
          <Button
            onPress={() => navigation.navigate('Scenes')}
            icon={{
              name: 'tasklist',
              type: 'octicon',
              size: 25,
              color: '#000',
            }}
            buttonStyle={{backgroundColor: '#fff'}}
          />
        </View>
      ),
      headerLeft: () => (
        <View style={{flexDirection: 'row'}}>
          <Button
            onPress={() => navigation.navigate('Settings')}
            icon={{
              name: 'cog',
              type: 'font-awesome',
              size: 25,
              color: '#000',
            }}
            buttonStyle={{backgroundColor: '#fff'}}
          />
        </View>
      ),
    };
  };

  getUserPrefs = async () => {
    try {
      const small = JSON.parse(await AsyncStorage.getItem('smallCheck'));
      this.setState({smallCheck: small});
      const big = JSON.parse(await AsyncStorage.getItem('bigCheck'));
      this.setState({bigCheck: big});
      const smallTime = await AsyncStorage.getItem('smallTime');
      this.setState({smallTime: smallTime});
      const bigTime = await AsyncStorage.getItem('bigTime');
      this.setState({bigTime: bigTime});
      const token = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({usertoken: token});
      var testArr = JSON.parse(await AsyncStorage.getItem('Selected'));
      this.setState({selectedCheck: testArr});
      return [small, big, smallTime, bigTime, token, testArr];
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchData = async () => {
    const token = JSON.parse(await AsyncStorage.getItem('userToken'));
    this.setState({usertoken: token});
    var testBody = this.state.usertoken;
    var newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 3);
    var lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() - 3);
    var newMomentTime = moment(newDate);
    var lastMomentTime = moment(lastDate);
    var testArr = [];
    NetInfo.fetch().then(async state => {
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
    NetInfo.fetch().then(async state => {
      if (
        state.isConnected === true &&
        //realm.objects('EventItem') === null &&
        this.state.usertoken !== null
      ) {
        var testBody1 = this.state.usertoken;
        let rawResponse = await fetch(
          'https://calendar.bolshoi.ru:8050/WCF/BTService.svc/GetScenes',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: testBody1,
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
            moment(lastMomentTime).format('YYYY-MM-DDTHH:MM:SS') +
            '/' +
            moment(newMomentTime).format('YYYY-MM-DDTHH:MM:SS');
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
              var beginTime = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(11);
              var endingTime = content1.GetEventsByPeriodResult[
                p
              ].EndDateStr.substring(11);
              var eventTime = beginTime + ' - ' + endingTime;
              var date = content1.GetEventsByPeriodResult[
                p
              ].StartDateStr.substring(0, 10)
                .split('.')
                .join('-');
              var dateFormatted =
                date.substring(6) +
                '-' +
                date.substring(3).substring(0, 2) +
                '-' +
                date.substring(0, 2);
              realm.write(() => {
                realm.create(
                  'EventItem',
                  {
                    title: content1.GetEventsByPeriodResult[p].Title,
                    date: dateFormatted,
                    scene: l + 1,
                    time: eventTime,
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

  formatter = async () => {
    var testArr = await AsyncStorage.getItem('Selected');
    var startDate = await AsyncStorage.getItem('SelectedStartDate');
    var endDate = await AsyncStorage.getItem('SelectedEndDate');
    if (startDate !== null && endDate !== null) {
      this.setState({startDate: startDate, endDate: endDate});
    }
    this.setState({selectedScenes: testArr});
    if (JSON.parse(testArr) === null) {
      var arr2 = [];
      for (let i = 1; i <= realm.objects('Scene').length; i++) {
        arr2.push(i);
      }
      await AsyncStorage.setItem('Selected', JSON.stringify(arr2));
    } else {
      arr2 = JSON.parse(testArr);
    }
    var arr = {};
    var dates = [];
    for (let i = 0; i < realm.objects('EventItem').length; i++) {
      dates.push(realm.objects('EventItem')[i].date);
      var arr3 = _.uniq(dates);
    }
    for (let j = 0; j < arr3.length; j++) {
      var test1 = [];
      for (
        let x = 0;
        x <
        realm.objects('EventItem').filtered('date CONTAINS[c] $0', arr3[j])
          .length;
        x++
      ) {
        if (
          arr2.includes(
            realm.objects('EventItem').filtered('date CONTAINS[c] $0', arr3[j])[
              x
            ].scene,
          )
        ) {
          let container = realm
            .objects('EventItem')
            .filtered('date CONTAINS[c] $0', arr3[j])[x];
          test1.push(container);
        }
      }
      if (_.isEmpty(test1)) {
      } else {
        arr[arr3[j]] = _.orderBy(test1, 'time', 'asc');
      }
    }
    this.setState({eventTest: arr});
    this.setState({selectedScenes: testArr});
  };

  refreshData = async () => {
    await this.fetchData();
    await this.formatter();
    console.log('refreshed');
  };

  setNotifications = async () => {
    var firstDate = new Date();
    var newMomentTime = moment(firstDate, 'YYYY-MM-DD');
    var lastMomentTime = moment(firstDate, 'YYYY-MM-DD').add(1, 'days');
    for (let i = 0; i < realm.objects('EventItem').length; i++) {
      let getId = '99' + i.toString();
      let getBigId = '98' + i.toString();
      this.notif.cancelNotif(getId);
      this.notif.cancelNotif({id: getId});
      this.notifLong.cancelNotif(getBigId);
      this.notifLong.cancelNotif({id: getBigId});
    }
    var registered = [];
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
            realm.objects('Scene')[realm.objects('EventItem')[id].scene].title +
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
              this.notif.scheduleNotif(
                new Date(
                  utcDate - 60 * 1000 * smallItems[this.state.smallTime],
                ),
                title,
                message,
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
              this.notifLong.scheduleNotif(
                new Date(
                  utcDate - 60 * 1000 * 60 * bigItems[this.state.bigTime],
                ),
                title,
                messageLong,
              );
            }
          }
        }
      }
      this.setState({registered: registered});
    }
  };

  async componentDidMount() {
    this.props.navigation.setParams({
      reset: this.reset.bind(this),
    });
    this.setNotifications();
    this.props.navigation.addListener('didFocus', async () => {
      this.setState({showModal: true});
      await this.formatter();
      this.setState({showModal: false});
    });
  }

  searchButton() {
    console.log('push');
  }

  onRegister(token) {
    Alert.alert('Registered !', JSON.stringify(token));
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }

  render() {
    LocaleConfig.defaultLocale = 'ru';
    return (
      <View style={[styles.back]}>
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
            Подождите, идет форматирование данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
        <Agenda
          ref={agenda => {
            this.agenda = agenda;
          }}
          items={this.state.eventTest}
          selected={this.state.selectedDate}
          renderItem={this.renderItem.bind(this)}
          renderEmptyDate={this.renderEmptyDate.bind(this)}
          rowHasChanged={this.rowHasChanged.bind(this)}
          renderEmptyData={this.renderEmptyData.bind(this)}
          firstDay={1}
          minDate={this.state.startDate}
          maxDate={this.state.endDate}
          //theme={{'stylesheet.agenda.list': {container: {paddingBottom: 10}}}}
          //onRefresh={() => console.log('refresh')}
        />
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                width: '80%',
                height: '80%',
                backgroundColor: 'white',
                borderRadius: 6,
              }}>
              <View
                style={{
                  width: '100%',
                  height: '10%',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 25,
                    color: 'black',
                    fontWeight: '600',
                    paddingLeft: 20,
                  }}>
                  Событие
                </Text>
              </View>
              <View
                style={{width: '100%', height: '100%', flex: 1, padding: 30}}>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Название : {this.state.selectedText}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Время проведения : {this.state.selectedTime}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Сцена : {this.state.selectedScene}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Дирижер : {this.state.selectedConductor}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Труппы : {this.state.selectedTroups}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Оповещаемые : {this.state.selectedAlerted}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Внещние участники : {this.state.selectedOuter}
                </Text>
                <Text style={{fontSize: 18, marginBottom: 15}}>
                  Обязательные участники : {this.state.selectedRequired}
                </Text>
              </View>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
                style={{
                  width: '100%',
                  height: '8%',
                  backgroundColor: '',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                <Text style={{fontSize: 20, padding: 20}}>Close</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  reset = async () => {
    await AsyncStorage.removeItem('SelectedStartDate');
    await AsyncStorage.removeItem('SelectedEndDate');
    this.setState({startDate: undefined, endDate: undefined});
    const today = new Date();
    this.agenda.chooseDay(today);
  };

  show = () => {
    this.setState({showPicker: true});
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  renderItem(item) {
    const sceneName = realm.objects('Scene')[item.scene - 1].title;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setModalVisible(true);
          this.setState({
            selectedTime: item.time,
            selectedScene: sceneName,
            selectedText: item.title,
            selectedAlerted: item.alerted !== '' ? item.alerted : 'Нет',
            selectedOuter: item.outer !== '' ? item.outer : 'Нет',
            selectedTroups: item.troups !== '' ? item.troups : 'Нет',
            selectedRequired: item.required !== '' ? item.required : 'Нет',
            selectedConductor: item.conductor !== '' ? item.conductor : 'Нет',
          });
        }}>
        <View style={[styles.item, {height: item.height}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: realm.objects('Scene')[item.scene - 1].color,
                }}>
                {sceneName}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderEmptyDate = () => {
    return <View style={styles.emptycell} />;
  };

  renderEmptyData = () => {
    return (
      <View style={styles.emptyData}>
        <Text>Нет событий</Text>
      </View>
    );
  };

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  emptycell: {
    height: 0,
    width: 0,
    backgroundColor: 'transparent',
  },
  emptyData: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50,
  },
  time: {
    color: '#191919',
    fontSize: 14,
  },
  title: {
    fontSize: 20,
  },
  back: {
    width: '100%',
    height: '98%',
    flex: 1,
    backgroundColor: 'transparent',
  },
});
