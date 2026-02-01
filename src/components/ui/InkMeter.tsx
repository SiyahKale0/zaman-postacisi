import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../../stores/gameStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const InkMeter: React.FC = () => {
    const { gameState } = useGameStore();

    const percentage = Math.min(100, (gameState.inkUsed / gameState.inkLimit) * 100);
    const remaining = Math.max(0, gameState.inkLimit - gameState.inkUsed);

    // Color based on remaining ink
    const getColor = () => {
        if (percentage > 80) return '#ff4444';
        if (percentage > 50) return '#ffaa00';
        return '#4488ff';
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>🖋️ Mürekkep</Text>
                <Text style={styles.value}>{Math.round(remaining)}</Text>
            </View>

            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${100 - percentage}%`,
                            backgroundColor: getColor(),
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    value: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    track: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default InkMeter;
