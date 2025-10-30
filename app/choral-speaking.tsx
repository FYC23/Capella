import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { touchLastUsed } from '@/utils/lastUsed';
import { RecordingSession, startRecording } from '@/utils/recorder';
import { getAvailableVoices, isSpeaking, speak, stop } from '@/utils/tts';
import { incrementRating } from '@/utils/usageStats';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChoralSpeakingScreen() {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(defaultPassage);
  const [voices, setVoices] = useState<{ identifier?: string; name?: string; language?: string }[]>([]);
  const [voiceIdx, setVoiceIdx] = useState<number>(0);
  const [voicePickerVisible, setVoicePickerVisible] = useState<boolean>(false);
  const [citationsVisible, setCitationsVisible] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(0.85);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [recordEnabled, setRecordEnabled] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const recRef = useRef<RecordingSession | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    (async () => {
      const list = await getAvailableVoices();
      setVoices(list);
    })();
  }, []);

  useEffect(() => {
    if (running) return;
    setElapsed(0);
  }, [running]);

  const currentVoice = voices[voiceIdx];

  const onPreview = async () => {
    await stop();
    await speak(text, { voice: currentVoice?.identifier, language: currentVoice?.language, rate, pitch, volume });
  };

  const onStart = async () => {
    if (running) return;
    setRunning(true);
    await touchLastUsed('choral-speaking');
    if (recordEnabled) {
      try { recRef.current = await startRecording(); } catch {}
    }
    const done = () => { setRunning(false); };
    speak(text, { voice: currentVoice?.identifier, language: currentVoice?.language, rate, pitch, volume, onDone: done, onError: done, onStart: () => {} });
    if (tickRef.current) clearInterval(tickRef.current);
    const startedAt = Date.now();
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
  };

  const onStop = async () => {
    if (!running && !isSpeaking()) return;
    await stop();
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setRunning(false);
    if (recRef.current) {
      try { await recRef.current.stop(); } catch {}
      recRef.current = null;
    }
    await incrementRating('choral-speaking');
  };

  // Removed "Next Voice" cycling in favor of explicit selection modal

  const dec = (v: number, step: number, min: number) => Math.max(min, Math.round((v - step) * 100) / 100);
  const inc = (v: number, step: number, max: number) => Math.min(max, Math.round((v + step) * 100) / 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.navTitle}>{t('choralSpeaking.title')}</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{t('choralSpeaking.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('choralSpeaking.description')}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('choralSpeaking.passage')}</ThemedText>
          <TextInput
            style={styles.textInput}
            multiline
            value={text}
            onChangeText={setText}
            placeholder={t('choralSpeaking.enterText')}
          />
          <View style={styles.rowBetween}>
            <ThemedText>{t('choralSpeaking.voice')}: {currentVoice?.name || t('choralSpeaking.defaultVoice')}</ThemedText>
            <TouchableOpacity style={styles.smallBtn} onPress={() => setVoicePickerVisible(true)}>
              <ThemedText style={styles.smallBtnText}>{t('choralSpeaking.selectVoice')}</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.controlLine}>
            <ThemedText>Rate</ThemedText>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setRate(dec(rate, 0.05, 0.5))}><ThemedText>-</ThemedText></TouchableOpacity>
              <ThemedText style={styles.stepVal}>{rate.toFixed(2)}</ThemedText>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setRate(inc(rate, 0.05, 1.2))}><ThemedText>+</ThemedText></TouchableOpacity>
            </View>
          </View>
          <View style={styles.controlLine}>
            <ThemedText>Pitch</ThemedText>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPitch(dec(pitch, 0.05, 0.8))}><ThemedText>-</ThemedText></TouchableOpacity>
              <ThemedText style={styles.stepVal}>{pitch.toFixed(2)}</ThemedText>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPitch(inc(pitch, 0.05, 1.2))}><ThemedText>+</ThemedText></TouchableOpacity>
            </View>
          </View>
          <View style={styles.controlLine}>
            <ThemedText>Volume</ThemedText>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setVolume(dec(volume, 0.1, 0.2))}><ThemedText>-</ThemedText></TouchableOpacity>
              <ThemedText style={styles.stepVal}>{volume.toFixed(1)}</ThemedText>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setVolume(inc(volume, 0.1, 1.0))}><ThemedText>+</ThemedText></TouchableOpacity>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <ThemedText>{t('choralSpeaking.recordMyVoice')}</ThemedText>
            <TouchableOpacity style={[styles.toggle, recordEnabled && styles.toggleOn]} onPress={() => setRecordEnabled(!recordEnabled)}>
              <View style={[styles.knob, recordEnabled && styles.knobOn]} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onPreview} disabled={running}>
            <IconSymbol name="play.fill" size={18} color="#fff" />
            <ThemedText style={styles.actionBtnText}>{t('choralSpeaking.preview')}</ThemedText>
          </TouchableOpacity>
          {!running ? (
            <TouchableOpacity style={[styles.actionBtn, styles.primary]} onPress={onStart}>
              <IconSymbol name="mic.fill" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>{t('choralSpeaking.start')}</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, styles.danger]} onPress={onStop}>
              <IconSymbol name="stop.fill" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>{t('choralSpeaking.stop')}</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedView style={styles.statusCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('choralSpeaking.session')}</ThemedText>
          <ThemedText>{t('choralSpeaking.elapsed')}: {elapsed}s</ThemedText>
          <View style={styles.beatsRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={[styles.beatDot, running && (elapsed % 4 === i ? styles.beatActive : null)]} />
            ))}
          </View>
          <ThemedText style={styles.hint}>{t('choralSpeaking.headphoneHint')}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <IconSymbol name="lightbulb.fill" size={18} color="#FFD60A" />
            <ThemedText type="subtitle" style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('choralSpeaking.summaryTitle')}</ThemedText>
          </View>
          <View style={styles.summaryInner}>
            <ThemedText style={styles.summaryParagraph}>
              {t('choralSpeaking.summaryBody')}
            </ThemedText>
            <View style={styles.summaryActionsRow}>
              <TouchableOpacity style={styles.pillBtn} onPress={() => setCitationsVisible(true)}>
                <IconSymbol name="book.fill" size={14} color="#000" />
                <ThemedText style={styles.pillBtnText}>{t('choralSpeaking.viewCitations')}</ThemedText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.disclosureRow} onPress={() => setShowDetails(!showDetails)}>
              <ThemedText style={styles.disclosureText}>{showDetails ? t('choralSpeaking.learnLess') : t('choralSpeaking.learnMore')}</ThemedText>
              <IconSymbol name={showDetails ? 'chevron.up' : 'chevron.down'} size={14} color="#6C757D" />
            </TouchableOpacity>
            {showDetails && (
              <ThemedText style={styles.detailsParagraph}>
                {t('choralSpeaking.detailBody')}
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </ScrollView>
      <Modal
        visible={voicePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setVoicePickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ThemedText type="subtitle" style={styles.modalTitle}>{t('choralSpeaking.selectVoice')}</ThemedText>
            <ScrollView style={{ maxHeight: 360 }}>
              {voices.length === 0 ? (
                <ThemedText style={{ color: '#000000' }}>{t('choralSpeaking.noVoices')}</ThemedText>
              ) : (
                voices.map((v, idx) => (
                  <TouchableOpacity key={(v.identifier || v.name || idx).toString()} style={styles.voiceRow} onPress={() => setVoiceIdx(idx)}>
                    <View style={styles.voiceRowContent}>
                      <ThemedText type="defaultSemiBold" style={{ color: '#000000' }}>{v.name || t('choralSpeaking.defaultVoice')}</ThemedText>
                      {!!v.language && <ThemedText style={{ color: '#666' }}>{v.language}</ThemedText>}
                    </View>
                    {idx === voiceIdx && <IconSymbol name="checkmark" size={16} color="#007AFF" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.primary]} onPress={() => setVoicePickerVisible(false)}>
                <ThemedText style={styles.actionBtnText}>{t('choralSpeaking.done')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={citationsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCitationsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ThemedText type="subtitle" style={styles.modalTitle}>{t('choralSpeaking.citationsTitle')}</ThemedText>
            <View>
              <ThemedText style={styles.citationText}>
                Kalinowski, J., & Saltuklaroglu, T. (2003). Choral speech and stuttering: A review of the stuttering suppression phenomenon and a theoretical account. Neuroscience & Biobehavioral Reviews. https://doi.org/10.1016/S0149-7634(03)00063-0
              </ThemedText>
              <ThemedText style={styles.citationText}>
                Ingham, R. J., & Bothe, A. K. (2025). Choral speaking mechanisms and fluency in stuttering. Journal of Fluency Disorders. https://doi.org/10.1016/j.jfludis.2025.106168
              </ThemedText>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.primary]} onPress={() => setCitationsVisible(false)}>
                <ThemedText style={styles.actionBtnText}>{t('choralSpeaking.close')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const defaultPassage = 'When the sun rises, we speak together, calmly and clearly.';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backButton: { padding: 8 },
  navTitle: { fontSize: 20, fontWeight: '600', color: '#000000' },
  placeholder: { width: 40 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '700', color: '#000000', marginBottom: 6 },
  subtitle: { color: '#000000' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F2F2F7', marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000000', marginBottom: 8 },
  textInput: { minHeight: 90, borderWidth: 1, borderColor: '#F2F2F7', borderRadius: 8, padding: 12, color: '#000000' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  controlLine: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
  stepVal: { width: 56, textAlign: 'center', color: '#000000' },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  smallBtnText: { color: '#000000' },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#E5E5EA', padding: 3 },
  toggleOn: { backgroundColor: '#34C759' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  knobOn: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 as any, backgroundColor: '#6C757D', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { color: '#FFFFFF', marginLeft: 8 },
  primary: { backgroundColor: '#007AFF' },
  secondary: { backgroundColor: '#6C757D' },
  danger: { backgroundColor: '#FF3B30' },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F2F2F7', marginTop: 24 },
  beatsRow: { flexDirection: 'row', gap: 8 as any, marginTop: 8 },
  beatDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E5EA' },
  beatActive: { backgroundColor: '#007AFF' },
  hint: { color: '#000000', marginTop: 8 },
  sources: { marginTop: 16 },
  sourceItem: { color: '#000000', marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  modalTitle: { color: '#000000', marginBottom: 8 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  voiceRowContent: { flexDirection: 'column' },
  modalActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  citationText: { color: '#000000', marginBottom: 10 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F2F2F7', marginTop: 24 },
  summaryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 as any, marginBottom: 8 },
  summaryInner: { maxWidth: 680, alignSelf: 'center', width: '100%' },
  summaryParagraph: { color: '#000000', lineHeight: 22, marginTop: 2 },
  detailsParagraph: { color: '#000000', lineHeight: 22, marginTop: 6 },
  summaryActionsRow: { marginTop: 10, flexDirection: 'row' },
  pillBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 as any, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 999, backgroundColor: '#EDEEF0', borderWidth: 1, borderColor: '#E0E0E5', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, alignSelf: 'flex-start' },
  pillBtnText: { color: '#000000' },
  disclosureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 as any, marginTop: 8, alignSelf: 'flex-start' },
  disclosureText: { color: '#6C757D' },
});


