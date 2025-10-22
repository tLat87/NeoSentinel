import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View, Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import views
import OnboardingScreen from './cyber-core/views/OnboardingScreen';
import ThreatMonitoringScreen from './cyber-core/views/ThreatMonitoringScreen';
import VulnerabilityAnalysisScreen from './cyber-core/views/VulnerabilityAnalysisScreen';
import IncidentJournalScreen from './cyber-core/views/IncidentJournalScreen';
import DataEncryptionScreen from './cyber-core/views/DataEncryptionScreen';
import VaultScreen from './cyber-core/views/VaultScreen';

// Import config
import {COLORS} from './cyber-core/config/colors';
import CustomHeader from './cyber-core/ui-elements/CustomHeader';
import Loader from './cyber-core/ui-elements/Loader';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkFirstLaunch();
    
    // Таймер для лоадера на 2 секунды
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loaderTimer);
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

  if (isFirstLaunch === null || isLoading) {
    return <Loader />;
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
              case 'Threats':
                iconSource = require('./cyber-core/media-resources/media-assets/bottom/1.png');
                break;
              case 'Analysis':
                iconSource = require('./cyber-core/media-resources/media-assets/bottom/2.png');
                break;
              case 'Journal':
                iconSource = require('./cyber-core/media-resources/media-assets/bottom/3.png');
                break;
              case 'Encryption':
                iconSource = require('./cyber-core/media-resources/media-assets/bottom/4.png');
                break;
              default:
                iconSource = require('./cyber-core/media-resources/media-assets/bottom/1.png');
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
          name="Threats"
          component={ThreatMonitoringScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Analysis"
          component={VulnerabilityAnalysisScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Journal"
          component={IncidentJournalScreen}
          options={{title: ''}}
        />
        <Tab.Screen
          name="Encryption"
          component={DataEncryptionScreen}
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