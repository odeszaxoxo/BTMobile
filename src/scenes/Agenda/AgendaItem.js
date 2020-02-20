/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import realm from '../../services/realm';

export class AgendaItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const sceneName = realm.objects('Scene')[this.props.item.scene - 1].title;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setModalVisible(true);
          this.setState({
            selectedTime: this.props.item.time,
            selectedScene: sceneName,
            selectedText: this.props.item.title,
          });
        }}>
        <View style={[styles.item, {height: this.props.item.height}]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={styles.time}>{this.props.item.time}</Text>
              <Text style={styles.title}>{this.props.item.title}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: realm.objects('Scene')[this.props.item.scene - 1].color,
                }}>
                {sceneName}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
