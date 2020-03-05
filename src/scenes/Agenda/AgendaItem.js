/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  ScrollView,
} from 'react-native';
import realm from '../../services/realm';
import moment from 'moment';
import 'moment/locale/ru';

export class AgendaItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    const sceneName = realm.objects('Scene')[this.props.item.scene - 1].title;
    moment.locale('ru');
    const dateFormatted = moment(this.props.item.date).format('D MMMM');
    const startTime = this.props.item.time.substring(0, 5);
    const endTimeForm = this.props.item.time.substring(
      this.props.item.time.length,
      this.props.item.time.length - 5,
    );
    return (
      <TouchableOpacity
        onPress={() => {
          this.setModalVisible(true);
          this.setState({
            selectedTime: this.props.item.time,
            selectedScene: sceneName,
            selectedText: this.props.item.title,
            selectedAlerted:
              this.props.item.alerted !== '' ? this.props.item.alerted : 'Нет',
            selectedOuter:
              this.props.item.outer !== '' ? this.props.item.outer : 'Нет',
            selectedTroups:
              this.props.item.troups !== '' ? this.props.item.troups : 'Нет',
            selectedRequired:
              this.props.item.required !== ''
                ? this.props.item.required
                : 'Нет',
            selectedConductor:
              this.props.item.conductor !== ''
                ? this.props.item.conductor
                : 'Нет',
          });
        }}>
        <View style={[styles.item]}>
          <View style={{flex: 1, flexDirection: 'column', width: '15%'}}>
            <Text style={styles.time}>{startTime}</Text>
            <Text style={styles.timeEnd}>{endTimeForm}</Text>
          </View>
          <View
            style={{
              backgroundColor: realm.objects('Scene')[this.props.item.scene - 1]
                .color,
              width: '2%',
              height: '100%',
            }}
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '83%',
              marginLeft: '1%',
            }}>
            <Text style={styles.title}>{this.props.item.title}</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  color: realm.objects('Scene')[this.props.item.scene - 1]
                    .color,
                  textAlignVertical: 'bottom',
                  textAlign: 'right',
                }}>
                {sceneName}
              </Text>
              <Text style={styles.date}>{dateFormatted}</Text>
            </View>
          </View>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}>
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
                  Информация
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '80%',
                }}>
                <ScrollView style={{paddingLeft: 30, paddingRight: 30}}>
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
                    Внешние участники : {this.state.selectedOuter}
                  </Text>
                  <Text style={{fontSize: 18, marginBottom: 15}}>
                    Обязательные участники : {this.state.selectedRequired}
                  </Text>
                </ScrollView>
              </View>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
                style={{
                  width: '100%',
                  height: '5%',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 16, marginRight: 20}}>Закрыть</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'flex-start',
    width: '100%',
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
    textAlignVertical: 'bottom',
    marginLeft: 15,
  },
  timeEnd: {
    color: '#a7c0cd',
    fontSize: 14,
    textAlignVertical: 'bottom',
    marginLeft: 15,
  },
  date: {
    fontWeight: '700',
    fontSize: 12,
    textAlignVertical: 'bottom',
    color: '#90a4ae',
    marginRight: 10,
  },
  title: {
    fontSize: 14,
  },
  back: {
    width: '100%',
    height: '98%',
    flex: 1,
    backgroundColor: 'transparent',
  },
});
