import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../constants/colors';
import {GeneratedPassword} from '../types';
import GradientBorderButton from '../components/GradientBorderButton';

const PasswordGeneratorScreen: React.FC = () => {
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyAnimation] = useState(new Animated.Value(1));

  const generatePassword = async () => {
    setIsGenerating(true);
    
    // Simulate iCloud Keychain integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setGeneratedPassword(password);
    setIsPasswordVisible(false);
    setPasswordStrength(calculatePasswordStrength(password));
    setIsGenerating(false);
  };

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | 'very-strong' => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 5) return 'strong';
    return 'very-strong';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'strong': return COLORS.info;
      case 'very-strong': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const copyToClipboard = async () => {
    if (!generatedPassword) return;
    
    try {
      await Clipboard.setString(generatedPassword);
      
      // Animate copy button
      Animated.sequence([
        Animated.timing(copyAnimation, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(copyAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert('Copied!', 'Password copied to clipboard');
    } catch (error) {
      console.error('Error copying password:', error);
      Alert.alert('Error', 'Failed to copy password');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const maskPassword = (password: string) => {
    return password.replace(/./g, '*');
  };

  const renderPasswordDisplay = () => {
    if (!generatedPassword) {
      return (
        <View style={styles.passwordContainer}>
          <View style={styles.keyIconContainer}>
            <Image source={require('../assets/img/6.png')} style={{width: 260, height: 160}} />
          </View>
          <Text style={styles.generatorTitle}>NeoSentinel Password generator</Text>
          <GradientBorderButton
            title={isGenerating ? 'Generating...' : 'Generate safe password'}
            onPress={generatePassword}
            disabled={isGenerating}
            icon={<Icon name="vpn-key" size={20} color={COLORS.text} />}
          />
        </View>
      );
    }

    return (
      <View style={styles.passwordContainer}>
        <View style={styles.keyIconContainer}>
            <Image source={require('../assets/img/6.png')} style={{width: 260, height: 160}} />

        </View>
        <Text style={styles.generatorTitle}>New safe password:</Text>
        
        <View style={styles.passwordFieldContainer}>
          <View style={styles.passwordField}>
            <Text style={styles.passwordText}>
              {isPasswordVisible ? generatedPassword : maskPassword(generatedPassword)}
            </Text>
            <Animated.View style={{transform: [{scale: copyAnimation}]}}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyToClipboard}>
                <Image source={require('../assets/img/solar_copy-bold-duotone.png')} style={{width: 20, height: 20}} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={generatePassword}
            disabled={isGenerating}>
            <Image source={require('../assets/img/majesticons_reload-circle.png')} style={{width: 20, height: 20}} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.strengthContainer}>
          <Text style={styles.strengthLabel}>Strength:</Text>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${(passwordStrength === 'weak' ? 25 : passwordStrength === 'medium' ? 50 : passwordStrength === 'strong' ? 75 : 100)}%`,
                  backgroundColor: getStrengthColor(passwordStrength),
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, {color: getStrengthColor(passwordStrength)}]}>
            {passwordStrength.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderPasswordDisplay()}
      
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>Powered by: </Text>
        <Text style={styles.iCloudKeychain}>iCloud Keychain</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  passwordContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  keyIconContainer: {
    position: 'relative',
    marginBottom: SPACING.xxl,
  },
  keyRing: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  passwordFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  passwordField: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 250,
    marginRight: SPACING.md,
  },
  passwordText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    padding: SPACING.xs,
  },
  regenerateButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  strengthLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  strengthBar: {
    width: 100,
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  poweredBy: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  iCloudKeychain: {
    fontSize: FONT_SIZES.sm,
    color: '#FF6B6B',
    fontWeight: FONT_WEIGHTS.bold,
  },
});

export default PasswordGeneratorScreen;
