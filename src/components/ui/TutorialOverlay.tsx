import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import { Canvas, Path, Circle, Skia, vec, LinearGradient, RoundedRect } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';

import { useTutorialStore, TutorialStep } from '../../stores/tutorialStore';
import { useSoundStore } from '../../stores/soundStore';
import { COLORS } from '../game/GameAssets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tutorial illustrations
const TutorialIllustration: React.FC<{ step: TutorialStep }> = ({ step }) => {
    const size = 200;

    switch (step.id) {
        case 'welcome':
            // Letter/envelope illustration
            const letterPath = Skia.Path.Make();
            letterPath.addRect({ x: 40, y: 60, width: 120, height: 80 });
            const flapPath = Skia.Path.Make();
            flapPath.moveTo(40, 60);
            flapPath.lineTo(100, 100);
            flapPath.lineTo(160, 60);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={letterPath} color={COLORS.background} style="fill" />
                    <Path path={letterPath} color={COLORS.ink} style="stroke" strokeWidth={3} />
                    <Path path={flapPath} color={COLORS.ink} style="stroke" strokeWidth={3} />
                    <Circle cx={100} cy={110} r={15} color={COLORS.inkLight} style="fill" />
                </Canvas>
            );

        case 'goal':
            // Mailbox illustration
            const mailboxPath = Skia.Path.Make();
            mailboxPath.addRRect({
                rect: { x: 70, y: 50, width: 60, height: 70 },
                rx: 5,
                ry: 5,
            });
            const postPath = Skia.Path.Make();
            postPath.addRect({ x: 95, y: 120, width: 10, height: 50 });
            const flagPath = Skia.Path.Make();
            flagPath.moveTo(130, 60);
            flagPath.lineTo(150, 70);
            flagPath.lineTo(130, 80);
            flagPath.close();
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={postPath} color="#6B4423" style="fill" />
                    <Path path={mailboxPath} color={COLORS.goal} style="fill" />
                    <Path path={mailboxPath} color={COLORS.goalGlow} style="stroke" strokeWidth={2} />
                    <Path path={flagPath} color="#FF4444" style="fill" />
                </Canvas>
            );

        case 'ink':
            // Ink meter illustration
            return (
                <Canvas style={{ width: size, height: size }}>
                    <RoundedRect
                        x={50}
                        y={70}
                        width={100}
                        height={60}
                        r={10}
                        color={COLORS.surfaceLight}
                    />
                    <RoundedRect
                        x={55}
                        y={75}
                        width={60}
                        height={50}
                        r={5}
                        color={COLORS.ink}
                    />
                    <Circle cx={130} cy={100} r={20} color={COLORS.inkDark} style="fill">
                        <LinearGradient
                            start={vec(110, 80)}
                            end={vec(150, 120)}
                            colors={[COLORS.ink, COLORS.inkDark]}
                        />
                    </Circle>
                </Canvas>
            );

        case 'drawing':
            // Drawing hand illustration
            const linePath = Skia.Path.Make();
            linePath.moveTo(40, 150);
            linePath.cubicTo(60, 80, 100, 120, 160, 50);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path
                        path={linePath}
                        color={COLORS.ink}
                        style="stroke"
                        strokeWidth={4}
                        strokeCap="round"
                    />
                    <Circle cx={40} cy={150} r={8} color={COLORS.inkLight} style="fill" />
                    <Circle cx={160} cy={50} r={8} color={COLORS.inkLight} style="fill" />
                </Canvas>
            );

        case 'obstacles':
            // Obstacle types illustration
            return (
                <Canvas style={{ width: size, height: size }}>
                    {/* Stone */}
                    <Circle cx={50} cy={80} r={25} color={COLORS.obstacle.stone} style="fill" />
                    {/* Spike */}
                    <Path
                        path={(() => {
                            const p = Skia.Path.Make();
                            p.moveTo(100, 55);
                            p.lineTo(115, 105);
                            p.lineTo(85, 105);
                            p.close();
                            return p;
                        })()}
                        color={COLORS.obstacle.spike}
                        style="fill"
                    />
                    {/* Bounce */}
                    <Circle cx={150} cy={80} r={25} color={COLORS.bounceSpring} style="fill" />
                    {/* Portal */}
                    <Circle cx={100} cy={150} r={25} color={COLORS.obstacle.portal} style="fill" />
                    <Circle cx={100} cy={150} r={15} color="#FF00FF" style="fill" opacity={0.5} />
                </Canvas>
            );

        case 'stars':
            // Three stars illustration
            return (
                <Canvas style={{ width: size, height: size }}>
                    {[60, 100, 140].map((x, i) => (
                        <Path
                            key={i}
                            path={(() => {
                                const p = Skia.Path.Make();
                                const cx = x;
                                const cy = 100;
                                const r = 25;
                                for (let j = 0; j < 5; j++) {
                                    const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
                                    const px = cx + r * Math.cos(angle);
                                    const py = cy + r * Math.sin(angle);
                                    if (j === 0) p.moveTo(px, py);
                                    else p.lineTo(px, py);
                                }
                                p.close();
                                return p;
                            })()}
                            color={COLORS.bounceSpring}
                            style="fill"
                        />
                    ))}
                </Canvas>
            );

        case 'undo':
            // Undo button illustration
            const undoPath = Skia.Path.Make();
            undoPath.moveTo(120, 80);
            undoPath.quadTo(90, 50, 60, 80);
            undoPath.moveTo(60, 80);
            undoPath.lineTo(75, 65);
            undoPath.moveTo(60, 80);
            undoPath.lineTo(75, 95);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Circle cx={100} cy={100} r={50} color={COLORS.surfaceLight} style="fill" />
                    <Path
                        path={undoPath}
                        color={COLORS.ink}
                        style="stroke"
                        strokeWidth={4}
                        strokeCap="round"
                    />
                </Canvas>
            );

        case 'powerups':
            // Power-up icons illustration
            return (
                <Canvas style={{ width: size, height: size }}>
                    {/* Extra ink */}
                    <Circle cx={60} cy={80} r={20} color={COLORS.ink} style="fill" />
                    <Path
                        path={(() => {
                            const p = Skia.Path.Make();
                            p.moveTo(60, 65);
                            p.lineTo(60, 95);
                            p.moveTo(45, 80);
                            p.lineTo(75, 80);
                            return p;
                        })()}
                        color="#fff"
                        style="stroke"
                        strokeWidth={3}
                    />
                    {/* Shield */}
                    <Path
                        path={(() => {
                            const p = Skia.Path.Make();
                            p.moveTo(100, 60);
                            p.lineTo(125, 70);
                            p.quadTo(125, 110, 100, 120);
                            p.quadTo(75, 110, 75, 70);
                            p.close();
                            return p;
                        })()}
                        color={COLORS.goal}
                        style="fill"
                    />
                    {/* Magnet */}
                    <Path
                        path={(() => {
                            const p = Skia.Path.Make();
                            p.addRect({ x: 130, y: 60, width: 15, height: 30 });
                            p.addRect({ x: 155, y: 60, width: 15, height: 30 });
                            p.addArc({ x: 130, y: 80, width: 40, height: 40 }, 0, 180);
                            return p;
                        })()}
                        color="#FF4444"
                        style="fill"
                    />
                </Canvas>
            );

        case 'complete':
            // Checkmark/success illustration
            const checkPath = Skia.Path.Make();
            checkPath.moveTo(60, 100);
            checkPath.lineTo(85, 125);
            checkPath.lineTo(140, 70);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Circle cx={100} cy={100} r={55} color={COLORS.goal} style="fill" />
                    <Path
                        path={checkPath}
                        color="#fff"
                        style="stroke"
                        strokeWidth={8}
                        strokeCap="round"
                        strokeJoin="round"
                    />
                </Canvas>
            );

        default:
            return null;
    }
};

