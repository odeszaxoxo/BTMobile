import React, {Component} from 'react';

import {
  View,
  AsyncStorage,
  Platform,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import {Text, Icon} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Button} from 'react-native-elements';

export default class HomeScreen extends React.Component {
  state = {
    dateToday: new Date(),
    dateTomorrow: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    mode: 'date',
    show: false,
    showStart: false,
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    scenes: [],
  };

  static navigationOptions = {
    title: 'Select parameters',
  };

  componentDidMount() {
    var start = this.state.startDate;
    var startFormatter = `${start.getFullYear()}-${start.getMonth() +
      1}-${start.getDate()}`;
    var end = this.state.endDate;
    var endFormatter = `${end.getFullYear()}-${end.getMonth() +
      1}-${end.getDate()}`;
    this.setState({
      startDate: startFormatter,
      endDate: endFormatter,
    });
  }

  setStartDate = (event, date) => {
    this.formatDate(date);
    this.setState({
      show: Platform.OS === 'ios' ? true : false,
      startDate: date,
    });
    console.log(this.state.startDate);
  };

  formatDate = date => {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  };

  setEndDate = (event, date) => {
    this.formatDate(date);
    this.setState({
      showStart: Platform.OS === 'ios' ? true : false,
      endDate: date,
    });
  };

  show = mode => {
    this.setState({
      show: true,
      mode,
    });
  };

  showStart = mode => {
    this.setState({
      showStart: true,
      mode,
    });
  };

  search = () => {
    const {navigation} = this.props;
    var selectedScenes = JSON.stringify(
      navigation.getParam('selected', 'NO-ID'),
    );
    console.log(selectedScenes);
    this.props.navigation.navigate('Agenda', {
      selected: selectedScenes,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    });
  };

  datepicker = () => {
    this.show('date');
  };

  datepickerStart = () => {
    this.showStart('date');
  };

  pickToday = () => {
    var today = new Date();
    var todayFormatter = `${today.getFullYear()}-${today.getMonth() +
      1}-${today.getDate()}`;
    this.setState({
      startDate: todayFormatter,
      endDate: todayFormatter,
    });
  };

  pickWeek = () => {
    var today = new Date();
    var todayFormatter = `${today.getFullYear()}-${today.getMonth() +
      1}-${today.getDate()}`;
    var weekDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 7);
    var dateFormatter = `${weekDay.getFullYear()}-${weekDay.getMonth() +
      1}-${weekDay.getDate()}`;
    this.setState({
      startDate: todayFormatter,
      endDate: dateFormatter,
    });
  };

  pickThree = () => {
    var today = new Date();
    var todayFormatter = `${today.getFullYear()}-${today.getMonth() +
      1}-${today.getDate()}`;
    var threeDays = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 3);
    var dateFormatter = `${threeDays.getFullYear()}-${threeDays.getMonth() +
      1}-${threeDays.getDate()}`;
    this.setState({
      startDate: todayFormatter,
      endDate: dateFormatter,
    });
  };

  render() {
    const {show, dateToday, mode, showStart} = this.state;
    const {navigation} = this.props;
    var selected = JSON.stringify(
      navigation.getParam('selected', 'Press to select scenes'),
    );
    var startDate = new Date(this.state.startDate.toString());
    var endDate = new Date(this.state.endDate.toString());
    console.log(startDate.toDateString());
    return (
      <View style={styles.screen}>
        <View style={styles.textContainer}>
          <Text h4 h4Style={{textAlign: 'center', color: '#1E151A'}}>
            Select date
          </Text>
        </View>
        <View style={styles.container}>
          <View style={styles.dateContainer}>
            <Icon
              name="calendar"
              type="font-awesome"
              color="#517fa4"
              onPress={this.datepicker}
              size={30}
            />
            <Text style={styles.date}>{startDate.toDateString()}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Icon
              name="calendar"
              type="font-awesome"
              color="#517fa4"
              onPress={this.datepickerStart}
              size={30}
            />
            <Text style={styles.date}>{endDate.toDateString()}</Text>
          </View>
          {show && (
            <DateTimePicker
              value={this.state.dateToday}
              mode={mode}
              display="default"
              onChange={this.setStartDate}
            />
          )}
          {showStart && (
            <DateTimePicker
              value={this.state.dateTomorrow}
              mode={mode}
              display="default"
              onChange={this.setEndDate}
            />
          )}
        </View>
        <View style={styles.selectContainer}>
          <Button
            title="Today"
            onPress={this.pickToday}
            style={styles.selectButton}
            buttonStyle={{minWidth: '30%', height: 35}}
          />
          <Button
            title="3 days"
            onPress={this.pickThree}
            style={styles.selectButton}
            buttonStyle={{minWidth: '30%', height: 35}}
          />
          <Button
            title="Week"
            onPress={this.pickWeek}
            style={styles.selectButton}
            buttonStyle={{minWidth: '30%', height: 35}}
          />
        </View>
        <View style={styles.scenesSelect}>
          <Text
            h4
            h4Style={{textAlign: 'center', color: '#1E151A', marginTop: '10%'}}>
            Select scenes
          </Text>
          <TouchableHighlight onPress={this._showMoreApp} underlayColor="white">
            <View style={styles.touch}>
              <Text style={styles.buttonTouch}>{selected}</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.footer}>
          <Button
            title="Sign Out"
            onPress={this._signOutAsync}
            buttonStyle={{minWidth: '30%', backgroundColor: '#FF3D00'}}
          />
          <Button
            title="Search"
            onPress={this.search}
            buttonStyle={{minWidth: '30%'}}
          />
        </View>
      </View>
    );
  }

  _showMoreApp = () => {
    this.props.navigation.navigate('Scenes');
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    flexDirection: 'row',
    marginTop: '10%',
  },
  dateContainer: {
    height: '20%',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  screen: {
    backgroundColor: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  textContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    height: '10%',
  },
  date: {
    color: '#1E151A',
    fontSize: 18,
    marginTop: '10%',
    width: 115,
  },
  selectContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginTop: '5%',
  },
  touch: {
    width: 260,
    alignItems: 'center',
    borderColor: '#90CAF9',
    alignSelf: 'center',
    marginTop: '5%',
    borderRadius: 6,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  buttonTouch: {
    textAlign: 'center',
    padding: 20,
    color: '#1976D2',
    fontSize: 18,
  },
  footer: {
    marginTop: '10%',
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    minHeight: 50,
  },
  scenesSelect: {
    marginTop: '10%',
  },
});
