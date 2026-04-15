import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {InputMethod} from '@/types/contract';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'NewContract'>;
};

interface InputCard {
  method: InputMethod;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  popular?: boolean;
}

const INPUT_CARDS: InputCard[] = [
  {
    method: 'screenshot',
    icon: 'image-outline',
    iconBg: '#EEF2FF',
    iconColor: colors.accent,
    title: 'Upload Screenshot',
    subtitle: 'Use an existing screenshot of your deal or chat',
    popular: true,
  },
  {
    method: 'text',
    icon: 'pencil-outline',
    iconBg: '#ECFDF5',
    iconColor: colors.success,
    title: 'Paste Text',
    subtitle: 'Describe the agreement or paste terms manually',
  },
  {
    method: 'invoice',
    icon: 'file-document-outline',
    iconBg: '#FFFBEB',
    iconColor: colors.warning,
    title: 'Import Invoice',
    subtitle: 'Import a PDF invoice to turn into a contract',
  },
  {
    method: 'camera',
    icon: 'camera-outline',
    iconBg: '#FEF2F2',
    iconColor: colors.danger,
    title: 'Scan Document',
    subtitle: 'Point your camera at any printed document',
  },
];

export default function NewContractScreen({navigation}: Props) {
  const handleSelectMethod = (method: InputMethod) => {
    navigation.navigate('InputMethod', {method});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Contract</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>How do you want to start?</Text>
          <Text style={styles.introSubtitle}>
            Our AI will extract the key details and generate a professional
            contract for you.
          </Text>
        </View>

        {/* Method Cards */}
        <View style={styles.cards}>
          {INPUT_CARDS.map(card => (
            <TouchableOpacity
              key={card.method}
              style={styles.card}
              onPress={() => handleSelectMethod(card.method)}
              activeOpacity={0.85}>
              {card.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              <View style={[styles.cardIcon, {backgroundColor: card.iconBg}]}>
                <Icon name={card.icon} size={28} color={card.iconColor} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={colors.border.default}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom note */}
        <View style={styles.note}>
          <Icon name="shield-check-outline" size={16} color={colors.muted} />
          <Text style={styles.noteText}>
            Your data is processed securely and never stored without your
            permission.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  intro: {
    paddingTop: spacing[6],
    marginBottom: spacing[6],
  },
  introTitle: {
    color: colors.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  introSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  cards: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.border.light,
    ...shadow.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  noteText: {
    flex: 1,
    color: colors.muted,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
