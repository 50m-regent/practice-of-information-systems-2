import QRCode from 'react-native-qrcode-svg';
import { currentUser } from '@/data/mockData';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Camera, QrCode, Users, Scan } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { addFriend } from '@/api/friends';
import { getToken } from '@/utils/tokenStorage';
import { Toast } from '@/components/Toast';
import { getUserId } from '@/api/auth';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

export default function AddFriendScreen() {
  const [mode, setMode] = useState<'scanner' | 'display'>('scanner');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [userQRData, setUserQRData] = useState<string>('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  // Mock user QR code data - in a real app, this would be the user's unique ID
  // const userQRData = currentUser.id; // This line is removed

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const data = await getUserId(token);
          console.log('getUserId data:', data);
          const myId = data.user_id || data.id;
          setUserQRData(myId ? myId.toString() : '');
        } catch (e) {
          setUserQRData('');
        }
      }
    })();
    if (Platform.OS === 'web') {
      // On web, we'll show a message about camera limitations
      console.log('Camera functionality limited on web platform');
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedData) return; // Prevent multiple scans
    setScannedData(data);
    const scannedUserId = data;
    if (scannedUserId) {
      Alert.alert(
        '友達追加',
        '友達を追加しますか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
            onPress: () => setScannedData(null)
          },
          {
            text: '追加',
            onPress: async () => {
              try {
                const token = await getToken();
                if (!token) throw new Error('No token');
                const res = await addFriend(scannedUserId); // scannedUserId 作为 friend_id 传递
                let msg = res?.message || 'Friend added successfully';
                
                if (Platform.OS === 'web') {
                  setToast({
                    visible: true,
                    message: '友達が正常に追加されました！',
                    type: 'success'
                  });
                  setTimeout(() => {
                    router.back();
                  }, 2000);
                } else {
                  Alert.alert('Success', msg, [
                    { text: 'OK', onPress: () => router.back() }
                  ]);
                }
              } catch (e: any) {
                if (Platform.OS === 'web') {
                  setToast({
                    visible: true,
                    message: e?.message || '友達の追加に失敗しました。',
                    type: 'error'
                  });
                } else {
                  Alert.alert('Error', e?.message || 'Failed to add friend', [
                    { text: 'OK', onPress: () => setScannedData(null) }
                  ]);
                }
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid friend code.');
      setScannedData(null);
    }
  };

  const renderCameraView = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webCameraPlaceholder}>
          <Camera size={48} color="#6B7280" />
          <Text style={styles.webCameraText}>Camera not available on web</Text>
          <Text style={styles.webCameraSubtext}>
            Use the mobile app to scan QR codes
          </Text>
        </View>
      );
    }

    if (!permission) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Camera size={48} color="#6B7280" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes for adding friends
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scannerText}>
            Position the QR code within the frame
          </Text>
        </View>
      </CameraView>
    );
  };

  const renderQRCode = () => {
    return (
      <View style={styles.qrDisplayContainer}>
        <View style={styles.qrCodeContainer}>
          {userQRData ? (
            <QRCode
              value={userQRData}
              size={QR_SIZE * 0.9}
              color="#111827"
              backgroundColor="white"
            />
          ) : (
            <Text style={{ textAlign: 'center', color: '#888' }}>Loading QR code...</Text>
          )}
        </View>
        
        <View style={styles.qrInfo}>
          <Text style={styles.qrTitle}>Your Friend Code</Text>
          <Text style={styles.qrDescription}>
            Ask your friends to scan this QR code to add you to their friend list
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Friend</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'scanner' && styles.modeButtonActive]}
          onPress={() => {
            setMode('scanner');
            setScannedData(null);
          }}
        >
          <Scan size={20} color={mode === 'scanner' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'scanner' && styles.modeButtonTextActive]}>
            Scan QR Code
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, mode === 'display' && styles.modeButtonActive]}
          onPress={() => setMode('display')}
        >
          <QrCode size={20} color={mode === 'display' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'display' && styles.modeButtonTextActive]}>
            Show My QR
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'scanner' ? renderCameraView() : renderQRCode()}
      </View>

      <View style={styles.instructions}>
        <Users size={24} color="#3B82F6" />
        <Text style={styles.instructionsTitle}>
          {mode === 'scanner' ? 'Scan to Add Friend' : 'Share Your Code'}
        </Text>
        <Text style={styles.instructionsText}>
          {mode === 'scanner' 
            ? 'Point your camera at a friend\'s QR code to send them a friend request'
            : 'Share this QR code with friends so they can add you to their network'
          }
        </Text>
              </View>
        
        {/* Toast Notification */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  placeholder: {
    width: 40
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6'
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280'
  },
  modeButtonTextActive: {
    color: '#FFFFFF'
  },
  content: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  camera: {
    flex: 1
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 40
  },
  webCameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  webCameraText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16
  },
  webCameraSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center'
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  permissionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  },
  qrDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  qrCodeContainer: {
    width: QR_SIZE,
    height: QR_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative'
  },
  qrOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  qrPlaceholderSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  qrInfo: {
    marginTop: 32,
    alignItems: 'center'
  },
  qrTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8
  },
  qrDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  },
  instructions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 8
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  }
});