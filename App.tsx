import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View, Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import PasswordReminderScreen from './src/screens/PasswordReminderScreen';
import SecurityTipsScreen from './src/screens/SecurityTipsScreen';
import SavedTipsScreen from './src/screens/SavedTipsScreen';
import PasswordGeneratorScreen from './src/screens/PasswordGeneratorScreen';
import VaultScreen from './src/screens/VaultScreen';

// Import constants
import {COLORS} from './src/constants/colors';
import CustomHeader from './src/components/CustomHeader';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      // Всегда показываем онбординг
      setIsFirstLaunch(true);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(true);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Не сохраняем флаг, чтобы онбординг всегда показывался
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (isFirstLaunch === null) {
    return <View style={{flex: 1, backgroundColor: COLORS.background}} />;
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, size}) => {
            let iconSource: any;

            switch (route.name) {
              case 'Reminders':
                iconSource = require('./src/assets/img/bottom/1.png');
                break;
              case 'Tips':
                iconSource = require('./src/assets/img/bottom/2.png');
                break;
              case 'Saved':
                iconSource = require('./src/assets/img/bottom/3.png');
                break;
              case 'Generator':
                iconSource = require('./src/assets/img/bottom/4.png');
                break;
              default:
                iconSource = require('./src/assets/img/bottom/1.png');
            }

            return (
              <Image 
                source={iconSource} 
                style={{
                  width: size,
                  height: size,
                  opacity: focused ? 1 : 0.6,
                }}
                resizeMode="contain"
              />
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.cardBackground,
            borderTopColor: COLORS.primary,
            borderTopWidth: 2,
            marginTop: -25,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 90,
            paddingBottom: 20,
            paddingTop: 20,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          header: () => <CustomHeader />,
        })}>
        <Tab.Screen
          name="Reminders"
          component={PasswordReminderScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Tips"
          component={SecurityTipsScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Saved"
          component={SavedTipsScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Generator"
          component={PasswordGeneratorScreen}
          options={{title: ''}}
        />
        {/* <Tab.Screen
          name="Vault"
          component={VaultScreen}
          options={{title: ''}}
        /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;