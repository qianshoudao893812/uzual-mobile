import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ThemeProvider } from 'styled-components';
import { SafeAreaView, Platform, StatusBar, StyleSheet } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import setupApolloClient from './config/setup';
import Colors from './constants/Colors';
import { Bg } from './components/styled';
import theme, { ThemeContext } from './config/theme';

const _makeTheme = (type = 'light') => ({
  color: Colors,
  ...theme(type)
});
const dark = _makeTheme('dark');
const light = _makeTheme('light');

export default class App extends React.PureComponent {
  apolloClient = null;
  state = {
    isLoadingComplete: false,
    hasHydrated: false,
    theme: 'light'
  };

  toggleTheme = () => {
    this.setState(
      ({ theme }) => ({
        theme: theme === 'light' ? 'dark' : 'light'
      }),
      () => setTimeout(this._changeStatusBarStyle, 250) //YOLO: hack
    );
  };

  _changeStatusBarStyle = () => {
    StatusBar.setBarStyle(
      this.state.theme === 'light' ? 'default' : 'light-content'
    );
  };

  componentDidMount() {
    return Platform.OS === 'ios' && this._changeStatusBarStyle();
  }

  render() {
    const { isLoadingComplete, hasHydrated } = this.state;

    if (!isLoadingComplete && !hasHydrated) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <ApolloProvider client={this.apolloClient}>
          <ThemeContext.Provider
            value={{ theme: this.state.theme, toggleTheme: this.toggleTheme }}
          >
            <ThemeProvider theme={this.state.theme === 'light' ? light : dark}>
              <Bg forceInset={{ bottom: 'never' }}>
                <AppNavigator />
              </Bg>
            </ThemeProvider>
          </ThemeContext.Provider>
        </ApolloProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    this.apolloClient = await setupApolloClient();

    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png')
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        Menlo: require('./assets/fonts/Menlo-Regular.ttf')
      })
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true, hasHydrated: true });
  };
}
