# Animator - Простой рендеринг P5.js анимаций в видео

Этот проект позволяет легко создавать видео из анимаций P5.js без необходимости настройки серверов или прокси.

## Быстрый старт

1. Отредактируйте анимацию в файле `sketch.js`
2. Запустите рендеринг командой: `node render-video.cjs`
3. Получите готовое видео в папке `output`

## Структура проекта

- `render-video.cjs` - основной скрипт для рендеринга видео
- `sketch.js` - код P5.js анимации, который будет преобразован в видео
- `src/remotion/` - компоненты Remotion для рендеринга

## Настройка видео

В файле `render-video.cjs` вы можете изменить следующие параметры:

```javascript
const FPS = 60;                    // Кадров в секунду
const DURATION_IN_SECONDS = 10;    // Длительность видео в секундах
const WIDTH = 1080;                // Ширина видео в пикселях
const HEIGHT = 1920;               // Высота видео в пикселях
const QUALITY = 'high';            // Качество видео ('high', 'medium', 'low')
```

## Как писать анимации

Файл `sketch.js` содержит код P5.js анимации. В вашей анимации доступны следующие переменные:

- `t` - нормализованное время от 0 до 1 (текущий кадр / всего кадров)
- `frame` или `frameNumber` - номер текущего кадра
- `totalFrames` - общее количество кадров в видео
- `p` - объект с функциями P5.js (`background`, `fill`, `rect`, `ellipse`, и т.д.)

Пример:

```javascript
// Устанавливаем фон
p.background(0);

// Рисуем круг, который изменяет размер с течением времени
const size = p.map(p.sin(t * p.TWO_PI), -1, 1, 100, 300);
p.fill(255, 0, 100);
p.ellipse(p.width / 2, p.height / 2, size, size);
```

## Поддерживаемые функции P5.js

- `background(color)`
- `fill(r, g, b)`
- `noStroke()`
- `ellipse(x, y, width, height)`
- `rect(x, y, width, height, radius)`
- `text(text, x, y)`
- `textSize(size)`
- `textAlign(horizontal, vertical)`
- `map(value, start1, stop1, start2, stop2)`
- `sin(angle)`, `cos(angle)`

## Требования

- Node.js
- Пакеты из `package.json` (`@remotion/bundler`, `@remotion/renderer` и др.)
