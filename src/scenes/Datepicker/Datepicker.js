/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View, AsyncStorage} from 'react-native';
import {Button} from 'react-native-elements';
import moment from 'moment';
import CalendarPicker from 'react-native-calendar-picker';

export default class DatePickers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStartDate: new Date(),
      selectedEndDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
  }
  static navigationOptions = {
    title: 'Выберите даты',
  };

  componentDidMount() {
    this.props.navigation.addListener('willFocus', async () => {
      var startDate = await AsyncStorage.getItem('SelectedStartDate');
      var endDate = await AsyncStorage.getItem('SelectedEndDate');
      if (startDate !== null && endDate !== null) {
        this.setState({selectedStartDate: startDate, selectedEndDate: endDate});
      }
    });
  }

  onDateChange = (date, type) => {
    if (type === 'END_DATE') {
      this.setState({
        selectedEndDate: date,
      });
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: null,
      });
    }
  };

  goToAgenda = async () => {
    await AsyncStorage.removeItem('SelectedStartDate');
    await AsyncStorage.removeItem('SelectedEndDate');
    await AsyncStorage.removeItem('PickerDate');
    const {navigation} = this.props;
    await AsyncStorage.setItem(
      'SelectedStartDate',
      moment(this.state.selectedStartDate).format('YYYY-MM-DDT00:00:00'),
    );
    await AsyncStorage.setItem(
      'SelectedEndDate',
      moment(this.state.selectedEndDate).format('YYYY-MM-DDT00:00:00'),
    );
    navigation.navigate('Agenda');
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100%',
          zIndex: 0,
        }}>
        <CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          todayBackgroundColor="#f2e6ff"
          selectedDayColor="#1976D2"
          selectedDayTextColor="#FFFFFF"
          onDateChange={this.onDateChange}
          weekdays={['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']}
          months={[
            'Январь',
            'Ферваль',
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
          ]}
        />
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          buttonStyle={{
            marginTop: 40,
            alignSelf: 'center',
            width: 150,
            height: 50,
            zIndex: 1,
            borderRadius: 50,
          }}
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
