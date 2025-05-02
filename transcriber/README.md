# 🎤 Whisper Word-Timestamp Extractor (60fps sync)

Этот проект позволяет извлекать **слова с таймингами и фреймами** из аудиофайла (`.mp3` или `.wav`) с помощью OpenAI Whisper.
Полезно для создания караоке или анимации текста в WebGL/Canvas/Remotion.

---

## 📦 Установка

### 1. Клонируй репозиторий (или создай папку)

```bash
mkdir whisper-timestamp && cd whisper-timestamp
```

### 2. Установи зависимости

```bash
npm install fluent-ffmpeg node-fetch
```

### 3. Установи [FFmpeg](https://ffmpeg.org/download.html)

- **Mac**: `brew install ffmpeg`
- **Ubuntu**: `sudo apt install ffmpeg`
- **Windows**: [инструкция здесь](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)

### 4. Установи [Whisper](https://github.com/openai/whisper)

```bash
pip install git+https://github.com/openai/whisper.git
```

> Убедись, что `python`, `pip`, и `whisper` доступны в командной строке.

---

## 📁 Подготовка файлов

Положи файл `input.mp3` или `input.wav` в корень проекта.

---

## 🚀 Запуск

```bash
node transcribe.js
```

После выполнения появится файл:

```
words.json
```

---

## 📄 Пример JSON-результата

```json
[
  {
    "word": "I",
    "start": 0.5,
    "end": 0.7,
    "frame_start": 30,
    "frame_end": 42
  },
  ...
]
```

---

## 🛠 Параметры

- Используется модель `medium`. Можно заменить на `base`, `small`, `large` — в коде.
- Частота кадров зашита как `60 FPS`, меняется в `transcribe.js`.

---

## 📌 Требования

- Node.js >= 16
- Python >= 3.8
- FFmpeg установлен
- Whisper установлен (через pip)

---

## 📮 Контакты

Автор скрипта: [ты 😉]  
Если будут баги — пиши, помогу адаптировать под твой стек.

---

## 🐍 Использование Python3 и pip3 с venv (рекомендуется)

Для изоляции зависимостей рекомендовано создать виртуальное окружение:

```bash
# 1. Создаём виртуальное окружение
python3 -m venv whisper-env

# 2. Активируем окружение
source whisper-env/bin/activate

# 3. Устанавливаем whisper
pip install git+https://github.com/openai/whisper.git

# (опционально) Устанавливаем ffmpeg-python
pip install ffmpeg-python
```

Теперь ты можешь запускать whisper, не трогая системный Python.

Чтобы выйти из окружения:

```bash
deactivate
```
