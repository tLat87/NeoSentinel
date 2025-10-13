import {Alert} from 'react-native';
import {PasswordReminder} from '../types';

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    // Simple notification service without external dependencies
  }

  public async requestPermissions(): Promise<boolean> {
    // For now, just return true since we're not using actual push notifications
    console.log('Notification permissions requested (simplified version)');
    return true;
  }

  public schedulePasswordReminder(reminder: PasswordReminder) {
    // Log the reminder instead of scheduling actual notification
    console.log(`📅 Password reminder scheduled for ${reminder.title} at ${reminder.nextReminder}`);
    console.log(`⏰ Next reminder in ${reminder.intervalDays} days`);
  }

  public cancelPasswordReminder(reminderId: string) {
    console.log(`❌ Cancelled notification for reminder ${reminderId}`);
  }

  public updatePasswordReminder(reminder: PasswordReminder) {
    // Cancel existing notification
    this.cancelPasswordReminder(reminder.id);
    
    // Schedule new notification
    this.schedulePasswordReminder(reminder);
  }

  public scheduleAllReminders(reminders: PasswordReminder[]) {
    console.log('📋 Scheduling all password reminders:');
    reminders.forEach(reminder => {
      if (reminder.isActive) {
        this.schedulePasswordReminder(reminder);
      }
    });
  }

  public showTestNotification() {
    Alert.alert(
      '🔐 Neo Sentinel',
      'This is a test notification from Neo Sentinel',
      [{text: 'OK'}]
    );
  }

  public getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      // Return empty array since we're not using actual notifications
      resolve([]);
    });
  }

  public clearAllNotifications() {
    console.log('🧹 Cleared all notifications (simplified version)');
  }
}

export default NotificationService;
