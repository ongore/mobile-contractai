import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {MainStackParamList} from '@/navigation/types';
import {useExtract} from '@/hooks/useContracts';
import {InputMethod} from '@/types/contract';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'InputMethod'>;
  route: RouteProp<MainStackParamList, 'InputMethod'>;
};

const METHOD_LABELS: Record<InputMethod, string> = {
  screenshot: 'Upload Screenshot',
  text: 'Paste Text',
  invoice: 'Import Invoice',
  camera: 'Scan Document',
};

export default function InputMethodScreen({navigation, route}: Props) {
  const {method} = route.params;
  const extract = useExtract();

  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);

  const isReady = (): boolean => {
    switch (method) {
      case 'text':
        return text.trim().length > 20;
      case 'screenshot':
        return imageUri !== null;
      case 'invoice':
        return fileUri !== null;
      case 'camera':
        return false; // camera not implemented in MVP
      default:
        return false;
    }
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to upload a screenshot.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (asset) {
      setImageUri(asset.uri ?? null);
      setImageBase64(asset.base64 ?? null);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        return;
      }
      const asset = result.assets[0];
      if (asset) {
        setFileUri(asset.uri);
        setFileName(asset.name ?? 'document.pdf');
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleExtract = async () => {
    try {
      // extractFromInput returns the full Contract (with id + extractedFields).
      // useExtract.onSuccess already stores it as activeContract in the store.
      const contract = await extract.mutateAsync({
        method,
        text: method === 'text' ? text : undefined,
        imageBase64: method === 'screenshot' ? (imageBase64 ?? undefined) : undefined,
        fileUri: method === 'invoice' ? (fileUri ?? undefined) : undefined,
      });

      navigation.navigate('ExtractReview', {
        fields: contract.extractedFields,
        method,
        rawInput: method === 'text' ? text : undefined,
      });
    } catch (err: any) {
      Alert.alert(
        'Extraction Failed',
        err?.response?.data?.message ||
          'We couldn\'t extract data from this input. Please try again or use a different method.',
        [{text: 'OK'}],
      );
    }
  };

  const renderContent = () => {
    switch (method) {
      case 'screenshot':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Selected image</Text>
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={handlePickImage}>
                  <Text style={styles.changeButtonText}>Change image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadZone}
                onPress={handlePickImage}
                activeOpacity={0.8}>
                <Icon name="image-plus" size={40} color={colors.accent} />
                <Text style={styles.uploadTitle}>Choose from library</Text>
                <Text style={styles.uploadSubtitle}>
                  Select a screenshot or photo of your agreement
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'text':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Describe your agreement</Text>
            <TextInput
              style={styles.textArea}
              value={text}
              onChangeText={setText}
              placeholder={
                'Example:\n\nI\'m hiring Sarah Johnson as a freelance designer for my website redesign. She\'ll handle UI/UX for 3 pages. Payment is $1,500 upon completion, due by May 15th. Work starts April 20th.'
              }
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={styles.charCount}>{text.length} characters</Text>
          </View>
        );

      case 'invoice':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Selected document</Text>
            {fileUri ? (
              <View style={styles.filePreview}>
                <View style={styles.fileIcon}>
                  <Icon name="file-pdf-box" size={32} color={colors.danger} />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {fileName}
                  </Text>
                  <Text style={styles.fileType}>PDF Document</Text>
                </View>
                <TouchableOpacity onPress={handlePickDocument}>
                  <Icon name="pencil" size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadZone}
                onPress={handlePickDocument}
                activeOpacity={0.8}>
                <Icon name="file-upload-outline" size={40} color={colors.warning} />
                <Text style={styles.uploadTitle}>Choose PDF</Text>
                <Text style={styles.uploadSubtitle}>
                  Select an invoice or PDF document from your files
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'camera':
        return (
          <View style={styles.cameraPlaceholder}>
            <Icon name="camera-off-outline" size={56} color={colors.muted} />
            <Text style={styles.cameraTitle}>Camera Coming Soon</Text>
            <Text style={styles.cameraSubtitle}>
              Document scanning via camera will be available in the next update.
              Use "Upload Screenshot" or "Paste Text" for now.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{METHOD_LABELS[method]}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageSubtitle}>
          {method === 'text'
            ? 'Describe your agreement in plain language and we\'ll structure it into a professional contract.'
            : method === 'screenshot'
            ? 'Upload a screenshot of a deal discussion, invoice, or any agreement and we\'ll extract the details.'
            : method === 'invoice'
            ? 'Import a PDF invoice and we\'ll convert it into a binding contract.'
            : 'Scan any printed document to extract contract details.'}
        </Text>

        {renderContent()}
      </ScrollView>

      {/* Bottom CTA */}
      {method !== 'camera' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.extractButton,
              !isReady() && styles.extractButtonDisabled,
            ]}
            onPress={handleExtract}
            disabled={!isReady() || extract.isPending}
            activeOpacity={0.9}>
            {extract.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.extractButtonText}>Extracting...</Text>
              </View>
            ) : (
              <Text style={styles.extractButtonText}>
                Extract Contract Data
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[4],
  },
  pageSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  uploadZone: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    padding: spacing[10],
    gap: spacing[3],
    backgroundColor: colors.background.secondary,
  },
  uploadTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  uploadSubtitle: {
    color: colors.muted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing[4],
  },
  imagePreview: {
    gap: spacing[3],
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
  },
  changeButton: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentLight,
  },
  changeButtonText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: fontSize.base,
    color: colors.text.primary,
    lineHeight: 22,
    minHeight: 200,
    maxHeight: 360,
  },
  charCount: {
    color: colors.muted,
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  fileType: {
    color: colors.muted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[10],
    gap: spacing[4],
  },
  cameraTitle: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  cameraSubtitle: {
    color: colors.muted,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  extractButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  extractButtonDisabled: {
    opacity: 0.5,
  },
  extractButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
});
