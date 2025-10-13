import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({name, focused, size}) => {
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case 'Reminders':
        return 'notifications';
      case 'Tips':
        return 'security';
      case 'Saved':
        return 'favorite';
      case 'Generator':
        return 'lock';
      case 'Vault':
        return 'vpn-key';
      default:
        return 'notifications';
    }
  };

  return (
    <View
      style={[
        styles.iconContainer,
        {
          backgroundColor: focused ? COLORS.primary : COLORS.cardBackground,
          width: 50,
          height: 50,
        },
      ]}>
      <Icon
        name={getIconName(name)}
        size={24}
        color={COLORS.text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default TabBarIcon;
