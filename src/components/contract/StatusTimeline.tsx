import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {ContractStatus} from '@/types/contract';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface TimelineStep {
  status: ContractStatus;
  label: string;
  icon: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {status: 'draft', label: 'Draft', icon: 'file-outline'},
  {status: 'generated', label: 'Generated', icon: 'file-document'},
  {status: 'signed_by_me', label: 'Signed', icon: 'draw'},
  {status: 'sent', label: 'Sent', icon: 'email-send'},
  {status: 'viewed', label: 'Viewed', icon: 'eye'},
  {status: 'signed_by_other', label: 'Counter-signed', icon: 'draw-pen'},
  {status: 'completed', label: 'Complete', icon: 'check-circle'},
];

const STATUS_ORDER: ContractStatus[] = [
  'draft',
  'generated',
  'signed_by_me',
  'sent',
  'viewed',
  'signed_by_other',
  'completed',
];

interface StatusTimelineProps {
  currentStatus: ContractStatus;
  orientation?: 'horizontal' | 'vertical';
}

export function StatusTimeline({
  currentStatus,
  orientation = 'horizontal',
}: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const getStepState = (
    index: number,
  ): 'completed' | 'active' | 'upcoming' => {
    if (index < currentIndex) {
      return 'completed';
    }
    if (index === currentIndex) {
      return 'active';
    }
    return 'upcoming';
  };

  if (orientation === 'vertical') {
    return (
      <View style={styles.verticalContainer}>
        {TIMELINE_STEPS.map((step, index) => {
          const state = getStepState(index);
          return (
            <View key={step.status} style={styles.verticalStep}>
              <View style={styles.verticalLeft}>
                <View
                  style={[
                    styles.stepDot,
                    state === 'completed' && styles.stepDotCompleted,
                    state === 'active' && styles.stepDotActive,
                    state === 'upcoming' && styles.stepDotUpcoming,
                  ]}>
                  {state === 'completed' ? (
                    <Icon name="check" size={12} color={colors.white} />
                  ) : state === 'active' ? (
                    <View style={styles.stepDotInner} />
                  ) : null}
                </View>
                {index < TIMELINE_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.verticalConnector,
                      state === 'completed' && styles.connectorCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.verticalStepInfo}>
                <Text
                  style={[
                    styles.stepLabel,
                    state === 'active' && styles.stepLabelActive,
                    state === 'upcoming' && styles.stepLabelUpcoming,
                  ]}>
                  {step.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalContainer}>
      {TIMELINE_STEPS.map((step, index) => {
        const state = getStepState(index);
        return (
          <View key={step.status} style={styles.horizontalStep}>
            {/* Connector */}
            {index > 0 && (
              <View
                style={[
                  styles.horizontalConnector,
                  state !== 'upcoming' && styles.connectorCompleted,
                ]}
              />
            )}

            {/* Step node */}
            <View style={styles.horizontalStepContent}>
              <View
                style={[
                  styles.stepCircle,
                  state === 'completed' && styles.stepCircleCompleted,
                  state === 'active' && styles.stepCircleActive,
                  state === 'upcoming' && styles.stepCircleUpcoming,
                ]}>
                {state === 'completed' ? (
                  <Icon name="check" size={12} color={colors.white} />
                ) : (
                  <Icon
                    name={step.icon}
                    size={12}
                    color={
                      state === 'active' ? colors.accent : colors.muted
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.horizontalLabel,
                  state === 'active' && styles.horizontalLabelActive,
                  state === 'upcoming' && styles.horizontalLabelUpcoming,
                ]}
                numberOfLines={1}>
                {step.label}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Horizontal
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  horizontalStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalStepContent: {
    alignItems: 'center',
    gap: spacing[1],
    minWidth: 60,
  },
  horizontalConnector: {
    width: 20,
    height: 1.5,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[1],
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepCircleActive: {
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  stepCircleUpcoming: {
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  horizontalLabel: {
    fontSize: 9,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  horizontalLabelActive: {
    color: colors.accent,
  },
  horizontalLabelUpcoming: {
    color: colors.muted,
  },

  // Vertical
  verticalContainer: {
    paddingLeft: spacing[2],
  },
  verticalStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  verticalLeft: {
    alignItems: 'center',
    width: 20,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepDotActive: {
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  stepDotUpcoming: {
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  verticalConnector: {
    width: 1.5,
    height: 24,
    backgroundColor: colors.border.light,
    marginTop: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
  verticalStepInfo: {
    paddingBottom: spacing[4],
    paddingTop: 2,
  },
  stepLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  stepLabelActive: {
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  stepLabelUpcoming: {
    color: colors.muted,
  },
});
