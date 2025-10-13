import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS} from '../constants/colors';
import {PasswordReminder} from '../types';
import GradientBorderButton from './GradientBorderButton';

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<PasswordReminder, 'id'>) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [intervalDays, setIntervalDays] = useState(30);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return;
    }

    if (intervalDays < 10 || intervalDays > 90) {
      Alert.alert('Error', 'Interval must be between 10 and 90 days');
      return;
    }

    onSave({
      title: title.trim(),
      comment: comment.trim() || undefined,
      intervalDays,
      lastChanged: new Date(),
      nextReminder: new Date(),
      isActive: true,
    });

    // Reset form
    setTitle('');
    setComment('');
    setIntervalDays(30);
  };

  const handleClose = () => {
    setTitle('');
    setComment('');
    setIntervalDays(30);
    onClose();
  };

  const adjustInterval = (delta: number) => {
    const newInterval = intervalDays + delta;
    if (newInterval >= 10 && newInterval <= 90) {
      setIntervalDays(newInterval);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            
          </TouchableOpacity>
          <Text style={styles.title}>New Reminder</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title (login or website)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Facebook"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder interval (days)</Text>
            <View style={styles.intervalContainer}>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => adjustInterval(-1)}>
                <Text>Remove</Text>
              </TouchableOpacity>
              <View style={styles.intervalDisplay}>
                <Text style={styles.intervalText}>{intervalDays} days</Text>
              </View>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => adjustInterval(1)}>
                <Text>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.intervalHint}>
              Minimum: 10 days, Maximum: 90 days
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comment (optional)</Text>
            <TextInput
              style={[styles.input, styles.commentInput]}
              value={comment}
              onChangeText={setComment}
              placeholder="your comment"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <GradientBorderButton
            title="Save"
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
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
  commentInput: {
    height: 80,
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  intervalButton: {
    backgroundColor: COLORS.backgroundTertiary,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  intervalDisplay: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  intervalText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  intervalHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default AddReminderModal;
