import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/ui/Button';
import { useProgressStore } from '../stores/progressStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuScreenProps {
    onPlay: () => void;
    onAlbum: () => void;
    onSettings: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
    onPlay,
    onAlbum,
    onSettings,
}) => {
    const { stamps, getTotalStars } = useProgressStore();
    const totalStars = getTotalStars();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Background */}
            <View style={styles.background}>
                {/* Animated stars or particles could go here */}
            </View>

            {/* Header Stats */}
            <View style={styles.header}>
                <View style={styles.statBadge}>
                    <Text style={styles.statIcon}>💰</Text>
                    <Text style={styles.statValue}>{stamps}</Text>
                </View>
                <View style={styles.statBadge}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>{totalStars}</Text>
                </View>
            </View>

            {/* Logo / Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleEmoji}>📮</Text>
                <Text style={styles.title}>Zaman</Text>
                <Text style={styles.titleAccent}>Postacısı</Text>
                <Text style={styles.subtitle}>Tek Çizgi</Text>
            </View>

            {/* Menu Buttons */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.playButton} onPress={onPlay}>
                    <Text style={styles.playText}>▶️ OYNA</Text>
                </TouchableOpacity>

                <View style={styles.menuRow}>
                    <Button
                        title="📖 Albüm"
                        onPress={onAlbum}
                        variant="secondary"
                        size="medium"
                    />
                    <Button
                        title="⚙️ Ayarlar"
                        onPress={onSettings}
                        variant="secondary"
                        size="medium"
                    />
                </View>
            </View>

            {/* Decorative elements */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Zamanı onar, mektupları ulaştır!</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0f0f1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    statIcon: {
        fontSize: 18,
    },
    statValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    title: {
        color: '#ffffff',
        fontSize: 42,
        fontWeight: '300',
        letterSpacing: 4,
    },
    titleAccent: {
        color: '#6644ff',
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: -8,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 18,
        letterSpacing: 8,
        marginTop: 8,
    },
    menu: {
        paddingHorizontal: 40,
        paddingBottom: 40,
        gap: 16,
    },
    playButton: {
        backgroundColor: '#6644ff',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6644ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    playText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    footer: {
        paddingBottom: 24,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
    },
});

export default MenuScreen;
