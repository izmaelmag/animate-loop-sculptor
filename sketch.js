// Простой P5.js скетч с анимацией
// В этом коде t - нормализованное время от 0 до 1
// frame - номер текущего кадра
// frameNumber - то же самое, что frame
// totalFrames - общее количество кадров в видео

// Настраиваем фон
p.background(0);

// Вычисляем центр
const centerX = p.width / 2;
const centerY = p.height / 2;

// Устанавливаем цвет заливки
p.fill(255);
p.noStroke();

// Рисуем текст
p.textSize(50);
p.textAlign(p.CENTER, p.CENTER);
p.text(`Кадр ${frameNumber} из ${totalFrames}`, centerX, centerY - 300);

// Анимация круга
const circleSize = p.map(p.sin(t * p.TWO_PI * 2), -1, 1, 100, 300);
p.fill(255, 0, 100);
p.ellipse(centerX, centerY, circleSize, circleSize);

// Анимация вращающихся точек
const numPoints = 12;
const radius = 250;
p.fill(0, 255, 255);

for (let i = 0; i < numPoints; i++) {
  const angle = t * p.TWO_PI + (i / numPoints) * p.TWO_PI;
  const x = centerX + p.cos(angle) * radius;
  const y = centerY + p.sin(angle) * radius;
  const pointSize = p.map(p.sin(t * p.TWO_PI * 3 + i), -1, 1, 20, 50);
  
  p.ellipse(x, y, pointSize, pointSize);
}

// Рисуем прогресс-бар
const progressWidth = p.width * 0.8;
const progressHeight = 20;
const progressX = centerX - progressWidth / 2;
const progressY = centerY + 400;

// Фон прогресс-бара
p.fill(50);
p.rect(progressX, progressY, progressWidth, progressHeight, 10);

// Заполнение прогресс-бара
p.fill(0, 255, 100);
p.rect(progressX, progressY, progressWidth * t, progressHeight, 10);

// Добавим процент выполнения
p.fill(255);
p.textSize(30);
p.text(`${Math.round(t * 100)}%`, centerX, progressY + 70); 