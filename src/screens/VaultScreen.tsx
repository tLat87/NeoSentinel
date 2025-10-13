import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BiometricService from '../services/BiometricService';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../constants/colors';
import GradientBorderButton from '../components/GradientBorderButton';

interface VaultEntry {
  id: string;
  serviceName: string;
  login: string;
  createdAt: Date;
  lastUpdated: Date;
}

const VaultScreen: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [login, setLogin] = useState('');
  const [biometricService] = useState(BiometricService.getInstance());

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const isAvailable = await biometricService.isBiometricAvailable();
    const isEnabled = await biometricService.isBiometricEnabled();
    
    if (isAvailable && isEnabled) {
      authenticateUser();
    } else if (isAvailable && !isEnabled) {
      biometricService.showBiometricSetupAlert();
    } else {
      // Biometric not available, allow access without authentication
      setIsAuthenticated(true);
      loadVaultEntries();
    }
  };

  const authenticateUser = async () => {
    const success = await biometricService.authenticate('Authenticate to access your secure vault');
    if (success) {
      setIsAuthenticated(true);
      loadVaultEntries();
    } else {
      Alert.alert('Authentication Failed', 'Please try again to access your vault.');
    }
  };

  const loadVaultEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('vaultEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          lastUpdated: new Date(entry.lastUpdated),
        }));
        setVaultEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading vault entries:', error);
    }
  };

  const saveVaultEntries = async (entries: VaultEntry[]) => {
    try {
      await AsyncStorage.setItem('vaultEntries', JSON.stringify(entries));
      setVaultEntries(entries);
    } catch (error) {
      console.error('Error saving vault entries:', error);
    }
  };

  const handleAddEntry = () => {
    if (!serviceName.trim() || !login.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newEntry: VaultEntry = {
      id: Date.now().toString(),
      serviceName: serviceName.trim(),
      login: login.trim(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    const updatedEntries = [...vaultEntries, newEntry];
    saveVaultEntries(updatedEntries);
    
    setServiceName('');
    setLogin('');
    setIsModalVisible(false);
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this vault entry?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEntries = vaultEntries.filter(entry => entry.id !== id);
            saveVaultEntries(updatedEntries);
          },
        },
      ]
    );
  };

  const renderVaultEntry = ({item}: {item: VaultEntry}) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.serviceIcon}>
          <Icon name="lock" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.login}>{item.login}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteEntry(item.id)}
          style={styles.deleteButton}>
          <Icon name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.entryFooter}>
        <Text style={styles.dateText}>
          Added: {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="lock-outline" size={80} color={COLORS.textTertiary} />
      <Text style={styles.emptyStateTitle}>Your Vault is Empty</Text>
      <Text style={styles.emptyStateDescription}>
        Add your first service to start tracking your accounts securely
      </Text>
      <GradientBorderButton
        title="Add Your First Entry"
        onPress={() => setIsModalVisible(true)}
      />
    </View>
  );

  const renderAuthenticationScreen = () => (
    <View style={styles.authContainer}>
      <View style={styles.authIcon}>
        <Icon name="fingerprint" size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.authTitle}>Secure Vault</Text>
      <Text style={styles.authDescription}>
        Your vault is protected by biometric authentication. Tap below to access your secure entries.
      </Text>
      <GradientBorderButton
        title="Authenticate"
        onPress={authenticateUser}
        icon={<Icon name="fingerprint" size={24} color={COLORS.text} />}
      />
    </View>
  );

  if (!isAuthenticated) {
    return renderAuthenticationScreen();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vault</Text>
        <Text style={styles.headerSubtitle}>
          Securely track your accounts (passwords not stored)
        </Text>
      </View>

      <FlatList
        data={vaultEntries}
        renderItem={renderVaultEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={vaultEntries.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {vaultEntries.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}>
          <Icon name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Vault Entry</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="e.g. Facebook, Gmail, Bank"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Login/Username</Text>
              <TextInput
                style={styles.input}
                value={login}
                onChangeText={setLogin}
                placeholder="your username or email"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.warningBox}>
              <Icon name="info" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Note: We only store the service name and login for tracking purposes. 
                Your actual passwords are never stored in this app.
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <GradientBorderButton
              title="Add Entry"
              onPress={handleAddEntry}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  authIcon: {
    marginBottom: SPACING.xl,
  },
  authTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  authDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  entryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  entryInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  login: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  entryFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginTop: SPACING.lg,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
  modalFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default VaultScreen;
