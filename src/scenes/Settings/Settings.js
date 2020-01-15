/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import ReactNativeSettingsPage, {
  SectionRow,
  NavigateRow,
  CheckRow,
  SwitchRow,
  SliderRow,
} from 'react-native-settings-page';

export default class SettingsScreen extends React.Component {
  state = {
    check: false,
    switch: true,
    value: 80,
  };
  static navigationOptions = {
    title: 'Настройки',
  };

  _navigateToScreen = () => {
    const {navigation} = this.props;
    navigation.navigate('Your-Screen-Name');
  };

  render() {
    return (
      <ReactNativeSettingsPage>
        <SectionRow text="Уведомления">
          <NavigateRow
            text="Уведомить за"
            iconName="hourglass"
            onPressCallback={this._navigateToScreen}
          />
          <SwitchRow
            text="Включить"
            iconName="toggle-on"
            _value={this.state.switch}
            _onValueChange={() => {
              this.setState({switch: !this.state.switch});
            }}
          />
          <SliderRow
            text="Громкость"
            iconName="volume-up"
            _color="#000"
            _min={0}
            _max={100}
            _value={this.state.value}
            _onValueChange={value => {
              this.setState({value});
            }}
          />
        </SectionRow>
      </ReactNativeSettingsPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  loginForm: {
    marginTop: '80%',
    width: '100%',
    height: '50%',
    display: 'flex',
    justifyContent: 'center',
  },
  loginButtonContainer: {
    width: 200,
    height: 50,
    alignSelf: 'center',
    marginTop: 40,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 10,
  },
  credentials: {
    alignSelf: 'center',
  },
});
