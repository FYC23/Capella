import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDAF } from '../hooks/use-daf';

export default function DelayedFeedbackScreen() {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [delayTime, setDelayTime] = useState(200); // milliseconds
  const [pitchShift, setPitchShift] = useState(0); // semitones
  const [showDelayPicker, setShowDelayPicker] = useState(false);
  const [showPitchPicker, setShowPitchPicker] = useState(false);
  
  // Use the DAF hook
  const {
    isDAFActive,
    isHeadphoneConnected,
    audioDeviceInfo,
    isLoading,
    error,
    startDAF,
    stopDAF,
  } = useDAF();

  const handleBack = () => {
    router.back();
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Start recording implementation will go here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording implementation will go here
  };

  const handleToggleDAF = async () => {
    if (isDAFActive) {
      await stopDAF();
    } else {
      const config = {
        delayTime,
        pitchShift,
        volume: 0.8, // Default volume
      };
      await startDAF(config);
    }
  };

  const handleDelayChange = (newDelay: number) => {
    setDelayTime(Math.max(50, Math.min(500, newDelay)));
  };

  const handlePitchChange = (newPitch: number) => {
    setPitchShift(Math.max(-12, Math.min(12, newPitch)));
  };

  const delayPresets = [
    { label: '50ms', value: 50 },
    { label: '100ms', value: 100 },
    { label: '200ms', value: 200 },
    { label: '300ms', value: 300 },
    { label: '500ms', value: 500 },
  ];

  const pitchPresets = [
    { label: '-12', value: -12 },
    { label: '-6', value: -6 },
    { label: '0', value: 0 },
    { label: '+6', value: 6 },
    { label: '+12', value: 12 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('home.delayedFeedback')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.description}>
            Delayed Auditory Feedback (DAF) tool for speech fluency practice
          </ThemedText>

          {/* Headphone Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <IconSymbol 
                name={isHeadphoneConnected ? "headphones" : "headphones.slash"} 
                size={20} 
                color={isHeadphoneConnected ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={[
                styles.statusText,
                { color: isHeadphoneConnected ? "#34C759" : "#FF3B30" }
              ]}>
                {isHeadphoneConnected ? 'Headphones Connected' : 'Headphones Required'}
              </ThemedText>
            </View>
            {audioDeviceInfo?.deviceName && (
              <ThemedText style={styles.deviceName}>
                {audioDeviceInfo.deviceName}
              </ThemedText>
            )}
            {error && (
              <ThemedText style={styles.errorText}>
                {error}
              </ThemedText>
            )}
          </View>

          {/* Recording Controls */}
          <View style={styles.recordingContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Audio Controls</ThemedText>
            
            <View style={styles.recordingButtons}>
              <TouchableOpacity 
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isLoading}
              >
                <IconSymbol 
                  name={isRecording ? "stop.fill" : "mic.fill"} 
                  size={32} 
                  color={isRecording ? "#FF3B30" : "#007AFF"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.dafToggleButton, 
                  isDAFActive && styles.dafActiveButton,
                  isLoading && styles.disabledButton
                ]}
                onPress={handleToggleDAF}
                disabled={isLoading || !isHeadphoneConnected}
              >
                <IconSymbol 
                  name={isDAFActive ? "speaker.wave.3.fill" : "speaker.slash.fill"} 
                  size={24} 
                  color={isDAFActive ? "#34C759" : "#8E8E93"} 
                />
                <ThemedText style={[styles.dafButtonText, isDAFActive && styles.dafActiveText]}>
                  {isLoading ? 'Loading...' : (isDAFActive ? 'Stop DAF' : 'Start DAF')}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.recordLabel}>
              {isRecording ? 'Recording...' : 'Tap to Record'}
            </ThemedText>
          </View>

          {/* Delay Time Controls */}
          <View style={styles.controlsContainer}>
            <ThemedText type="subtitle" style={styles.sectionSubtitle}>Delay Time</ThemedText>
            <TouchableOpacity 
              style={styles.valueButton}
              onPress={() => setShowDelayPicker(true)}
            >
              <ThemedText style={styles.delayValue}>{delayTime}ms</ThemedText>
              <IconSymbol name="chevron.left" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Pitch Shift Controls */}
          <View style={styles.controlsContainer}>
            <ThemedText type="subtitle" style={styles.sectionSubtitle}>Pitch Shift</ThemedText>
            <TouchableOpacity 
              style={styles.valueButton}
              onPress={() => setShowPitchPicker(true)}
            >
              <ThemedText style={styles.pitchValue}>
                {pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones
              </ThemedText>
              <IconSymbol name="chevron.left" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Session Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>8</ThemedText>
              <ThemedText style={styles.statLabel}>Sessions Today</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>15min</ThemedText>
              <ThemedText style={styles.statLabel}>Total Time</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Delay Time Picker Modal */}
      <Modal
        visible={showDelayPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDelayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <ThemedText type="subtitle" style={styles.pickerTitle}>Select Delay Time</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDelayPicker(false)}
              >
                <IconSymbol name="xmark" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {delayPresets.map((preset, index) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    index === delayPresets.length - 1 ? styles.lastPickerOption : styles.pickerOption,
                    delayTime === preset.value && styles.selectedPickerOption
                  ]}
                  onPress={() => {
                    setDelayTime(preset.value);
                    setShowDelayPicker(false);
                  }}
                >
                  <ThemedText style={[
                    styles.pickerOptionText,
                    delayTime === preset.value && styles.selectedPickerOptionText
                  ]}>
                    {preset.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pitch Shift Picker Modal */}
      <Modal
        visible={showPitchPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPitchPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <ThemedText type="subtitle" style={styles.pickerTitle}>Select Pitch Shift</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPitchPicker(false)}
              >
                <IconSymbol name="xmark" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {pitchPresets.map((preset, index) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    index === pitchPresets.length - 1 ? styles.lastPickerOption : styles.pickerOption,
                    pitchShift === preset.value && styles.selectedPickerOption
                  ]}
                  onPress={() => {
                    setPitchShift(preset.value);
                    setShowPitchPicker(false);
                  }}
                >
                  <ThemedText style={[
                    styles.pickerOptionText,
                    pitchShift === preset.value && styles.selectedPickerOptionText
                  ]}>
                    {preset.label} semitones
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  recordingButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  dafToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  dafActiveButton: {
    backgroundColor: '#F0F9FF',
    borderColor: '#34C759',
  },
  dafButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#8E8E93',
  },
  dafActiveText: {
    color: '#34C759',
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  controlsContainer: {
    marginBottom: 36,
  },
  delayDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 20,
  },
  delayValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    lineHeight: 40,
  },
  valueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginTop: 8,
  },
  pitchValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    lineHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 300,
    minHeight: '42%',
    maxHeight: '60%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  pickerScrollView: {
    flex: 1,
    borderRadius: 0,
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastPickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  selectedPickerOption: {
    backgroundColor: '#F0F9FF',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedPickerOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deviceName: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 8,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
