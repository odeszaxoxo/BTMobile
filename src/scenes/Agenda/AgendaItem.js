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

  shadeColor = (color, percent) => {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    if (R === 0) {
      R = 32;
    }

    if (G === 0) {
      G = 32;
    }

    if (B === 0) {
      B = 32;
    }

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    var RR =
      R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
    var GG =
      G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
    var BB =
      B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

    return '#' + RR + GG + BB;
  };

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
              this.props.item.alerted !== ''
                ? this.props.item.alerted.split(';').join('\n')
                : 'Нет',
            selectedOuter:
              this.props.item.outer !== ''
                ? this.props.item.outer.split(';').join('\n')
                : 'Нет',
            selectedTroups:
              this.props.item.troups !== ''
                ? this.props.item.troups.split(';').join('\n')
                : 'Нет',
            selectedRequired:
              this.props.item.required !== ''
                ? this.props.item.required.split(';').join('\n')
                : 'Нет',
            selectedConductor:
              this.props.item.conductor !== ''
                ? this.props.item.conductor.split(';').join('\n')
                : 'Нет',
          });
        }}>
        <View style={[styles.item]}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              width: '20%',
              alignItems: 'center',
            }}>
            <Text style={styles.time}>{startTime}</Text>
            <Text style={styles.timeEnd}>{endTimeForm}</Text>
          </View>
          <View
            style={{
              backgroundColor: this.shadeColor(
                realm.objects('Scene')[this.props.item.scene - 1].color,
                -15,
              ),
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
                  color: this.shadeColor(
                    realm.objects('Scene')[this.props.item.scene - 1].color,
                    -15,
                  ),
                  textAlignVertical: 'bottom',
                  textAlign: 'right',
                }}>
                {sceneName}
              </Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 12,
                  textAlignVertical: 'bottom',
                  color: '#90a4ae',
                  marginRight: 10,
                }}>
                {dateFormatted}
              </Text>
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
                flexDirection: 'column',
                alignContent: 'center',
              }}>
              <View
                style={{
                  width: '100%',
                  height: '10%',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#424242',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                  Событие
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '80%',
                }}>
                <ScrollView style={{paddingLeft: 15, paddingRight: 15}}>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: '700',
                      textAlign: 'left',
                    }}>
                    {this.state.selectedText}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <View
                        style={{
                          backgroundColor: this.shadeColor(
                            realm.objects('Scene')[this.props.item.scene - 1]
                              .color,
                            -15,
                          ),
                          width: 10,
                          height: '100%',
                        }}
                      />
                      <View style={{flexDirection: 'column', marginLeft: 5}}>
                        <Text
                          style={{
                            textAlignVertical: 'bottom',
                            fontSize: 15,
                            color: '#424242',
                            fontWeight: '700',
                          }}>
                          {this.state.selectedTime}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: this.shadeColor(
                              realm.objects('Scene')[this.props.item.scene - 1]
                                .color,
                              -15,
                            ),
                          }}>
                          {this.state.selectedScene}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 15,
                        color: '#90a4ae',
                        marginRight: 10,
                      }}>
                      {dateFormatted}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      marginTop: 25,
                      fontWeight: 'bold',
                      color: '#FF9800',
                    }}>
                    Дирижер:
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: 'bold',
                    }}>
                    {this.state.selectedConductor}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: '#FF9800',
                    }}>
                    Коллективы:
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: 'bold',
                    }}>
                    {this.state.selectedTroups}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: '#FF9800',
                    }}>
                    Оповещаемые:
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: 'bold',
                    }}>
                    {this.state.selectedAlerted}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: '#FF9800',
                    }}>
                    Внешние участники:
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: 'bold',
                    }}>
                    {this.state.selectedOuter}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: '#FF9800',
                    }}>
                    Обязательные участники:
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginBottom: 15,
                      color: '#424242',
                      fontWeight: 'bold',
                    }}>
                    {this.state.selectedRequired}
                  </Text>
                </ScrollView>
              </View>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}
                underlayColor="transparent"
                style={{
                  alignSelf: 'flex-end',
                  width: '50%',
                  height: '10%',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  marginTop: 0,
                  borderRadius: 12,
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
    marginLeft: 10,
  },
  timeEnd: {
    color: '#a7c0cd',
    fontSize: 14,
    textAlignVertical: 'bottom',
    marginLeft: 10,
  },
  date: {
    fontWeight: '700',
    fontSize: 14,
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
