export interface PasswordReminder {
  id: string;
  title: string;
  comment?: string;
  intervalDays: number;
  lastChanged: Date;
  nextReminder: Date;
  isActive: boolean;
}

export interface SecurityTip {
  id: string;
  title: string;
  description: string;
  category: string;
  isSaved: boolean;
  createdAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:MM format
  soundEnabled: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  biometricEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface GeneratedPassword {
  password: string;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  createdAt: Date;
}

export type TabParamList = {
  Reminders: undefined;
  Tips: undefined;
  Saved: undefined;
  Generator: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  AddReminder: {reminder?: PasswordReminder};
  EditReminder: {reminder: PasswordReminder};
};
