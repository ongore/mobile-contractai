import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import {SafeAreaView, initialWindowMetrics} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {MainStackParamList} from '@/navigation/types';
import {InputMethod} from '@/types/contract';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'NewContract'>;
};

const {width} = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZ_PAD = 20;
const HALF = (width - HORIZ_PAD * 2 - CARD_GAP) / 2;

const GLASS = {
  backgroundColor: 'rgba(15,23,42,0.72)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: borderRadius['2xl'] ?? 20,
} as const;

const TOP_INSET = initialWindowMetrics?.insets.top ?? 44;

export default function NewContractScreen({navigation}: Props) {
  const go = (method: InputMethod) =>
    navigation.navigate('InputMethod', {method});

  return (
    <LinearGradient
      colors={['#0D2247', '#020617', '#150D38']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={s.safe} edges={['bottom']}>
        {/* Header */}
        <View style={[s.header, {paddingTop: TOP_INSET + 14}]}>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
            <Icon name="close" size={19} color="rgba(255,255,255,0.55)" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>New Contract</Text>
          <View style={{width: 36}} />
        </View>

        <View style={s.body}>
          {/* ── Hero card — Upload / Scan ───────────────────────────────── */}
          <TouchableOpacity
            style={[GLASS, s.heroCard]}
            onPress={() => go('screenshot')}
            activeOpacity={0.82}>

            {/* bg shimmer */}
            <LinearGradient
              colors={['rgba(59,130,246,0.18)', 'transparent']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>RECOMMENDED</Text>
            </View>

            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={s.heroIcon}>
              <Icon name="image-search-outline" size={30} color="#fff" />
            </LinearGradient>

            <Text style={s.heroTitle}>Upload Image or PDF</Text>
            <Text style={s.heroSub}>
              Pick an image or import a PDF — our AI reads it instantly and
              drafts a professional contract for you.
            </Text>

            <View style={s.heroArrow}>
              <Icon name="arrow-right" size={16} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          {/* ── Row: Paste & Draft + Scan Document ─────────────────────── */}
          <View style={s.row}>
            {/* Paste & Draft */}
            <TouchableOpacity
              style={[GLASS, s.halfCard]}
              onPress={() => go('text')}
              activeOpacity={0.82}>
              <LinearGradient
                colors={['rgba(139,92,246,0.18)', 'transparent']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={[s.halfIconWrap, {backgroundColor: 'rgba(139,92,246,0.14)'}]}>
                <Icon name="clipboard-text-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={s.halfTitle}>Paste{'\n'}&amp; Draft</Text>
              <Text style={s.halfSub}>MANUAL INPUT</Text>
            </TouchableOpacity>

            {/* Scan Document (camera) */}
            <TouchableOpacity
              style={[GLASS, s.halfCard]}
              onPress={() => go('camera')}
              activeOpacity={0.82}>
              <LinearGradient
                colors={['rgba(217,70,239,0.18)', 'transparent']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={[s.halfIconWrap, {backgroundColor: 'rgba(217,70,239,0.14)'}]}>
                <Icon name="camera-outline" size={20} color="#D946EF" />
              </View>
              <Text style={s.halfTitle}>Scan{'\n'}Document</Text>
              <Text style={s.halfSub}>CAMERA</Text>
            </TouchableOpacity>
          </View>

          {/* ── Security note ─────────────────────────────────────────── */}
          <View style={s.note}>
            <Icon name="shield-check-outline" size={13} color="rgba(148,163,184,0.60)" />
            <Text style={s.noteText}>
              Processed securely — never stored without your permission.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZ_PAD,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },

  body: {
    flex: 1,
    paddingHorizontal: HORIZ_PAD,
    paddingTop: 20,
    gap: CARD_GAP,
  },

  // Hero card
  heroCard: {
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 18,
  },
  heroBadgeText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  heroIcon: {
    width: 58, height: 58, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5, shadowRadius: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    color: 'rgba(148,163,184,0.80)',
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroArrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    borderRadius: 10,
    padding: 8,
  },

  // Row of two equal cards
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  halfCard: {
    width: HALF,
    padding: 18,
    overflow: 'hidden',
    gap: 10,
  },
  halfIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  halfTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  halfSub: {
    color: 'rgba(100,116,139,0.90)',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },

  // Security note
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    color: 'rgba(100,116,139,0.80)',
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
