/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  AsyncStorage,
  Text,
  ActivityIndicator,
  Icon,
  Platform,
} from 'react-native';
import {Button, Overlay} from 'react-native-elements';
import NotificationService from '../../services/NotificationService';
import NotificationServiceLong from '../../services/NotificationServiceLong';
import realm from '../../services/realm';
import {AgendaItem} from './AgendaItem';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import DateTimePicker from '@react-native-community/datetimepicker';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome5';

var _ = require('lodash');

const smallItems = {key0: 5, key1: 10, key2: 15, key3: 30};
const bigItems = {key0: 1, key1: 2, key2: 3, key3: 5};

export default class Store extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showModal: false,
      showRefreshModal: false,
      isRefreshing: false,
      showPicker: false,
      smallTime: 'key0',
      bigTime: 'key0',
      bigCheck: true,
      smallCheck: true,
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
  static navigationOptions = ({navigation}) => {
    const reset = navigation.getParam('reset', () => {});
    const showPicker = navigation.getParam('showPicker', () => {});
    const firstIcon = (
      <AwesomeIcon name="calendar-day" size={22} color="#000" />
    );
    const secondIcon = (
      <AwesomeIcon name="calendar-week" size={22} color="#000" />
    );
    return {
      title: 'События',
      headerTitleStyle: {
        marginLeft: '15%',
      },
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <Button
            onPress={() => showPicker()}
            icon={firstIcon}
            buttonStyle={{backgroundColor: '#fff'}}
          />
          <Button
            onPress={() => navigation.navigate('Datepicker')}
            icon={secondIcon}
            buttonStyle={{backgroundColor: '#fff'}}
          />
          <Button
            onPress={() => navigation.navigate('Scenes')}
            icon={{
              name: 'tasklist',
              type: 'octicon',
              size: 22,
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
              size: 22,
              color: '#000',
            }}
            buttonStyle={{backgroundColor: '#fff'}}
          />
          <Button
            onPress={() => reset()}
            icon={{
              name: 'home-outline',
              type: 'material-community',
              size: 22,
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
      const prodCheck = JSON.parse(await AsyncStorage.getItem('development'));
      this.setState({prodCheck: prodCheck});
      return [token, testArr, small, big, smallTime, bigTime, prodCheck];
    } catch (error) {
      console.log(error.message);
    }
  };

  componentDidMount = async () => {
    this.props.navigation.setParams({reset: this.reset});
    this.props.navigation.setParams({showPicker: this.showPicker});
    if (realm.objects('EventItem').length > 0) {
      await this.firstOpenFormatData();
    }
    this.interval = setInterval(() => this.refreshDataFromApi(), 1000 * 60 * 5);
    this.props.navigation.addListener('didFocus', async () => {
      await this.formatData();
    });
  };

  formatData = async () => {
    this.setState({showModal: true});
    await this.getUserPrefs();
    await this.formatter();
    this.setState({showModal: false});
  };

  firstOpenFormatData = async () => {
    this.setState({showModal: true});
    await this.getUserPrefs();
    await this.getModifiedEvents();
    await this.getDeletedEvents();
    await this.setNotifications();
    await this.formatter();
    this.setState({showModal: false});
  };

  showPicker = () => {
    this.setState({showPicker: !this.state.showPicker});
  };

  refreshDataFromApi = async () => {
    this.setState({showRefreshModal: true});
    await this.getModifiedEvents();
    await this.getDeletedEvents();
    await this.setNotifications();
    await this.formatter();
    this.setState({showRefreshModal: false});
  };

  getModifiedEvents = async () => {
    var testBody = this.state.usertoken;
    if (this.state.prodCheck) {
      var port = 'https://calendar.bolshoi.ru:8050';
    } else {
      port = 'https://calendartest.bolshoi.ru:8050';
    }
    const refreshDateStorage = JSON.parse(
      await AsyncStorage.getItem('ModifiedRefresh'),
    );
    if (refreshDateStorage == null) {
      var refreshSecondDate = new Date(
        new Date(refreshDate).getTime() - 10 * 60 * 1000,
      );
      var lastMomentTime = moment(refreshSecondDate);
    } else {
      var refreshSecondDate = new Date(
        new Date(refreshDateStorage).getTime() - 10 * 60 * 1000,
      );
      var lastMomentTime = moment(refreshSecondDate);
    }
    var refreshDate = new Date();
    var newMomentTime = moment(refreshDate);
    NetInfo.fetch().then(async state => {
      if (state.isConnected === true && this.state.usertoken !== null) {
        let rawResponse = await fetch(port + '/WCF/BTService.svc/GetScenes', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: testBody,
        });
        const contentScenes = await rawResponse.json();
        var scenesArr = [];
        for (var h = 0; h < contentScenes.GetScenesResult.length; h++) {
          scenesArr.push(contentScenes.GetScenesResult[h].ResourceId);
        }
        let urlTest =
          port +
          '/WCF/BTService.svc/GetModifiedEventsByPeriod/' +
          moment(lastMomentTime).format('YYYY-MM-DDTHH:mm:ss') +
          '/' +
          moment(newMomentTime).format('YYYY-MM-DDTHH:mm:ss');
        let rawResponse1 = await fetch(urlTest, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: testBody,
        }).catch(function(e) {
          console.log(e);
          return null;
        });
        const content1 = await rawResponse1.json();
        if (_.isEmpty(content1.GetModifiedEventsByPeriodResult)) {
        } else {
          for (
            var p = 0;
            p < content1.GetModifiedEventsByPeriodResult.length;
            p++
          ) {
            let beginTime = content1.GetModifiedEventsByPeriodResult[
              p
            ].StartDateStr.substring(11);
            let endingTime = content1.GetModifiedEventsByPeriodResult[
              p
            ].EndDateStr.substring(11);
            let eventTime = beginTime + ' - ' + endingTime;
            let date = content1.GetModifiedEventsByPeriodResult[
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
              content1.GetModifiedEventsByPeriodResult[p].AlertedPersons;
            let troups = content1.GetModifiedEventsByPeriodResult[p].Troups;
            let outer =
              content1.GetModifiedEventsByPeriodResult[p].OuterPersons;
            let required =
              content1.GetModifiedEventsByPeriodResult[p].RequiredPersons;
            let conductor =
              content1.GetModifiedEventsByPeriodResult[p].Conductor;
            let sceneId =
              content1.GetModifiedEventsByPeriodResult[p].ResourceId;
            let serverId = content1.GetModifiedEventsByPeriodResult[p].Id;
            let findVar = sceneId.charAt(0).toUpperCase() + sceneId.slice(1);
            let refreshedScene = realm
              .objects('Scene')
              .filtered('resourceId = $0', findVar)[0].id;
            if (
              realm
                .objects('EventItem')
                .filtered('serverId = $0', serverId)[0] === undefined
            ) {
              realm.write(() => {
                realm.create(
                  'EventItem',
                  {
                    title: content1.GetModifiedEventsByPeriodResult[p].Title,
                    date: dateFormatted,
                    scene: refreshedScene,
                    time: eventTime,
                    alerted: alertedPersons,
                    outer: outer,
                    troups: troups,
                    required: required,
                    conductor: conductor,
                    sceneId: sceneId,
                    serverId: serverId,
                    id: realm.objects('EventItem').length + 1,
                  },
                  'modified',
                );
                this.setState({realm});
              });
            } else {
              let refreshed = realm
                .objects('EventItem')
                .filtered('serverId = $0', serverId)[0].id;
              realm.write(() => {
                realm.create(
                  'EventItem',
                  {
                    title: content1.GetModifiedEventsByPeriodResult[p].Title,
                    date: dateFormatted,
                    scene: refreshedScene,
                    time: eventTime,
                    alerted: alertedPersons,
                    outer: outer,
                    troups: troups,
                    required: required,
                    conductor: conductor,
                    sceneId: sceneId,
                    serverId: serverId,
                    id: refreshed,
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
    await AsyncStorage.removeItem('ModifiedRefresh');
    await AsyncStorage.setItem('ModifiedRefresh', JSON.stringify(refreshDate));
  };

  getDeletedEvents = async () => {
    var testBody = this.state.usertoken;
    if (this.state.prodCheck) {
      var port = 'https://calendar.bolshoi.ru:8050';
    } else {
      port = 'https://calendartest.bolshoi.ru:8050';
    }
    const refreshDateStorage = JSON.parse(
      await AsyncStorage.getItem('ModifiedRefresh'),
    );
    if (refreshDateStorage == null) {
      var refreshSecondDate = new Date(
        new Date(refreshDate).getTime() - 10 * 60 * 1000,
      );
      var lastMomentTime = moment(refreshSecondDate);
    } else {
      var refreshSecondDate = new Date(
        new Date(refreshDateStorage).getTime() - 10 * 60 * 1000,
      );
      var lastMomentTime = moment(refreshSecondDate);
    }
    var refreshDate = new Date();
    var newMomentTime = moment(refreshDate);
    let urlTest =
      port +
      '/WCF/BTService.svc/GetDeletedEventsByPeriod/' +
      moment(lastMomentTime).format('YYYY-MM-DDTHH:mm:ss') +
      '/' +
      moment(newMomentTime).format('YYYY-MM-DDTHH:mm:ss');
    let rawResponse1 = await fetch(urlTest, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: testBody,
    }).catch(function(e) {
      console.log(e);
      return null;
    });
    const content1 = await rawResponse1.json();
    if (_.isEmpty(content1.GetDeletedEventsByPeriodResult)) {
    } else {
      for (var p = 0; p < content1.GetDeletedEventsByPeriodResult.length; p++) {
        let serverId = content1.GetDeletedEventsByPeriodResult[p].EventId;
        let deleted = realm
          .objects('EventItem')
          .filtered('serverId = $0', serverId);
        realm.write(() => {
          realm.delete(deleted);
        });
        this.setState({realm});
      }
    }
    await AsyncStorage.removeItem('ModifiedRefresh');
    await AsyncStorage.setItem('ModifiedRefresh', JSON.stringify(refreshDate));
  };

  formatter = async () => {
    var testArr = await AsyncStorage.getItem('Selected');
    var startDate = await AsyncStorage.getItem('SelectedStartDate');
    var endDate = await AsyncStorage.getItem('SelectedEndDate');
    var pickerDate = JSON.parse(await AsyncStorage.getItem('PickerDate'));
    var starter = new Date();
    if (pickerDate == null) {
      if (startDate !== null && endDate !== null) {
        this.setState({startDate: startDate, endDate: endDate});
      } else {
        startDate = moment(starter).format('YYYY-MM-DDTHH:mm:ss');
        endDate = moment(starter, 'YYYY-MM-DDTHH:mm:ss').add(3, 'days');
        var endDateFormatted = moment(endDate).format('YYYY-MM-DDTHH:mm:ss');
        this.setState({startDate: startDate, endDate: endDateFormatted});
      }
    } else {
      let formattedDate = new Date(pickerDate);
      startDate = moment(formattedDate).format('YYYY-MM-DDTHH:mm:ss');
      endDate = moment(formattedDate, 'YYYY-MM-DDTHH:mm:ss').add(24, 'hours');
      var endDateFormatted = moment(endDate).format('YYYY-MM-DDTHH:mm:ss');
      this.setState({startDate: startDate, endDate: startDate});
    }
    if (JSON.parse(testArr) === null) {
      var arr2 = [];
      for (let i = 1; i <= realm.objects('Scene').length; i++) {
        arr2.push(i);
      }
      await AsyncStorage.setItem('Selected', JSON.stringify(arr2));
    } else {
      arr2 = JSON.parse(testArr);
    }
    var items = [];
    for (var id = 0; id < realm.objects('EventItem').length; id++) {
      if (arr2.includes(realm.objects('EventItem')[id].scene)) {
        if (this.state.startDate !== null && this.state.endDate !== null) {
          if (
            realm.objects('EventItem')[id].date >=
              moment(this.state.startDate).format('YYYY-MM-DD') &&
            realm.objects('EventItem')[id].date <=
              moment(this.state.endDate).format('YYYY-MM-DD')
          ) {
            items.push(realm.objects('EventItem')[id]);
          }
        } else {
          items.push(realm.objects('EventItem')[id]);
        }
      }
    }
    items = _.sortBy(items, ['date', 'time']);
    this.setState({items: items});
    var index = _.findIndex(items, function(item) {
      return item.date === moment(starter).format('YYYY-MM-DD');
    });
    this.setState({initialIndex: index});
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

  onRegister(token) {
    Alert.alert('Registered !', JSON.stringify(token));
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }

  renderItem = ({item}) => {
    <AgendaItem item={item} />;
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#CED0CE',
          margin: 0,
        }}
      />
    );
  };

  _listEmptyComponent = () => {
    return (
      <View>
        <Text style={{alignSelf: 'center', marginTop: 20}}>Нет событий</Text>
      </View>
    );
  };

  reset = async () => {
    await AsyncStorage.removeItem('SelectedStartDate');
    await AsyncStorage.removeItem('SelectedEndDate');
    await AsyncStorage.removeItem('PickerDate');
    this.setState({startDate: null, endDate: null, pickerDate: null});
    this.formatData();
  };

  closePicker = async (date, event) => {
    let savedDate = await AsyncStorage.getItem('PickerDate');
    if (Platform.OS === 'ios') {
      var dateFormatted = new Date(event);
      let testDate = dateFormatted;
      if (event !== undefined) {
        testDate = dateFormatted;
        this.setState({
          pickerDate: dateFormatted,
        });
      } else if (savedDate !== null && savedDate !== undefined) {
        let formatter = savedDate.substring(0, savedDate.length - 6);
        testDate = new Date(formatter.substring(1) + 'Z');
        this.setState({
          pickerDate: testDate,
        });
      } else {
        testDate = null;
        this.setState({
          pickerDate: new Date(),
        });
      }
      await AsyncStorage.removeItem('PickerDate');
      await AsyncStorage.setItem(
        'PickerDate',
        testDate !== null ? JSON.stringify(testDate) : testDate,
      );
    } else {
      dateFormatted = new Date(date.nativeEvent.timestamp);
      let testDate = dateFormatted;
      if (event !== undefined) {
        testDate = dateFormatted;
        this.setState({
          showPicker: false,
          pickerDate: dateFormatted,
        });
      } else if (savedDate !== null && savedDate !== undefined) {
        let formatter = savedDate.substring(0, savedDate.length - 6);
        testDate = new Date(formatter.substring(1) + 'Z');
        this.setState({
          showPicker: false,
          pickerDate: testDate,
        });
      } else {
        testDate = null;
        this.setState({
          showPicker: false,
          pickerDate: new Date(),
        });
      }
      await AsyncStorage.removeItem('PickerDate');
      await AsyncStorage.setItem(
        'PickerDate',
        testDate !== null ? JSON.stringify(testDate) : testDate,
      );
      await this.formatData();
    }
  };

  closePickerIOS = async () => {
    this.setState({showPicker: false});
    await this.formatData();
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100%',
          zIndex: 0,
          marginTop: 20,
        }}>
        <Overlay
          isVisible={this.state.showModal}
          overlayStyle={{
            width: '90%',
            height: '20%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center', fontSize: 14}}>
            Подождите, идет форматирование данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
        <Overlay
          isVisible={this.state.showRefreshModal}
          overlayStyle={{
            width: '90%',
            height: '20%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
          <Text style={{alignSelf: 'center', fontSize: 14}}>
            Подождите, идет загрузка данных.
          </Text>
          <ActivityIndicator size="small" color="#0000ff" />
        </Overlay>
        {this.state.showPicker && (
          <View
            style={{
              marginTop: -40,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <DateTimePicker
              value={
                this.state.pickerDate
                  ? new Date(this.state.pickerDate)
                  : new Date()
              }
              mode="date"
              is24Hour={true}
              display="default"
              onChange={(date, event) => this.closePicker(date, event)}
            />
            {Platform.OS === 'ios' && (
              <Button
                style={{
                  marginTop: -20,
                  height: 40,
                  width: '100%',
                  marginBottom: 20,
                }}
                title="Выбрать"
                onPress={this.closePickerIOS}
              />
            )}
          </View>
        )}
        <FlatList
          data={this.state.items}
          renderItem={({item}) => <AgendaItem item={item} />}
          ItemSeparatorComponent={this.renderSeparator}
          removeClippedSubviews={false}
          ListEmptyComponent={this._listEmptyComponent}
          keyExtractor={(item, index) => index.toString()}
          onRefresh={this.refreshDataFromApi}
          refreshing={this.state.isRefreshing}
          style={{marginBottom: 25, marginTop: -18}}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 50,
    position: 'relative',
  },
  title: {
    fontSize: 30,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  list: {
    paddingVertical: 5,
    margin: 3,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: -1,
    height: 50,
  },
  lightText: {
    color: '#000000',
    width: '100%',
    paddingLeft: 15,
    fontSize: 20,
  },
  line: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#2196f3',
  },
  button: {
    marginBottom: 30,
    width: 160,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 6,
    backgroundColor: '#1976D2',
  },
  buttonTouch: {
    textAlign: 'center',
    padding: 20,
    color: '#fff',
    fontSize: 18,
  },
  numberBox: {
    position: 'absolute',
    bottom: 65,
    width: 40,
    height: 40,
    borderRadius: 25,
    left: 275,
    zIndex: 3,
    backgroundColor: '#e3e3e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {fontSize: 14, color: '#000'},
  selected: {backgroundColor: '#9be7ff'},
});
