import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../constants/colors';
import {SecurityTip} from '../types';
import GradientBorderButton from '../components/GradientBorderButton';

const SavedTipsScreen: React.FC = () => {
  const [savedTips, setSavedTips] = useState<SecurityTip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const defaultTips: SecurityTip[] = [
    {
      id: '1',
      title: 'Unique Passwords are Key',
      description: 'Never reuse a password. If one account is breached, the others remain safe.',
      category: 'Password Security',
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security by enabling 2FA on all your important accounts.',
      category: 'Authentication',
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Beware of Phishing Emails',
      description: 'Never click suspicious links or download attachments from unknown senders.',
      category: 'Email Security',
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Keep Software Updated',
      description: 'Regularly update your operating system and applications to patch security vulnerabilities.',
      category: 'System Security',
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Use a VPN on Public Wi-Fi',
      description: 'Protect your data when using public networks by connecting through a VPN.',
      category: 'Network Security',
      isSaved: false,
      createdAt: new Date(),
    },
    {
      id: '6',
      title: 'Regular Security Audits',
      description: 'Review your account settings and permissions regularly to ensure optimal security.',
      category: 'Best Practices',
      isSaved: false,
      createdAt: new Date(),
    },
  ];

  useEffect(() => {
    loadSavedTips();
  }, []);

  const loadSavedTips = async () => {
    try {
      const savedTipsIds = await AsyncStorage.getItem('savedTips');
      if (savedTipsIds) {
        const ids = JSON.parse(savedTipsIds);
        const saved = defaultTips.filter(tip => ids.includes(tip.id));
        setSavedTips(saved);
      }
    } catch (error) {
      console.error('Error loading saved tips:', error);
    }
  };

  const handleUnsaveTip = async (tipId: string) => {
    try {
      const savedTipsIds = await AsyncStorage.getItem('savedTips');
      if (savedTipsIds) {
        const ids = JSON.parse(savedTipsIds);
        const updatedIds = ids.filter((id: string) => id !== tipId);
        await AsyncStorage.setItem('savedTips', JSON.stringify(updatedIds));
        
        // Update local state
        setSavedTips(prevTips => prevTips.filter(tip => tip.id !== tipId));
      }
    } catch (error) {
      console.error('Error unsaving tip:', error);
      Alert.alert('Error', 'Failed to remove tip from saved list');
    }
  };

  const handleShareTip = async (tip: SecurityTip) => {
    try {
      const shareContent = `${tip.title}\n\n${tip.description}\n\nShared from Neo Sentinel`;
      await Share.share({
        message: shareContent,
        title: tip.title,
      });
    } catch (error) {
      console.error('Error sharing tip:', error);
      Alert.alert('Error', 'Failed to share tip');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedTips();
    setRefreshing(false);
  };

  const renderTip = ({item}: {item: SecurityTip}) => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipCategory}>{item.category}</Text>
      </View>
      
      <Text style={styles.tipDescription}>{item.description}</Text>
      
      <View style={styles.tipActions}>
        <GradientBorderButton
          title="Share"
          onPress={() => handleShareTip(item)}
          icon={<Image source={require('../assets/img/ion_share.png')} style={{width: 20, height: 20}} />}
          style={styles.shareButtonContainer}
        />
        
        <TouchableOpacity
          style={styles.unsaveButton}
          onPress={() => handleUnsaveTip(item.id)}>
          <Image source={require('../assets/img/bottom/1.png')} style={{width: 30, height: 30}} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image source={require('../assets/img/4.png')} style={{width: 280, height: 180}} />
      <Text style={styles.emptyStateTitle}>You have not saved any tip for now</Text>
      <Text style={styles.emptyStateDescription}>
        Browse security tips and save the ones you find helpful
      </Text>
      <GradientBorderButton
        title="Explore tips"
        onPress={() => {
          // Navigate to Tips tab - this will be handled by the tab navigator
          console.log('Navigate to Tips tab');
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={savedTips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={savedTips.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  tipCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tipHeader: {
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500' as const,
    textTransform: 'uppercase',
  },
  tipDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareButtonContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  unsaveButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
});

export default SavedTipsScreen;
