import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/authStore';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const {width, height} = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({navigation}: Props) {
  const setHasSeenOnboarding = useAuthStore(s => s.setHasSeenOnboarding);

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(taglineTranslate, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslate, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    // Navigate to auth stack — RootNavigator will handle the switch
    navigation.navigate('OnboardingStep1');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Background decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgGlow} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {transform: [{scale: logoScale}], opacity: logoOpacity},
            ]}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>CF</Text>
            </View>
          </Animated.View>
        </View>

        {/* Text section */}
        <Animated.View
          style={[styles.textSection, {opacity: textOpacity}]}>
          <Text style={styles.appName}>ContractFlow</Text>
          <Animated.Text
            style={[
              styles.tagline,
              {transform: [{translateY: taglineTranslate}]},
            ]}>
            Create. Sign. Done.
          </Animated.Text>
          <Text style={styles.description}>
            Generate professional contracts in seconds, sign with ease, and
            close deals faster.
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, {opacity: textOpacity}]}>
          {[
            {icon: '⚡', text: 'AI-powered contract generation'},
            {icon: '✍️', text: 'Digital signature in one tap'},
            {icon: '📧', text: 'Send & track from anywhere'},
          ].map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonOpacity,
              transform: [{translateY: buttonTranslate}],
            },
          ]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Free to start • No credit card required
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.accent,
    opacity: 0.08,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.accentMid,
    opacity: 0.06,
    bottom: height * 0.1,
    left: -width * 0.15,
  },
  bgGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    opacity: 0.12,
    top: height * 0.25,
    left: width * 0.5 - 100,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing[10],
    marginBottom: spacing[8],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius['3xl'],
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.4)',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  appName: {
    color: colors.white,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  tagline: {
    color: colors.accentMid,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[4],
    letterSpacing: 0.5,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing[4],
  },
  features: {
    marginBottom: spacing[10],
    gap: spacing[3],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[5],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  buttonSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    width: '100%',
    gap: spacing[2],
    marginBottom: spacing[3],
    ...{
      shadowColor: colors.accent,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    color: colors.white,
    fontSize: fontSize.lg,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSize.sm,
  },
});
