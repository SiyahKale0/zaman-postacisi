import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button } from '../components/ui/Button';

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Button
                    title="←"
                    onPress={onBack}
                    variant="secondary"
                    size="small"
                />
                <Text style={styles.title}>⚙️ Ayarlar</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Sound Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔊 Ses</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Ses Efektleri</Text>
                            <Text style={styles.settingDesc}>Oyun içi sesler</Text>
                        </View>
                        <Switch
                            value={soundEnabled}
                            onValueChange={setSoundEnabled}
                            trackColor={{ false: '#333', true: '#6644ff' }}
                            thumbColor={soundEnabled ? '#fff' : '#888'}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Müzik</Text>
                            <Text style={styles.settingDesc}>Arka plan müziği</Text>
                        </View>
                        <Switch
                            value={musicEnabled}
                            onValueChange={setMusicEnabled}
                            trackColor={{ false: '#333', true: '#6644ff' }}
                            thumbColor={musicEnabled ? '#fff' : '#888'}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Titreşim</Text>
                            <Text style={styles.settingDesc}>Dokunsal geri bildirim</Text>
                        </View>
                        <Switch
                            value={hapticsEnabled}
                            onValueChange={setHapticsEnabled}
                            trackColor={{ false: '#333', true: '#6644ff' }}
                            thumbColor={hapticsEnabled ? '#fff' : '#888'}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>

                    <View style={styles.aboutCard}>
                        <Text style={styles.appName}>Zaman Postacısı</Text>
                        <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
                        <Text style={styles.appDesc}>
                            Zamanın akışını düzenle, mektupları doğru çağlara ulaştır!
                        </Text>
                    </View>
                </View>

                {/* Links */}
                <View style={styles.section}>
                    <Button
                        title="📜 Gizlilik Politikası"
                        onPress={() => {/* TODO: Open privacy policy */ }}
                        variant="secondary"
                        size="medium"
                    />
                    <View style={{ height: 12 }} />
                    <Button
                        title="📋 Kullanım Şartları"
                        onPress={() => {/* TODO: Open terms */ }}
                        variant="secondary"
                        size="medium"
                    />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Made with 💜 by Zaman Postanesi</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    title: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    settingDesc: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        marginTop: 2,
    },
    aboutCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    appName: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    appVersion: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        marginTop: 4,
    },
    appDesc: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
    },
});

export default SettingsScreen;
