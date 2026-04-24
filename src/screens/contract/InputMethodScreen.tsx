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
  StatusBar,
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
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'InputMethod'>;
  route: RouteProp<MainStackParamList, 'InputMethod'>;
};

const METHOD_LABELS: Record<InputMethod, string> = {
  screenshot: 'Upload Image or PDF',
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
      case 'text': return text.trim().length > 20;
      case 'screenshot': return imageUri !== null || fileUri !== null;
      case 'invoice': return fileUri !== null;
      case 'camera': return imageUri !== null;
      default: return false;
    }
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload a screenshot.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) {
      setImageUri(asset.uri ?? null);
      setImageBase64(asset.base64 ?? null);
      // Clear any PDF selection
      setFileUri(null);
      setFileName(null);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset) {
        setFileUri(asset.uri);
        setFileName(asset.name ?? 'document.pdf');
        // Clear any image selection
        setImageUri(null);
        setImageBase64(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleCameraCapture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to scan documents.',
        [{text: 'OK'}],
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) {
      setImageUri(asset.uri ?? null);
      setImageBase64(asset.base64 ?? null);
    }
  };

  const handleExtract = async () => {
    try {
      // Build payload — the API layer converts these to the correct multipart/JSON request
      let extractImageUri: string | undefined;
      let extractFileUri: string | undefined;
      let extractMethod: InputMethod = method;

      if (method === 'camera') {
        extractImageUri = imageUri ?? undefined;
        extractMethod = 'screenshot'; // camera treated same as screenshot on backend
      } else if (method === 'screenshot') {
        if (fileUri) {
          extractFileUri = fileUri;
          extractMethod = 'invoice'; // PDF selected via upload screen → invoice path
        } else {
          extractImageUri = imageUri ?? undefined;
        }
      } else if (method === 'invoice') {
        extractFileUri = fileUri ?? undefined;
      }

      const contract = await extract.mutateAsync({
        method: extractMethod,
        text: method === 'text' ? text : undefined,
        imageUri: extractImageUri,
        fileUri: extractFileUri,
      });
      console.log('[MOBILE] contract.extractedFields:', JSON.stringify(contract.extractedFields));
      navigation.navigate('ExtractReview', {
        fields: contract.extractedFields,
        method,
        rawInput: method === 'text' ? text : undefined,
      });
    } catch (err: any) {
      if (err?.response?.status === 403 && err?.response?.data?.error === 'CONTRACT_LIMIT_REACHED') {
        navigation.navigate('Paywall');
        return;
      }
      Alert.alert(
        'Extraction Failed',
        err?.response?.data?.message || "We couldn't extract data from this input. Please try again.",
        [{text: 'OK'}],
      );
    }
  };

  const renderContent = () => {
    switch (method) {
      case 'screenshot':
        // Show image preview if image was picked
        if (imageUri) {
          return (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Selected image</Text>
              <View style={styles.imagePreview}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.changeRow}>
                  <TouchableOpacity style={styles.changeButton} onPress={handlePickImage}>
                    <Text style={styles.changeButtonText}>Change image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.changeButton, styles.changeButtonAlt]} onPress={handlePickDocument}>
                    <Icon name="file-pdf-box" size={14} color="#FCD34D" style={{marginRight: 4}} />
                    <Text style={[styles.changeButtonText, {color: '#FCD34D'}]}>Switch to PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }

        // Show PDF preview if PDF was picked
        if (fileUri) {
          return (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Selected document</Text>
              <View style={styles.filePreview}>
                <View style={styles.fileIcon}>
                  <Icon name="file-pdf-box" size={28} color="#FCA5A5" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>{fileName}</Text>
                  <Text style={styles.fileType}>PDF Document</Text>
                </View>
                <TouchableOpacity onPress={handlePickDocument}>
                  <Icon name="pencil" size={16} color={'#8C8C8C'} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.switchToImageButton} onPress={handlePickImage}>
                <Icon name="image-outline" size={14} color="rgba(167,139,250,0.8)" />
                <Text style={styles.switchToImageText}>Upload image instead</Text>
              </TouchableOpacity>
            </View>
          );
        }

        // Nothing selected yet — show both options
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Choose how to upload</Text>
            <TouchableOpacity style={styles.uploadZone} onPress={handlePickImage} activeOpacity={0.8}>
              <View style={styles.uploadIconWrap}>
                <Icon name="image-plus" size={32} color="#A78BFA" />
              </View>
              <Text style={styles.uploadTitle}>Upload Image</Text>
              <Text style={styles.uploadSubtitle}>
                Photo, screenshot, or any image of your agreement
              </Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              style={[styles.uploadZone, styles.uploadZonePdf]}
              onPress={handlePickDocument}
              activeOpacity={0.8}>
              <View style={[styles.uploadIconWrap, {backgroundColor: 'rgba(252,211,77,0.1)'}]}>
                <Icon name="file-upload-outline" size={32} color="#FCD34D" />
              </View>
              <Text style={styles.uploadTitle}>Import PDF</Text>
              <Text style={styles.uploadSubtitle}>
                Select a PDF contract or document from your files
              </Text>
            </TouchableOpacity>
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
              placeholder={"Example:\n\nI'm hiring Sarah Johnson as a freelance designer for my website redesign. She'll handle UI/UX for 3 pages. Payment is $1,500 upon completion, due by May 15th."}
              placeholderTextColor={'#AAAAAA'}
              multiline
              textAlignVertical="top"
              autoFocus
              selectionColor={colors.accent}
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
                  <Icon name="file-pdf-box" size={28} color="#FCA5A5" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>{fileName}</Text>
                  <Text style={styles.fileType}>PDF Document</Text>
                </View>
                <TouchableOpacity onPress={handlePickDocument}>
                  <Icon name="pencil" size={16} color={'#8C8C8C'} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadZone} onPress={handlePickDocument} activeOpacity={0.8}>
                <View style={[styles.uploadIconWrap, {backgroundColor: 'rgba(252,211,77,0.1)'}]}>
                  <Icon name="file-upload-outline" size={32} color="#FCD34D" />
                </View>
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Document scan</Text>
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <TouchableOpacity style={styles.changeButton} onPress={handleCameraCapture}>
                  <Icon name="camera-retake-outline" size={14} color={colors.accentMid} style={{marginRight: 4}} />
                  <Text style={styles.changeButtonText}>Retake photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadZone, styles.cameraZone]}
                onPress={handleCameraCapture}
                activeOpacity={0.8}>
                <View style={[styles.uploadIconWrap, {backgroundColor: 'rgba(217,70,239,0.12)', width: 72, height: 72, borderRadius: 20}]}>
                  <Icon name="camera-outline" size={36} color="#D946EF" />
                </View>
                <Text style={styles.uploadTitle}>Open Camera</Text>
                <Text style={styles.uploadSubtitle}>
                  Point your camera at any printed contract, invoice, or agreement to scan and extract its details
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const pageSubtitle = () => {
    switch (method) {
      case 'text':
        return "Describe your agreement in plain language and we'll structure it into a professional contract.";
      case 'screenshot':
        return "Upload a photo or image of your agreement, or import a PDF — we'll extract all the key details automatically.";
      case 'invoice':
        return "Import a PDF invoice and we'll convert it into a binding contract.";
      case 'camera':
        return 'Point your camera at any printed document — we\'ll scan and extract the contract details for you.';
      default:
        return '';
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={'#F7F5F2'} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={'#8C8C8C'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{METHOD_LABELS[method]}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtitle}>{pageSubtitle()}</Text>
          {renderContent()}
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.extractButton, !isReady() && styles.extractButtonDisabled]}
            onPress={handleExtract}
            disabled={!isReady() || extract.isPending}
            activeOpacity={0.88}>
            {extract.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.extractButtonText}>Extracting...</Text>
              </View>
            ) : (
              <Text style={styles.extractButtonText}>Extract Contract Data</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED8',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#111111',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[4],
  },
  pageSubtitle: {
    color: '#8C8C8C',
    fontSize: fontSize.base,
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  uploadZone: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    gap: spacing[3],
    backgroundColor: '#F7F5F2',
  },
  uploadZonePdf: {
    borderColor: 'rgba(252,211,77,0.2)',
  },
  cameraZone: {
    paddingVertical: spacing[10],
    borderColor: 'rgba(217,70,239,0.2)',
  },
  uploadIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  uploadTitle: {
    color: '#111111',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  uploadSubtitle: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing[4],
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[2],
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DED8',
  },
  orText: {
    color: '#AAAAAA',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
  },
  imagePreview: {
    gap: spacing[3],
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
  },
  changeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  changeButtonAlt: {
    backgroundColor: 'rgba(252,211,77,0.08)',
    borderColor: 'rgba(252,211,77,0.2)',
  },
  changeButtonText: {
    color: colors.accentMid,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  switchToImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  switchToImageText: {
    color: 'rgba(167,139,250,0.8)',
    fontSize: fontSize.sm,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: fontSize.base,
    color: '#111111',
    lineHeight: 22,
    minHeight: 200,
    maxHeight: 360,
  },
  charCount: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  fileIcon: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#111111',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  fileType: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  footer: {
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: '#E2DED8',
    backgroundColor: '#F7F5F2',
  },
  extractButton: {
    backgroundColor: '#FF5C28',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4] + 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5C28',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  extractButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  extractButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
});
