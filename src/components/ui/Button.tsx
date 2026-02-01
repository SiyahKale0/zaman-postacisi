import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    style,
    textStyle,
    icon,
}) => {
    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            style={({ pressed }) => [
                ...buttonStyles,
                pressed && !disabled && styles.pressed,
            ]}
        >
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={textStyles}>{title}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        gap: 8,
    },

    // Variants
    primary: {
        backgroundColor: '#6644ff',
    },
    secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    danger: {
        backgroundColor: '#ff4444',
    },
    success: {
        backgroundColor: '#22cc55',
    },

    // Sizes
    small: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    medium: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    large: {
        paddingHorizontal: 32,
        paddingVertical: 18,
    },

    // Text
    text: {
        color: '#ffffff',
        fontWeight: '600',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },

    icon: {
        fontSize: 18,
    },
});

export default Button;
