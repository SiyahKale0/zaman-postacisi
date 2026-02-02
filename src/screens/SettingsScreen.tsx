import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button } from '../components/ui/Button';
import { useSoundStore } from '../stores/soundStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { useProgressStore } from '../stores/progressStore';
import { useAchievementStore } from '../stores/achievementStore';
import { COLORS } from '../components/game/GameAssets';

interface SettingsScreenProps {
    onBack: () => void;
}

// Simple volume control component without external dependencies
const VolumeControl: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ label, value, onChange }) => {
    const percentage = Math.round(value * 100);
    
    const decrease = () => onChange(Math.max(0, value - 0.1));
    const increase = () => onChange(Math.min(1, value + 0.1));
    
    return (
        <View style={styles.volumeRow}>
            <Text style={styles.volumeLabel}>{label}</Text>
            <View style={styles.volumeControls}>
                <TouchableOpacity style={styles.volumeBtn} onPress={decrease}>
                    <Text style={styles.volumeBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.volumeBar}>
                    <View style={[styles.volumeFill, { width: `${percentage}%` }]} />
                </View>
                <TouchableOpacity style={styles.volumeBtn} onPress={increase}>
                    <Text style={styles.volumeBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.volumeValue}>{percentage}%</Text>
            </View>
        </View>
    );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const {
        soundEnabled,
        musicEnabled,
        hapticsEnabled,
        soundVolume,
        musicVolume,
        setSoundEnabled,
        setMusicEnabled,
        setHapticsEnabled,
        setSoundVolume,
        setMusicVolume,
        playSound,
    } = useSoundStore();

    const { resetTutorial, hasCompletedTutorial } = useTutorialStore();
    const { resetProgress: resetGameProgress } = useProgressStore();
    const { resetAchievements } = useAchievementStore();

    const handleResetTutorial = () => {
        Alert.alert(
            'Tutorial\'u Sıfırla',
            'Tutorial\'u tekrar görmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    onPress: () => {
                        resetTutorial();
                        playSound('buttonTap');
                    },
                },
            ]
        );
    };

    const handleResetProgress = () => {
        Alert.alert(
            'İlerlemeyi Sıfırla',
            'Tüm ilerlemeniz silinecek. Bu işlem geri alınamaz!',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => {
                        resetGameProgress();
                        resetAchievements();
                        resetTutorial();
                        playSound('buttonTap');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <View style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Ayarlar</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                                trackColor={{ false: '#333', true: COLORS.mailbox }}
                                thumbColor={soundEnabled ? '#fff' : '#888'}
                            />
                        </View>

                        {soundEnabled && (
                            <VolumeControl
                                label="Ses Seviyesi"
                                value={soundVolume}
                                onChange={setSoundVolume}
                            />
                        )}

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Müzik</Text>
                                <Text style={styles.settingDesc}>Arka plan müziği</Text>
                            </View>
                            <Switch
                                value={musicEnabled}
                                onValueChange={setMusicEnabled}
                                trackColor={{ false: '#333', true: COLORS.mailbox }}
                                thumbColor={musicEnabled ? '#fff' : '#888'}
                            />
                        </View>

                        {musicEnabled && (
                            <VolumeControl
                                label="Müzik Seviyesi"
                                value={musicVolume}
                                onChange={setMusicVolume}
                            />
                        )}

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Titreşim</Text>
                                <Text style={styles.settingDesc}>Dokunsal geri bildirim</Text>
                            </View>
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={setHapticsEnabled}
                                trackColor={{ false: '#333', true: COLORS.mailbox }}
                                thumbColor={hapticsEnabled ? '#fff' : '#888'}
                            />
                        </View>
                    </View>

                    {/* Data Management */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📂 Veri Yönetimi</Text>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleResetTutorial}
                        >
                            <Text style={styles.actionButtonText}>🎓 Tutorial'u Tekrar Göster</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.dangerButton]}
                            onPress={handleResetProgress}
                        >
                            <Text style={styles.dangerButtonText}>⚠️ İlerlemeyi Sıfırla</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>📜 Gizlilik Politikası</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>📋 Kullanım Şartları</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made with 💜 by Zaman Postanesi</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: 10,
        height: 10,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: COLORS.ink,
        transform: [{ rotate: '45deg' }, { translateX: 2 }],
    },
    title: {
        color: COLORS.ink,
        fontSize: 20,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 14,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        color: COLORS.ink,
        fontSize: 15,
        fontWeight: '500',
    },
    settingDesc: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    volumeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        marginLeft: 16,
    },
    volumeLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        width: 90,
    },
    volumeControls: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    volumeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    volumeBtnText: {
        color: COLORS.ink,
        fontSize: 18,
        fontWeight: '600',
    },
    volumeBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        backgroundColor: COLORS.mailbox,
        borderRadius: 3,
    },
    volumeValue: {
        color: COLORS.ink,
        fontSize: 13,
        fontWeight: '500',
        width: 40,
        textAlign: 'right',
    },
    actionButton: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.ink,
        fontSize: 15,
        fontWeight: '500',
    },
    dangerButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    dangerButtonText: {
        color: '#ff6b6b',
        fontSize: 15,
        fontWeight: '500',
    },
    aboutCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    appName: {
        color: COLORS.ink,
        fontSize: 22,
        fontWeight: '700',
    },
    appVersion: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 13,
        marginTop: 4,
    },
    appDesc: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    linkButton: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
    },
});

export default SettingsScreen;
