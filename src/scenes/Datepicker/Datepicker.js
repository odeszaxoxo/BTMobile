/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View, Text, AsyncStorage} from 'react-native';
import {Button} from 'react-native-elements';
import moment from 'moment';

import DatePicker from 'react-native-datepicker';

export default class Store extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
  }
  static navigationOptions = {
    title: 'Выберите даты',
  };

  componentDidMount() {
    this.props.navigation.addListener('willFocus', async () => {
      var startDate = await AsyncStorage.getItem('SelectedStartDate');
      var endDate = await AsyncStorage.getItem('SelectedEndDate');
      console.log(startDate, endDate);
      if (startDate !== null && endDate !== null) {
        this.setState({startDate: startDate, endDate: endDate});
      }
    });
  }

  goToAgenda = async () => {
    await AsyncStorage.removeItem('SelectedStartDate');
    await AsyncStorage.removeItem('SelectedEndDate');
    const {navigation} = this.props;
    await AsyncStorage.setItem(
      'SelectedStartDate',
      moment(this.state.startDate).format('YYYY-MM-DDTHH:MM:SS'),
    );
    await AsyncStorage.setItem(
      'SelectedEndDate',
      moment(this.state.endDate).format('YYYY-MM-DDTHH:MM:SS'),
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
          marginTop: 20,
        }}>
        <View>
          <Text style={{marginBottom: 10, marginLeft: 5, fontSize: 18}}>
            Показывать события с :
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
          <Text style={{marginBottom: 0, marginLeft: 5, fontSize: 18}}>
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
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          buttonStyle={{
            position: 'absolute',
            bottom: -70,
            right: 20,
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
