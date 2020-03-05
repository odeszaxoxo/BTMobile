/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, AsyncStorage, Image, Text} from 'react-native';
import SelectMultiple from 'react-native-select-multiple';
import {isEmpty} from 'lodash';
import realm from '../../services/realm';
import {Button} from 'react-native-elements';

var _ = require('lodash');

class ScenesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: [],
      selectedScenes: [],
      disabled: false,
      all: [],
      selected: [],
    };
  }
  static navigationOptions = {
    title: 'Выберите сцены',
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('willFocus', async () => {
      var testArr = await AsyncStorage.getItem('Selected');
      var arr2 = [];
      if (JSON.parse(testArr) === []) {
        for (let i = 1; i <= realm.objects('Scene').length; i++) {
          arr2.push(i);
        }
        await AsyncStorage.setItem('Selected', JSON.stringify(arr2));
      } else {
        arr2 = testArr;
      }
      var list1 = [];
      for (var x = 0; x < realm.objects('Scene').length; x++) {
        if (JSON.parse(arr2).includes(realm.objects('Scene')[x].id)) {
          var item1 = {
            label: realm.objects('Scene')[x].title,
            value: realm.objects('Scene')[x].id,
          };
          list1.push(item1);
        }
      }
      this.setState({selectedScenes: list1});
    });
    var list = [];
    for (var i = 0; i < realm.objects('Scene').length; i++) {
      var item = {
        label: realm.objects('Scene')[i].title,
        value: realm.objects('Scene')[i].id,
        color: realm.objects('Scene')[i].color,
      };
      list.push(item);
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({scenes: list});
  }

  onSelectionsChange = selectedScenes => {
    this.setState({selectedScenes});
  };

  selectAll = () => {
    this.setState({selectedScenes: this.state.scenes});
  };

  reset = () => {
    this.setState({selectedScenes: null});
  };

  goToAgenda = async () => {
    await AsyncStorage.removeItem('Selected');
    const {navigation} = this.props;
    var selectedList = [];
    for (var j = 0; j < this.state.selectedScenes.length; j++) {
      selectedList.push(this.state.selectedScenes[j].value);
    }
    await AsyncStorage.setItem('Selected', JSON.stringify(selectedList));
    navigation.navigate('Agenda');
  };

  renderLabel = label => {
    const col = this.state.scenes.find(item => {
      return item.label === label;
    });
    return (
      <View
        style={{flexDirection: 'row', alignItems: 'center', height: '100%'}}>
        <View
          style={{
            marginLeft: 10,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '95%',
            alignItems: 'center',
          }}>
          <View style={{height: 45, width: 10, backgroundColor: col.color}} />
          <Text style={{marginLeft: 10}}>{label}</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          zIndex: 0,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}>
            <Button
              title="Выбрать все"
              onPress={this.selectAll}
              buttonStyle={{
                width: '70%',
                alignSelf: 'center',
                marginBottom: 10,
              }}
            />
            <Button
              title="Сброс"
              onPress={this.reset}
              buttonStyle={{
                width: '70%',
                alignSelf: 'center',
                marginBottom: 10,
              }}
            />
          </View>
          <SelectMultiple
            items={this.state.scenes}
            selectedItems={this.state.selectedScenes}
            onSelectionsChange={this.onSelectionsChange}
            style={{zIndex: 0, height: '90%'}}
            rowStyle={{height: 45}}
            renderLabel={this.renderLabel}
          />
        </View>
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          disabled={isEmpty(this.state.selectedScenes) ? true : false}
          buttonStyle={{
            position: 'absolute',
            bottom: 20,
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
export default ScenesList;
