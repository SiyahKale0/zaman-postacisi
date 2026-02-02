/**
 * GameAssets.ts - Minimalist Skia path builders for game elements
 *
 * Tematik: Zaman Postacısı → sade, zamansız posta ikonografisi
 */

import { Skia, SkPath } from '@shopify/react-native-skia';

/**
 * Renk paleti - Minimalist
 */
export const COLORS = {
    // Arka plan
    background: '#0f1115',
    backgroundLight: '#171a21',

    // Surface (UI için)
    surface: '#1a1d24',
    surfaceLight: '#242830',

    // Paket (Zarf)
    envelope: '#f2e9dc',
    envelopeShadow: '#d8cdbb',
    seal: '#b43a3a',
    sealLight: '#e05a5a',

    // Hedef (Posta Kutusu)
    mailbox: '#2f3c2e',
    mailboxLight: '#3d4b3c',
    mailboxFlag: '#b43a3a',
    
    // Goal (Hedef)
    goal: '#00c864',
    goalGlow: 'rgba(0, 200, 100, 0.3)',

    // Çizgi
    ink: '#e8e2d6',
    inkLight: '#bdb5a8',
    inkDark: '#8a847a',
    inkWarning: '#d8a94b',
    inkDanger: '#d16666',

    // Engeller
    spike: '#3b2b2b',
    spikeLight: '#5a3a3a',
    bounce: '#9c7b3c',
    bounceSpring: '#c9a85c',
    fan: '#7fa1b7',
    fanLight: '#a8c4d6',
    teleportEntry: '#6a5acd',
    teleportExit: '#5a4bbe',
    teleportGlow: 'rgba(106, 90, 205, 0.25)',
    platform: '#4b4b58',
    glass: 'rgba(190, 205, 225, 0.25)',
    glassEdge: 'rgba(240, 245, 255, 0.5)',
    
    // Obstacle types
    obstacle: {
        stone: '#5a5a5a',
        spike: '#8b3030',
        portal: '#9b59b6',
    },
} as const;

/**
 * Zarf (Envelope) şekli oluştur - Paket için
 */
export function createEnvelopePath(x: number, y: number, size: number = 24): SkPath {
    const path = Skia.Path.Make();
    const w = size * 1.4; // Genişlik
    const h = size;       // Yükseklik

    // Minimal yuvarlatılmış zarf
    path.addRRect({
        rect: { x: x - w / 2, y: y - h / 2, width: w, height: h },
        rx: Math.min(4, w * 0.15),
        ry: Math.min(4, h * 0.15),
    });

    return path;
}

/**
 * Zarf üst kapağı (V şekli)
 */
export function createEnvelopeFlapPath(x: number, y: number, size: number = 24): SkPath {
    const path = Skia.Path.Make();
    const w = size * 1.4;
    const h = size;
    const inset = w * 0.08;

    // İnceltilmiş V kapak çizgisi
    path.moveTo(x - w / 2 + inset, y - h / 2 + 1);
    path.lineTo(x, y + h * 0.12);
    path.lineTo(x + w / 2 - inset, y - h / 2 + 1);

    return path;
}

/**
 * Zarf üzerine pul/stamp
 */
export function createEnvelopeStampPath(x: number, y: number, size: number = 24): SkPath {
    const path = Skia.Path.Make();
    const stampSize = size * 0.32;
    const w = size * 1.4;
    const h = size;

    const stampX = x + w * 0.22;
    const stampY = y - h * 0.22;

    path.addRRect({
        rect: {
            x: stampX - stampSize / 2,
            y: stampY - stampSize / 2,
            width: stampSize,
            height: stampSize,
        },
        rx: 2,
        ry: 2,
    });

    return path;
}

/**
 * Posta Kutusu şekli - Hedef için
 */
export function createMailboxPath(x: number, y: number, size: number = 35): SkPath {
    const path = Skia.Path.Make();
    const w = size * 0.8;
    const h = size * 1.2;

    // Minimal kapsül gövde
    path.addRRect({
        rect: { x: x - w / 2, y: y - h / 2, width: w, height: h },
        rx: w * 0.45,
        ry: w * 0.45,
    });

    return path;
}

