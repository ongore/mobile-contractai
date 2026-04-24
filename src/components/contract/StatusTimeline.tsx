import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
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
  'draft', 'generated', 'signed_by_me', 'sent', 'viewed', 'signed_by_other', 'completed',
];

interface StatusTimelineProps {
  currentStatus: ContractStatus;
  orientation?: 'horizontal' | 'vertical';
}

export function StatusTimeline({currentStatus, orientation = 'horizontal'}: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const getStepState = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
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
                <View style={[
                  styles.stepDot,
                  state === 'completed' && styles.stepDotCompleted,
                  state === 'active' && styles.stepDotActive,
                  state === 'upcoming' && styles.stepDotUpcoming,
                ]}>
                  {state === 'completed' ? (
                    <Icon name="check" size={11} color={colors.white} />
                  ) : state === 'active' ? (
                    <View style={styles.stepDotInner} />
                  ) : null}
                </View>
                {index < TIMELINE_STEPS.length - 1 && (
                  <View style={[
                    styles.verticalConnector,
                    state === 'completed' && styles.connectorCompleted,
                  ]} />
                )}
              </View>
              <View style={styles.verticalStepInfo}>
                <Text style={[
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
            {index > 0 && (
              <View style={[
                styles.horizontalConnector,
                state !== 'upcoming' && styles.connectorCompleted,
              ]} />
            )}
            <View style={styles.horizontalStepContent}>
              <View style={[
                styles.stepCircle,
                state === 'completed' && styles.stepCircleCompleted,
                state === 'active' && styles.stepCircleActive,
                state === 'upcoming' && styles.stepCircleUpcoming,
              ]}>
                {state === 'completed' ? (
                  <Icon name="check" size={11} color={colors.white} />
                ) : (
                  <Icon
                    name={step.icon}
                    size={11}
                    color={state === 'active' ? '#A78BFA' : '#334155'}
                  />
                )}
              </View>
              <Text style={[
                styles.horizontalLabel,
                state === 'active' && styles.horizontalLabelActive,
                state === 'upcoming' && styles.horizontalLabelUpcoming,
              ]} numberOfLines={1}>
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
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
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
    width: 18,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: '#10B981',
  },
  stepCircleActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  stepCircleUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  horizontalLabel: {
    fontSize: 9,
    fontWeight: fontWeight.semibold,
    color: '#111111',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  horizontalLabelActive: {
    color: '#7C3AED',
  },
  horizontalLabelUpcoming: {
    color: '#9CA3AF',
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
    backgroundColor: '#10B981',
  },
  stepDotActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  stepDotUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  verticalConnector: {
    width: 1.5,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginTop: 2,
  },
  connectorCompleted: {
    backgroundColor: '#10B981',
    opacity: 0.6,
  },
  verticalStepInfo: {
    paddingBottom: spacing[4],
    paddingTop: 2,
  },
  stepLabel: {
    color: 'rgba(235,235,245,0.60)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  stepLabelActive: {
    color: '#A78BFA',
    fontWeight: fontWeight.bold,
  },
  stepLabelUpcoming: {
    color: '#334155',
  },
});
