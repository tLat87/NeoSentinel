import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {Alert} from 'react-native';

class BiometricService {
  private static instance: BiometricService;
  private rnBiometrics: ReactNativeBiometrics;

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({allowDeviceCredentials: true});
  }

  public async isBiometricAvailable(): Promise<boolean> {
    try {
      const {available, biometryType} = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  public async getBiometricType(): Promise<string | null> {
    try {
      const {available, biometryType} = await this.rnBiometrics.isSensorAvailable();
      if (available) {
        switch (biometryType) {
          case BiometryTypes.TouchID:
            return 'Touch ID';
          case BiometryTypes.FaceID:
            return 'Face ID';
          case BiometryTypes.Biometrics:
            return 'Biometric';
          default:
            return 'Biometric';
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return null;
    }
  }

  public async authenticate(reason: string = 'Authenticate to access your secure vault'): Promise<boolean> {
    try {
      const {success} = await this.rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  public async createKeys(): Promise<boolean> {
    try {
      const {publicKey} = await this.rnBiometrics.createKeys();
      return !!publicKey;
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return false;
    }
  }

  public async deleteKeys(): Promise<boolean> {
    try {
      const {keysDeleted} = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return false;
    }
  }

  public async biometricSign(message: string): Promise<string | null> {
    try {
      const {success, signature} = await this.rnBiometrics.createSignature({
        promptMessage: 'Sign to authenticate',
        payload: message,
      });
      
      if (success) {
        return signature;
      }
      return null;
    } catch (error) {
      console.error('Error creating biometric signature:', error);
      return null;
    }
  }

  public async showBiometricSetupAlert(): Promise<void> {
    const biometricType = await this.getBiometricType();
    const biometricName = biometricType || 'biometric authentication';
    
    Alert.alert(
      'Enable Biometric Authentication',
      `Would you like to enable ${biometricName} for secure access to your vault?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Enable',
          onPress: async () => {
            const success = await this.createKeys();
            if (success) {
              Alert.alert('Success', `${biometricName} has been enabled for your vault.`);
            } else {
              Alert.alert('Error', `Failed to enable ${biometricName}. Please try again.`);
            }
          },
        },
      ]
    );
  }

  public async isBiometricEnabled(): Promise<boolean> {
    try {
      const {keysExist} = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Error checking if biometric is enabled:', error);
      return false;
    }
  }
}

export default BiometricService;