// Animated dots for page indicator
const PageIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    return (
        <View style={styles.pageIndicator}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === current && styles.dotActive,
                    ]}
                />
            ))}
        </View>
    );
};

export const TutorialOverlay: React.FC = () => {
    const {
        isActive,
        currentStep,
        hasCompletedTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        canGoNext,
        canGoPrevious,
        getCurrentStepIndex,
        getTotalSteps,
    } = useTutorialStore();

    const { playSound } = useSoundStore();

    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const illustrationY = useSharedValue(20);

    const isActiveNow = isActive();
    const currentStepData = currentStep();

    useEffect(() => {
        if (isActiveNow && currentStepData) {
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 15 });
            illustrationY.value = withRepeat(
                withSequence(
                    withTiming(-10, { duration: 1500 }),
                    withTiming(10, { duration: 1500 })
                ),
                -1,
                true
            );
        }
    }, [isActiveNow, currentStepData]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const illustrationStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: illustrationY.value }],
    }));

    if (!isActiveNow || !currentStepData || hasCompletedTutorial) {
        return null;
    }

    const handleNext = () => {
        playSound('buttonTap');
        if (canGoNext()) {
            opacity.value = withTiming(0, { duration: 150 }, () => {
                runOnJS(nextStep)();
                opacity.value = withTiming(1, { duration: 150 });
            });
        }
    };

    const handlePrevious = () => {
        playSound('buttonTap');
        if (canGoPrevious()) {
            opacity.value = withTiming(0, { duration: 150 }, () => {
                runOnJS(previousStep)();
                opacity.value = withTiming(1, { duration: 150 });
            });
        }
    };

    const handleSkip = () => {
        playSound('buttonTap');
        skipTutorial();
    };

    return (
        <Modal
            visible={isActiveNow}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View style={[styles.container, containerStyle]}>
                <Animated.View style={[styles.card, cardStyle]}>
                    {/* Skip button */}
                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                        <Text style={styles.skipText}>Atla</Text>
                    </TouchableOpacity>

                    {/* Illustration */}
                    <Animated.View style={[styles.illustrationContainer, illustrationStyle]}>
                        <TutorialIllustration step={currentStepData} />
                    </Animated.View>

                    {/* Title */}
                    <Text style={styles.title}>{currentStepData.title}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{currentStepData.description}</Text>

                    {/* Page indicator */}
                    <PageIndicator
                        current={getCurrentStepIndex()}
                        total={getTotalSteps()}
                    />

                    {/* Navigation buttons */}
                    <View style={styles.buttonsContainer}>
                        {canGoPrevious() ? (
                            <TouchableOpacity
                                style={styles.navBtn}
                                onPress={handlePrevious}
                            >
                                <Text style={styles.navBtnText}>‹ Geri</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.navBtnPlaceholder} />
                        )}

                        <TouchableOpacity
                            style={[styles.navBtn, styles.navBtnPrimary]}
                            onPress={handleNext}
                        >
                            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
                                {canGoNext() ? 'İleri ›' : 'Başla!'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    skipBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 13,
        fontWeight: '500',
    },
    illustrationContainer: {
        marginTop: 16,
        marginBottom: 24,
    },
    title: {
        color: COLORS.ink,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    pageIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dotActive: {
        backgroundColor: COLORS.ink,
        width: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    navBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
    },
    navBtnPrimary: {
        backgroundColor: COLORS.ink,
    },
    navBtnPlaceholder: {
        flex: 1,
    },
    navBtnText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        fontWeight: '600',
    },
    navBtnTextPrimary: {
        color: COLORS.background,
    },
});

export default TutorialOverlay;
