// Структура для представления точки
export interface Point {
  x: number;
  y: number;
}

// Структура для представления линии
export interface Line {
  start: Point;
  end: Point;
}

// Структура для представления цвета
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Интерфейс для метаданных прямоугольника
export interface RectangleMetadata {
  colTopLeft: number;
  rowTopLeft: number;
  colBottomRight: number;
  rowBottomRight: number;
  isEdgeRect?: boolean; // Флаг, указывающий является ли прямоугольник краевым
  [key: string]: number | boolean | undefined; // Разрешенные типы для дополнительных свойств
}

export class Rectangle {
  // Четыре вершины четырехугольника
  private vertices: Point[] = [];
  // Четыре линии, образующие четырехугольник
  private lines: Line[] = [];
  // Цвет четырехугольника
  private color: Color;
  // Метаданные для идентификации прямоугольника
  private metadata?: RectangleMetadata;

  constructor(
    topLeft: Point,
    topRight: Point,
    bottomRight: Point,
    bottomLeft: Point
  ) {
    this.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    // Генерируем случайный цвет при создании
    this.color = Rectangle.generateRandomColor();
  }

  // Обновить вершины четырехугольника
  public setVertices(
    topLeft: Point,
    topRight: Point,
    bottomRight: Point,
    bottomLeft: Point
  ) {
    this.vertices = [topLeft, topRight, bottomRight, bottomLeft];
    this.updateLines();
  }

  // Обновить линии на основе вершин
  private updateLines() {
    this.lines = [];

    // Создаем 4 линии, соединяющие вершины по кругу
    for (let i = 0; i < 4; i++) {
      const start = this.vertices[i];
      const end = this.vertices[(i + 1) % 4]; // Замыкаем круг с последней на первую

      this.lines.push({
        start,
        end,
      });
    }
  }

  // Получить все линии для отрисовки
  public getLines(): Line[] {
    return this.lines;
  }

  // Получить вершины для отрисовки
  public getVertices(): Point[] {
    return this.vertices;
  }

  // Получить цвет
  public getColor(): Color {
    return this.color;
  }

  // Установить цвет вручную
  public setColor(color: Color): void {
    this.color = color;
  }

  // Установить метаданные
  public setMetadata(metadata: RectangleMetadata): void {
    this.metadata = metadata;
  }

  // Получить метаданные
  public getMetadata(): RectangleMetadata | undefined {
    return this.metadata;
  }

  // Получить центр четырехугольника
  public getCenter(): Point {
    const xSum = this.vertices.reduce((sum, point) => sum + point.x, 0);
    const ySum = this.vertices.reduce((sum, point) => sum + point.y, 0);

    return {
      x: xSum / 4,
      y: ySum / 4,
    };
  }

  // Генерировать случайный цвет
  private static generateRandomColor(): Color {
    return {
      r: Math.floor(Math.random() * 220) + 35, // 35-255 для более ярких цветов
      g: Math.floor(Math.random() * 220) + 35,
      b: Math.floor(Math.random() * 220) + 35,
      a: 0.7, // Полупрозрачность
    };
  }
}