/**
 * Posta kutusu kapağı
 */
export function createMailboxDoorPath(x: number, y: number, size: number = 35): SkPath {
    const path = Skia.Path.Make();
    const w = size * 0.5;
    const h = size * 0.18;
    const doorY = y - size * 0.1;

    path.addRRect({
        rect: { x: x - w / 2, y: doorY - h / 2, width: w, height: h },
        rx: 3,
        ry: 3,
    });

    return path;
}

/**
 * Posta kutusu bayrağı
 */
export function createMailboxFlagPath(x: number, y: number, size: number = 35): SkPath {
    const path = Skia.Path.Make();
    const poleHeight = size * 0.55;
    const flagWidth = size * 0.28;
    const flagHeight = size * 0.16;

    // Bayrak direği
    path.moveTo(x + size * 0.42, y - poleHeight * 0.4);
    path.lineTo(x + size * 0.42, y + poleHeight * 0.4);

    // Bayrak
    path.addRRect({
        rect: {
            x: x + size * 0.42,
            y: y - poleHeight * 0.35,
            width: flagWidth,
            height: flagHeight,
        },
        rx: 2,
        ry: 2,
    });

    return path;
}

/**
 * Zıplama Yayı (Bounce Pad) - Spring şekli
 */
export function createSpringPath(
    x: number,
    y: number,
    width: number,
    height: number
): SkPath {
    const path = Skia.Path.Make();
    const segments = 4;
    const segmentWidth = width / segments;

    // Taban çizgisi
    path.moveTo(x, y + height);
    path.lineTo(x + width, y + height);

    // Yay şekli (zigzag)
    path.moveTo(x + segmentWidth / 2, y + height);

    for (let i = 0; i < segments; i++) {
        const sx = x + segmentWidth / 2 + i * segmentWidth;
        const isUp = i % 2 === 0;

        path.lineTo(sx + segmentWidth / 2, isUp ? y : y + height * 0.7);
    }

    return path;
}

/**
 * Bounce pad yukarı ok
 */
export function createBounceArrowPath(
    x: number,
    y: number,
    width: number
): SkPath {
    const path = Skia.Path.Make();
    const centerX = x + width / 2;
    const arrowY = y - 8;
    const arrowSize = 8;

    // Yukarı ok
    path.moveTo(centerX, arrowY - arrowSize);
    path.lineTo(centerX + arrowSize, arrowY);
    path.lineTo(centerX - arrowSize, arrowY);
    path.close();

    return path;
}

/**
 * Fan/Rüzgar göstergesi - Yön okları
 */
export function createWindIndicatorPaths(
    x: number,
    y: number,
    forceX: number,
    forceY: number,
    radius: number
): SkPath[] {
    const paths: SkPath[] = [];
    const lineCount = 3;
    const spacing = radius / 3;

    // Normalize direction
    const mag = Math.sqrt(forceX * forceX + forceY * forceY) || 1;
    const dirX = forceX / mag;
    const dirY = forceY / mag;

    // Perpendicular direction
    const perpX = -dirY;
    const perpY = dirX;

    for (let i = -1; i <= 1; i++) {
        const path = Skia.Path.Make();
        const startX = x + perpX * i * spacing;
        const startY = y + perpY * i * spacing;
        const lineLength = radius * 0.6;

        // Çizgi
        path.moveTo(startX, startY);
        path.lineTo(startX + dirX * lineLength, startY + dirY * lineLength);

        // Ok ucu
        const tipX = startX + dirX * lineLength;
        const tipY = startY + dirY * lineLength;
        const arrowSize = 6;

        path.moveTo(tipX, tipY);
        path.lineTo(
            tipX - dirX * arrowSize + perpX * arrowSize * 0.5,
            tipY - dirY * arrowSize + perpY * arrowSize * 0.5
        );
        path.moveTo(tipX, tipY);
        path.lineTo(
            tipX - dirX * arrowSize - perpX * arrowSize * 0.5,
            tipY - dirY * arrowSize - perpY * arrowSize * 0.5
        );

        paths.push(path);
    }

    return paths;
}

