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

const SecurityTipsScreen: React.FC = () => {
  const [tips, setTips] = useState<SecurityTip[]>([]);
  const [savedTips, setSavedTips] = useState<string[]>([]);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load saved tips
      const savedTipsData = await AsyncStorage.getItem('savedTips');
      let savedTipsIds: string[] = [];
      if (savedTipsData) {
        savedTipsIds = JSON.parse(savedTipsData);
        setSavedTips(savedTipsIds);
      }

      // Load tips with saved status
      const tipsWithSavedStatus = defaultTips.map(tip => ({
        ...tip,
        isSaved: savedTipsIds.includes(tip.id),
      }));
      setTips(tipsWithSavedStatus);
    } catch (error) {
      console.error('Error loading data:', error);
      setTips(defaultTips);
    }
  };

  const saveSavedTips = async (newSavedTips: string[]) => {
    try {
      await AsyncStorage.setItem('savedTips', JSON.stringify(newSavedTips));
      setSavedTips(newSavedTips);
    } catch (error) {
      console.error('Error saving tips:', error);
    }
  };

  const handleSaveTip = async (tipId: string) => {
    const isCurrentlySaved = savedTips.includes(tipId);
    let newSavedTips: string[];

    if (isCurrentlySaved) {
      newSavedTips = savedTips.filter(id => id !== tipId);
    } else {
      newSavedTips = [...savedTips, tipId];
    }

    await saveSavedTips(newSavedTips);

    // Update tips state with the new saved tips
    setTips(prevTips =>
      prevTips.map(tip =>
        tip.id === tipId ? {...tip, isSaved: newSavedTips.includes(tipId)} : tip
      )
    );
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
    await loadData();
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
          style={styles.saveButton}
          onPress={() => handleSaveTip(item.id)}>
          <Image 
            source={require('../assets/img/bottom/1.png')} 
            style={{
              width: 30, 
              height: 30,
              tintColor: item.isSaved ? COLORS.primary : COLORS.textSecondary
            }} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image source={require('../assets/img/2.png')} style={{width: 180, height: 180}} />
      <Text style={styles.emptyStateTitle}>No Tips Available</Text>
      <Text style={styles.emptyStateDescription}>
        Check back later for new security tips and best practices
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security tips:</Text>
      </View>
      
      <FlatList
        data={tips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tips.length === 0 ? styles.emptyContainer : styles.listContainer}
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
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
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
  saveButton: {
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
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SecurityTipsScreen;
