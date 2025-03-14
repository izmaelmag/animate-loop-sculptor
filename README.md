# Animator - Простой рендеринг P5.js анимаций в видео

Этот проект позволяет легко создавать видео из анимаций P5.js без необходимости настройки серверов или прокси.

## Как использовать

1. **Редактируйте анимацию** в визуальном редакторе на фронтенде
   - Все изменения сохраняются в файле `src/animation.js`
   - Этот файл используется как на фронтенде, так и при рендеринге

2. **Рендеринг видео**:
   ```bash
   node render-video.cjs
   ```
   - Видео сохраняется в папке `output`

## Структура проекта

- `src/animation.js` - **ГЛАВНЫЙ ФАЙЛ** с кодом анимации, используется и на фронтенде, и при рендеринге
- `render-video.cjs` - скрипт для рендеринга видео (запускается вручную)
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

## Анимация

Код анимации в файле `src/animation.js` имеет следующий формат:

```javascript
export function animation(p, t, frame, totalFrames) {
  // p - экземпляр P5.js
  // t - нормализованное время от 0 до 1
  // frame - номер текущего кадра
  // totalFrames - общее количество кадров в видео
  
  // Ваш код P5.js здесь
  p.background(0);
  
  // Пример анимации круга
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  const size = p.map(p.sin(t * p.TWO_PI), -1, 1, 100, 300);
  p.fill(255, 0, 100);
  p.ellipse(centerX, centerY, size, size);
}
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
