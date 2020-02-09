/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, Button} from 'react-native';
import SelectMultiple from 'react-native-select-multiple';
import {isEmpty} from 'lodash';

const Realm = require('realm');

const SelectedListSchema = {
  name: 'Selected',
  primaryKey: 'id',
  properties: {selected: 'string', id: 'int'},
};

class ScenesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: [],
      selectedScenes: [],
      realm: new Realm(),
      disabled: false,
      all: [],
    };
  }
  static navigationOptions = {
    title: 'Выберите сцены',
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('willFocus', () => {
      const {realm} = this.state;
      if (realm.objects('Selected')[0].selected !== null) {
        var b = realm
          .objects('Selected')[0]
          .selected.match(/\d+/g)
          .map(Number);
      } else {
        var b = [1, 2, 3, 4, 5];
      }
      var list1 = [];
      for (var x = 0; x < realm.objects('Scene').length; x++) {
        if (b.includes(realm.objects('Scene')[x].id)) {
          var item1 = {
            label: realm.objects('Scene')[x].title,
            value: realm.objects('Scene')[x].id,
          };
          list1.push(item1);
        }
      }
      this.setState({selectedScenes: list1});
    });
    const {realm} = this.state;
    var list = [];
    for (var i = 0; i < realm.objects('Scene').length; i++) {
      var item = {
        label: realm.objects('Scene')[i].title,
        value: realm.objects('Scene')[i].id,
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

  goToAgenda = () => {
    const {navigation} = this.props;
    var selectedList = [];
    for (var j = 0; j < this.state.selectedScenes.length; j++) {
      selectedList.push(this.state.selectedScenes[j].value);
    }
    Realm.open({schema: [SelectedListSchema]}).then(realm => {
      realm.write(() => {
        realm.create(
          'Selected',
          {selected: JSON.stringify(selectedList), id: 1},
          'modified',
        );
        this.setState({realm});
      });
    });
    navigation.navigate('Agenda');
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '90%',
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}>
            <Button title="Выбрать все" onPress={this.selectAll} />
            <Button title="Сброс" onPress={this.reset} />
          </View>
          <SelectMultiple
            items={this.state.scenes}
            selectedItems={this.state.selectedScenes}
            onSelectionsChange={this.onSelectionsChange}
          />
        </View>
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          disabled={isEmpty(this.state.selectedScenes) ? true : false}
        />
      </View>
    );
  }
}
export default ScenesList;
