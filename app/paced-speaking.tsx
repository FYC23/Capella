import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PacedSpeakingScreen() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate beat progression
      const interval = setInterval(() => {
        setCurrentBeat(prev => (prev + 1) % 4);
      }, 60000 / tempo);
      
      setTimeout(() => {
        clearInterval(interval);
        setIsPlaying(false);
        setCurrentBeat(0);
      }, 10000); // Stop after 10 seconds
    }
  };

  const rhythmExercises = [
    {
      id: 1,
      name: 'Basic 4/4 Beat',
      description: 'Practice speaking with a steady 4-beat rhythm',
      difficulty: 'easy',
      bpm: 80
    },
    {
      id: 2,
      name: 'Syncopated Rhythm',
      description: 'Work on off-beat emphasis and timing',
      difficulty: 'medium',
      bpm: 100
    },
    {
      id: 3,
      name: 'Complex Polyrhythm',
      description: 'Advanced rhythm patterns for experienced speakers',
      difficulty: 'hard',
      bpm: 140
    },
  ];

  const practiceTexts = [
    'The rhythm of speech flows like music through conversation.',
    'Practice makes perfect when it comes to speaking clearly.',
    'Each word has its own beat in the symphony of language.',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('home.pacedSpeaking')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.description}>
            {t('home.rhythmBasedSpeaking')}
          </ThemedText>

          <View style={styles.metronomeContainer}>
            <View style={styles.beatContainer}>
              {[0, 1, 2, 3].map((beat) => (
                <View 
                  key={beat} 
                  style={[
                    styles.beatCircle, 
                    currentBeat === beat && styles.activeBeat
                  ]}
                >
                  <ThemedText style={[
                    styles.beatNumber,
                    currentBeat === beat && styles.activeBeatText
                  ]}>
                    {beat + 1}
                  </ThemedText>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handlePlayPause} 
              style={[styles.playButton, isPlaying && styles.playingButton]}
            >
              <IconSymbol 
                name={isPlaying ? "pause.fill" : "play.fill"} 
                size={32} 
                color={isPlaying ? "#FF3B30" : "#007AFF"} 
              />
            </TouchableOpacity>

            <View style={styles.tempoContainer}>
              <ThemedText style={styles.tempoLabel}>Tempo: {tempo} BPM</ThemedText>
              <View style={styles.tempoControls}>
                <TouchableOpacity 
                  style={styles.tempoButton}
                  onPress={() => setTempo(Math.max(60, tempo - 10))}
                >
                  <IconSymbol name="minus" size={20} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.tempoDisplay}>
                  <ThemedText style={styles.tempoValue}>{tempo}</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.tempoButton}
                  onPress={() => setTempo(Math.min(200, tempo + 10))}
                >
                  <IconSymbol name="plus" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.practiceTextContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Practice Text</ThemedText>
            <View style={styles.textCard}>
              <ThemedText style={styles.practiceText}>
                {practiceTexts[0]}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.nextTextButton}>
              <ThemedText style={styles.nextTextButtonText}>Next Text</ThemedText>
              <IconSymbol name="arrow.right" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.exercisesContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Rhythm Exercises</ThemedText>
            {rhythmExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
                    {exercise.name}
                  </ThemedText>
                  <View style={[styles.difficultyBadge, 
                    exercise.difficulty === 'easy' ? styles.easyBadge :
                    exercise.difficulty === 'medium' ? styles.mediumBadge : styles.hardBadge
                  ]}>
                    <ThemedText style={styles.difficultyText}>
                      {exercise.difficulty}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.exerciseDescription}>
                  {exercise.description}
                </ThemedText>
                <View style={styles.exerciseFooter}>
                  <ThemedText style={styles.bpmText}>{exercise.bpm} BPM</ThemedText>
                  <TouchableOpacity style={styles.startExerciseButton}>
                    <ThemedText style={styles.startExerciseButtonText}>Start</ThemedText>
                    <IconSymbol name="play.fill" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>8</ThemedText>
              <ThemedText style={styles.statLabel}>Sessions Today</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>88%</ThemedText>
              <ThemedText style={styles.statLabel}>Rhythm Accuracy</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  metronomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  beatContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  beatCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  activeBeat: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  beatNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeBeatText: {
    color: 'white',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  playingButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  tempoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tempoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  tempoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  tempoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tempoDisplay: {
    minWidth: 60,
    alignItems: 'center',
  },
  tempoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  practiceTextContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  textCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  practiceText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    textAlign: 'center',
  },
  nextTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  nextTextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  exercisesContainer: {
    marginBottom: 32,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  easyBadge: {
    backgroundColor: '#E8F5E8',
  },
  mediumBadge: {
    backgroundColor: '#FFF3CD',
  },
  hardBadge: {
    backgroundColor: '#F8D7DA',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bpmText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  startExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
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
});
