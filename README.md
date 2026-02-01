# Zaman Postacisi

Zaman Postacisi, mektupları zamanda yolculuk yaparak teslim ettiginiz bir bulmaca oyunudur. Oyuncu olarak amacınız, mürekkebiniz bitmeden mektubu alıcısına ulastırmak.

## Oynanıs

Ekrana dokunarak çizdiginiz yol üzerinden mektup hedefe dogru ilerler. Mürekkep miktarınız sınırlı oldugu için en verimli rotayı bulmak önemli. Seviyeler ilerledikçe engeller ve zaman portalları devreye giriyor.

## Kurulum

Projeyi klonladıktan sonra bagımlılıkları yükleyin:

```bash
npm install
```

Android için:

```bash
npm expo start
```



## Gereksinimler

- Node.js 18 veya üzeri
- Expo CLI
- Android Studio veya Xcode (platforma göre)

## Proje Yapısı

```
src/
  components/    - UI ve oyun bileşenleri
  engine/        - Fizik ve geometri hesaplamaları
  screens/       - Uygulama ekranları
  stores/        - Zustand state yönetimi
  utils/         - Yardımcı fonksiyonlar
```

## Teknolojiler

- React Native / Expo
- React Native Skia (çizim için)
- Zustand (state yönetimi)
- React Navigation

