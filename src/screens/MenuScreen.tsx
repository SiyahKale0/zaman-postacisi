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
import { Canvas, Path, Circle, Group, Skia } from '@shopify/react-native-skia';

import { Button } from '../components/ui/Button';
import { useProgressStore } from '../stores/progressStore';
import { COLORS } from '../components/game/GameAssets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuScreenProps {
    onPlay: () => void;
    onAlbum: () => void;
    onSettings: () => void;
    onAchievements?: () => void;
}

// Minimal mailbox icon for logo
const MailboxLogo: React.FC = () => {
    const size = 100;
    const x = SCREEN_WIDTH / 2;
    const y = 60;

    const mailboxPath = Skia.Path.Make();
    const w = size * 0.6;
    const h = size * 0.9;

    // Mailbox body
    mailboxPath.moveTo(x - w / 2, y + h / 2);
    mailboxPath.lineTo(x - w / 2, y - h / 4);
    mailboxPath.arcToTangent(x - w / 2, y - h / 2, x, y - h / 2, w / 3);
    mailboxPath.arcToTangent(x + w / 2, y - h / 2, x + w / 2, y - h / 4, w / 3);
    mailboxPath.lineTo(x + w / 2, y + h / 2);
    mailboxPath.close();

    // Door slot
    const doorPath = Skia.Path.Make();
    doorPath.addRRect({
        rect: { x: x - w / 3, y: y - 5, width: w * 0.7, height: h * 0.18 },
        rx: 4,
        ry: 4,
    });

    // Envelope inside
    const envPath = Skia.Path.Make();
    const envW = 28;
    const envH = 20;
    const envY = y + 5;
    envPath.moveTo(x - envW / 2, envY - envH / 2);
    envPath.lineTo(x + envW / 2, envY - envH / 2);
    envPath.lineTo(x + envW / 2, envY + envH / 2);
    envPath.lineTo(x - envW / 2, envY + envH / 2);
    envPath.close();

    const envFlapPath = Skia.Path.Make();
    envFlapPath.moveTo(x - envW / 2, envY - envH / 2);
    envFlapPath.lineTo(x, envY + 2);
    envFlapPath.lineTo(x + envW / 2, envY - envH / 2);

    return (
        <Canvas style={{ width: SCREEN_WIDTH, height: 140 }}>
            {/* Shadow */}
            <Path
                path={mailboxPath}
                color="rgba(0, 0, 0, 0.2)"
                style="fill"
                transform={[{ translateX: 4 }, { translateY: 4 }]}
            />
            {/* Main body */}
            <Path path={mailboxPath} color={COLORS.mailbox} style="fill" />
            <Path path={mailboxPath} color={COLORS.mailboxLight} style="stroke" strokeWidth={2} />

            {/* Door */}
            <Path path={doorPath} color={COLORS.backgroundLight} style="fill" />

            {/* Envelope sticking out */}
            <Path path={envPath} color={COLORS.envelope} style="fill" />
            <Path path={envFlapPath} color={COLORS.envelopeShadow} style="stroke" strokeWidth={1} />

            {/* Seal */}
            <Circle cx={x} cy={y + 5} r={4} color={COLORS.seal} style="fill" />

            {/* Flag */}
            <Path
                path={(() => {
                    const p = Skia.Path.Make();
                    p.moveTo(x + w / 2 + 2, y);
                    p.lineTo(x + w / 2 + 2, y - 25);
                    p.lineTo(x + w / 2 + 18, y - 20);
                    p.lineTo(x + w / 2 + 2, y - 15);
                    return p;
                })()}
                color={COLORS.mailboxFlag}
                style="fill"
            />
        </Canvas>
    );
};

export const MenuScreen: React.FC<MenuScreenProps> = ({
    onPlay,
    onAlbum,
    onSettings,
    onAchievements,
}) => {
    const { stamps, getTotalStars } = useProgressStore();
    const totalStars = getTotalStars();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header Stats */}
            <View style={styles.header}>
                <View style={styles.statBadge}>
                    <View style={styles.stampIcon} />
                    <Text style={styles.statValue}>{stamps}</Text>
                </View>
                <View style={styles.statBadge}>
                    <View style={styles.starIcon} />
                    <Text style={styles.statValue}>{totalStars}</Text>
                </View>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <MailboxLogo />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>ZAMAN</Text>
                <Text style={styles.titleAccent}>POSTACISI</Text>
                <View style={styles.subtitleLine} />
                <Text style={styles.subtitle}>TEK ÇİZGİ</Text>
            </View>

            {/* Menu Buttons */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.playButton} onPress={onPlay}>
                    <View style={styles.playIcon} />
                    <Text style={styles.playText}>OYNA</Text>
                </TouchableOpacity>

                <View style={styles.menuRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={onAlbum}>
                        <Text style={styles.secondaryText}>Albüm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={onSettings}>
                        <Text style={styles.secondaryText}>Ayarlar</Text>
                    </TouchableOpacity>
                </View>

                {/* Achievements button */}
                {onAchievements && (
                    <TouchableOpacity style={styles.achievementButton} onPress={onAchievements}>
                        <Text style={styles.achievementIcon}>🏆</Text>
                        <Text style={styles.achievementText}>Başarılar</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerLine} />
                <Text style={styles.footerText}>Zamanı onar, mektupları ulaştır</Text>
            </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 10,
    },
    stampIcon: {
        width: 14,
        height: 14,
        borderRadius: 2,
        backgroundColor: COLORS.seal,
        transform: [{ rotate: '12deg' }],
    },
    starIcon: {
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: COLORS.bounceSpring,
    },
    statValue: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 24,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    title: {
        color: COLORS.ink,
        fontSize: 38,
        fontWeight: '200',
        letterSpacing: 16,
    },
    titleAccent: {
        color: COLORS.mailboxLight,
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 4,
        marginTop: -4,
    },
    subtitleLine: {
        width: 60,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 16,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
        letterSpacing: 12,
        fontWeight: '300',
    },
    menu: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 48,
        gap: 20,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.mailbox,
        paddingVertical: 20,
        borderRadius: 16,
        gap: 12,
    },
    playIcon: {
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 16,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: COLORS.ink,
    },
    playText: {
        color: COLORS.ink,
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 4,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 2,
    },
    achievementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    achievementIcon: {
        fontSize: 18,
    },
    achievementText: {
        color: COLORS.bounceSpring,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 32,
    },
    footerLine: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 12,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        letterSpacing: 1,
        fontWeight: '300',
    },
});

export default MenuScreen;
