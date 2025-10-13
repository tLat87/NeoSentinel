import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../constants/colors';
import {PasswordReminder} from '../types';
import AddReminderModal from '../components/AddReminderModal';
import NotificationService from '../services/NotificationService';
import GradientBorderButton from '../components/GradientBorderButton';

const PasswordReminderScreen: React.FC = () => {
  const [reminders, setReminders] = useState<PasswordReminder[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationService] = useState(NotificationService.getInstance());

  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    await notificationService.requestPermissions();
  };

  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('passwordReminders');
      if (storedReminders) {
        const parsedReminders = JSON.parse(storedReminders).map((reminder: any) => ({
          ...reminder,
          lastChanged: new Date(reminder.lastChanged),
          nextReminder: new Date(reminder.nextReminder),
        }));
        setReminders(parsedReminders);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const saveReminders = async (newReminders: PasswordReminder[]) => {
    try {
      await AsyncStorage.setItem('passwordReminders', JSON.stringify(newReminders));
      setReminders(newReminders);
      // Schedule notifications for all reminders
      notificationService.scheduleAllReminders(newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const handleAddReminder = (newReminder: Omit<PasswordReminder, 'id'>) => {
    const reminder: PasswordReminder = {
      ...newReminder,
      id: Date.now().toString(),
      lastChanged: new Date(),
      nextReminder: new Date(Date.now() + newReminder.intervalDays * 24 * 60 * 60 * 1000),
      isActive: true,
    };

    const updatedReminders = [...reminders, reminder];
    saveReminders(updatedReminders);
    setIsModalVisible(false);
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Cancel notification for this reminder
            notificationService.cancelPasswordReminder(id);
            const updatedReminders = reminders.filter(reminder => reminder.id !== id);
            saveReminders(updatedReminders);
          },
        },
      ]
    );
  };

  const handleMarkAsChanged = (id: string) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === id) {
        const now = new Date();
        const updatedReminder = {
          ...reminder,
          lastChanged: now,
          nextReminder: new Date(now.getTime() + reminder.intervalDays * 24 * 60 * 60 * 1000),
        };
        // Update notification for this reminder
        notificationService.updatePasswordReminder(updatedReminder);
        return updatedReminder;
      }
      return reminder;
    });
    saveReminders(updatedReminders);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const getDaysUntilReminder = (nextReminder: Date) => {
    const now = new Date();
    const diffTime = nextReminder.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil <= 0) return COLORS.error;
    if (daysUntil <= 7) return COLORS.warning;
    return COLORS.success;
  };

  const renderReminder = ({item}: {item: PasswordReminder}) => {
    const daysUntil = getDaysUntilReminder(item.nextReminder);
    const statusColor = getStatusColor(daysUntil);

    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderTitle}>{item.title}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteReminder(item.id)}
            style={styles.deleteButton}>
           <Text>Delete</Text>
          </TouchableOpacity>
        </View>
        
        {item.comment && (
          <Text style={styles.reminderComment}>{item.comment}</Text>
        )}
        
        <View style={styles.reminderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interval:</Text>
            <Text style={styles.infoValue}>{item.intervalDays} days</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next reminder:</Text>
            <Text style={[styles.infoValue, {color: statusColor}]}>
              {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
            </Text>
          </View>
        </View>
        
        <GradientBorderButton
          title="Mark as Changed"
          onPress={() => handleMarkAsChanged(item.id)}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image source={require('../assets/img/1.png')} style={{width: 180, height: 180}} />
      <Text style={styles.emptyStateTitle}>No Reminders Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Add your first password reminder to get started with proactive security
      </Text>
      <GradientBorderButton
        title="Add Your First Reminder"
        onPress={() => setIsModalVisible(true)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={reminders.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      {reminders.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}>
          <Icon name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      )}

      <AddReminderModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddReminder}
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
  reminderCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reminderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  reminderComment: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  reminderInfo: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
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
});

export default PasswordReminderScreen;