/**
 * Teleport Portal - İç içe halkalar
 */
export function createPortalPath(x: number, y: number, radius: number): SkPath {
    const path = Skia.Path.Make();

    // Dış halka
    path.addCircle(x, y, radius);

    return path;
}

/**
 * Portal iç halka
 */
export function createPortalInnerPath(x: number, y: number, radius: number): SkPath {
    const path = Skia.Path.Make();
    path.addCircle(x, y, radius * 0.6);
    return path;
}

/**
 * Portal çekirdek
 */
export function createPortalCorePath(x: number, y: number, radius: number): SkPath {
    const path = Skia.Path.Make();
    path.addCircle(x, y, radius * 0.3);
    return path;
}

/**
 * Portal bağlantı çizgisi (giriş-çıkış arası)
 */
export function createPortalConnectionPath(
    entryX: number,
    entryY: number,
    exitX: number,
    exitY: number
): SkPath {
    const path = Skia.Path.Make();

    // Kesikli çizgi efekti için bezier
    path.moveTo(entryX, entryY);

    const midX = (entryX + exitX) / 2;
    const midY = (entryY + exitY) / 2;
    const offset = 24; // Eğri ofseti

    path.quadTo(midX + offset, midY - offset, exitX, exitY);

    return path;
}

/**
 * Spike (Sivri Engel) - Keskin üçgen
 */
export function createMinimalSpikePath(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number = 0
): SkPath {
    const path = Skia.Path.Make();

    // Üçgen
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Rotation matrix
    const cos = Math.cos(rotation * Math.PI / 180);
    const sin = Math.sin(rotation * Math.PI / 180);

    const points = [
        { x: centerX, y: y },                    // Üst nokta
        { x: x + width, y: y + height },         // Sağ alt
        { x: x, y: y + height },                 // Sol alt
    ];

    // Apply rotation around center
    const rotatedPoints = points.map(p => ({
        x: centerX + (p.x - centerX) * cos - (p.y - centerY) * sin,
        y: centerY + (p.x - centerX) * sin + (p.y - centerY) * cos,
    }));

    path.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
    path.lineTo(rotatedPoints[1].x, rotatedPoints[1].y);
    path.lineTo(rotatedPoints[2].x, rotatedPoints[2].y);
    path.close();

    return path;
}

/**
 * Platform çizgisi
 */
export function createPlatformPath(
    x: number,
    y: number,
    width: number,
    height: number
): SkPath {
    const path = Skia.Path.Make();

    path.addRRect({
        rect: { x, y, width, height },
        rx: 2,
        ry: 2,
    });

    return path;
}

/**
 * Cam engel (Glass) - Yarı saydam dikdörtgen
 */
export function createGlassPath(
    x: number,
    y: number,
    width: number,
    height: number
): SkPath {
    const path = Skia.Path.Make();

    path.addRect({ x, y, width, height });

    return path;
}

/**
 * Cam çatlak deseni
 */
export function createGlassCrackPath(
    x: number,
    y: number,
    width: number,
    height: number
): SkPath {
    const path = Skia.Path.Make();
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Çapraz çatlaklar
    path.moveTo(centerX, centerY);
    path.lineTo(centerX - width * 0.3, centerY - height * 0.4);

    path.moveTo(centerX, centerY);
    path.lineTo(centerX + width * 0.25, centerY - height * 0.3);

    path.moveTo(centerX, centerY);
    path.lineTo(centerX + width * 0.35, centerY + height * 0.35);

    path.moveTo(centerX, centerY);
    path.lineTo(centerX - width * 0.2, centerY + height * 0.4);

    return path;
}

/**
 * Start position indicator - Minimal pulse circle
 */
export function createStartIndicatorPath(x: number, y: number, radius: number): SkPath {
    const path = Skia.Path.Make();
    path.addCircle(x, y, radius);
    return path;
}
