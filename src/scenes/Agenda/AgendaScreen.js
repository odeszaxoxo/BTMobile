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
} from 'react-native';
import {Agenda, LocaleConfig} from 'react-native-calendars';
import {Button} from 'react-native-elements';
import jsonData from '../../data/data.json';
import NotificationService from '../../services/NotificationService';
import appConfig from '../../../app.json';
import realm from '../../services/realm';

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

export default class AgendaView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: jsonData,
      eventsList: {},
      evs: {},
      selectedDate: new Date(),
      selectedScenes: [],
      scenes: {
        1: 'Историческая сцена',
        2: 'Новая сцена',
        3: 'Бетховенский зал',
        4: 'Верхняя сцена',
        5: 'Балетный зал',
      },
      scenesColor: {
        1: '#80d6ff',
        2: '#64d8cb',
        3: '#c49000',
        4: '#ff7d47',
        5: '#795548',
      },
      modalVisible: false,
      selectedTime: '',
      selectedText: '',
      selectedScene: '',
      eventTest: {},
      update: 1,
      refresh: false,
      senderId: appConfig.senderID,
    };
    this.searchButton = this.searchButton.bind(this);
    this.reset = this.reset.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.notif = new NotificationService(
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

  async componentDidMount() {
    this.props.navigation.setParams({
      reset: this.reset.bind(this),
    });
    this.props.navigation.addListener('didFocus', async () => {
      var testArr = await AsyncStorage.getItem('Selected');
      if (testArr === null) {
        var arr2 = [];
        for (let i = 1; i <= realm.objects('Scene').length; i++) {
          arr2.push(i);
        }
        await AsyncStorage.setItem('Selected', JSON.stringify(arr2));
      } else {
        arr2 = testArr;
      }
      console.log(testArr);
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
              realm
                .objects('EventItem')
                .filtered('date CONTAINS[c] $0', arr3[j])[x].scene,
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
      console.log(realm.objects('Scene'));
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

  reset = () => {
    const today = new Date();
    this.agenda.chooseDay(today);
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
    height: '100%',
    flex: 1,
    backgroundColor: 'transparent',
  },
});
