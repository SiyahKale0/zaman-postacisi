import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button } from '../components/ui/Button';
import { useProgressStore } from '../stores/progressStore';

interface ShopScreenProps {
    onBack: () => void;
}

interface UpgradeItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    costs: number[];
    maxLevel: number;
    currentLevel: number;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onBack }) => {
    const {
        stamps,
        upgrades,
        purchaseUpgrade,
        cosmetics,
        setCosmetic,
    } = useProgressStore();

    const upgradeItems: UpgradeItem[] = [
        {
            id: 'inkExtension',
            name: 'Mürekkep Uzatma',
            description: 'Çizgi kapasiteni artır',
            icon: '🖋️',
            costs: [50, 100, 200],
            maxLevel: 3,
            currentLevel: upgrades.inkExtension,
        },
        {
            id: 'speedAdjust',
            name: 'Hız Ayarı',
            description: 'Paket hızını kontrol et',
            icon: '⚡',
            costs: [75, 150, 300],
            maxLevel: 3,
            currentLevel: upgrades.speedAdjust,
        },
    ];

    const cosmeticItems = [
        {
            id: 'package_envelope',
            type: 'packageSkin' as const,
            name: 'Zarf',
            icon: '✉️',
            cost: 100,
            owned: cosmetics.packageSkin === 'envelope',
        },
        {
            id: 'package_bottle',
            type: 'packageSkin' as const,
            name: 'Şişe Mesaj',
            icon: '🍾',
            cost: 150,
            owned: cosmetics.packageSkin === 'bottle',
        },
        {
            id: 'line_neon',
            type: 'lineEffect' as const,
            name: 'Neon Çizgi',
            icon: '💜',
            cost: 200,
            owned: cosmetics.lineEffect === 'neon',
        },
        {
            id: 'line_chalk',
            type: 'lineEffect' as const,
            name: 'Tebeşir Çizgi',
            icon: '🖍️',
            cost: 120,
            owned: cosmetics.lineEffect === 'chalk',
        },
    ];

    const handleUpgrade = (item: UpgradeItem) => {
        if (item.currentLevel >= item.maxLevel) return;
        const cost = item.costs[item.currentLevel];
        purchaseUpgrade(item.id as keyof typeof upgrades, cost);
    };

    const handleCosmetic = (item: typeof cosmeticItems[0]) => {
        if (item.owned) {
            // Equip
            setCosmetic(item.type, item.id.split('_')[1]);
        } else if (stamps >= item.cost) {
            // Buy and equip
            useProgressStore.getState().spendStamps(item.cost);
            setCosmetic(item.type, item.id.split('_')[1]);
        }
    };

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
                <Text style={styles.title}>🏪 Mağaza</Text>
                <View style={styles.stampsContainer}>
                    <Text style={styles.stampsIcon}>💰</Text>
                    <Text style={styles.stampsValue}>{stamps}</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* Upgrades Section */}
                <Text style={styles.sectionTitle}>⬆️ Geliştirmeler</Text>
                <View style={styles.section}>
                    {upgradeItems.map((item) => {
                        const nextCost = item.currentLevel < item.maxLevel
                            ? item.costs[item.currentLevel]
                            : null;
                        const canAfford = nextCost !== null && stamps >= nextCost;
                        const maxed = item.currentLevel >= item.maxLevel;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.upgradeCard,
                                    maxed && styles.upgradeMaxed,
                                ]}
                                onPress={() => handleUpgrade(item)}
                                disabled={maxed || !canAfford}
                            >
                                <Text style={styles.upgradeIcon}>{item.icon}</Text>
                                <View style={styles.upgradeInfo}>
                                    <Text style={styles.upgradeName}>{item.name}</Text>
                                    <Text style={styles.upgradeDesc}>{item.description}</Text>
                                    <View style={styles.levelIndicator}>
                                        {Array(item.maxLevel).fill(0).map((_, i) => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.levelDot,
                                                    i < item.currentLevel && styles.levelDotFilled,
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.upgradePrice}>
                                    {maxed ? (
                                        <Text style={styles.maxedText}>MAX</Text>
                                    ) : (
                                        <>
                                            <Text style={[
                                                styles.priceText,
                                                !canAfford && styles.priceDisabled,
                                            ]}>
                                                {nextCost}
                                            </Text>
                                            <Text style={styles.priceIcon}>💰</Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Cosmetics Section */}
                <Text style={styles.sectionTitle}>🎨 Kozmetikler</Text>
                <View style={styles.cosmeticsGrid}>
                    {cosmeticItems.map((item) => {
                        const canAfford = stamps >= item.cost;
                        const selected = (
                            (item.type === 'packageSkin' && cosmetics.packageSkin === item.id.split('_')[1]) ||
                            (item.type === 'lineEffect' && cosmetics.lineEffect === item.id.split('_')[1])
                        );

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.cosmeticCard,
                                    item.owned && styles.cosmeticOwned,
                                    selected && styles.cosmeticSelected,
                                ]}
                                onPress={() => handleCosmetic(item)}
                                disabled={!item.owned && !canAfford}
                            >
                                <Text style={styles.cosmeticIcon}>{item.icon}</Text>
                                <Text style={styles.cosmeticName}>{item.name}</Text>
                                {item.owned ? (
                                    <Text style={styles.ownedText}>
                                        {selected ? '✓ Seçili' : 'Seç'}
                                    </Text>
                                ) : (
                                    <Text style={[
                                        styles.cosmeticPrice,
                                        !canAfford && styles.priceDisabled,
                                    ]}>
                                        💰 {item.cost}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
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
    stampsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 200, 0, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    stampsIcon: {
        fontSize: 16,
    },
    stampsValue: {
        color: '#ffc800',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    section: {
        gap: 12,
        marginBottom: 24,
    },
    upgradeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    upgradeMaxed: {
        opacity: 0.6,
    },
    upgradeIcon: {
        fontSize: 32,
    },
    upgradeInfo: {
        flex: 1,
    },
    upgradeName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    upgradeDesc: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    levelIndicator: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    levelDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    levelDotFilled: {
        backgroundColor: '#6644ff',
    },
    upgradePrice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceText: {
        color: '#ffc800',
        fontSize: 18,
        fontWeight: 'bold',
    },
    priceIcon: {
        fontSize: 16,
    },
    priceDisabled: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    maxedText: {
        color: '#22cc55',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cosmeticsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cosmeticCard: {
        width: '47%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    cosmeticOwned: {
        borderWidth: 1,
        borderColor: 'rgba(102, 68, 255, 0.5)',
    },
    cosmeticSelected: {
        borderWidth: 2,
        borderColor: '#6644ff',
        backgroundColor: 'rgba(102, 68, 255, 0.2)',
    },
    cosmeticIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    cosmeticName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    cosmeticPrice: {
        color: '#ffc800',
        fontSize: 14,
        fontWeight: 'bold',
    },
    ownedText: {
        color: '#22cc55',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ShopScreen;
