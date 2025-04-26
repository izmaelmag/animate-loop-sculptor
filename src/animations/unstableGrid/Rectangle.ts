import { findQuadDiagonalIntersection } from "./utils";

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

// Тип рендер-функции для четырехугольника
export type RectangleRenderFunction = (
  p5Instance: any, // Инстанс p5.js (исправить на конкретный тип, когда будем использовать строгую типизацию)
  progress: number, // Общий прогресс анимации
  lines: Line[], // Линии четырехугольника
  intersectionPoint: Point, // Точка пересечения диагоналей, вычисленная методом getDiagonalIntersection()
  vertices: Point[], // Вершины четырехугольника
  color: Color, // Цвет четырехугольника
  metadata: RectangleMetadata // Метаданные четырехугольника
) => void;

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

  // Получить центр четырехугольника (среднее арифметическое всех вершин)
  public getCenter(): Point {
    const xSum = this.vertices.reduce((sum, point) => sum + point.x, 0);
    const ySum = this.vertices.reduce((sum, point) => sum + point.y, 0);

    return {
      x: xSum / 4,
      y: ySum / 4,
    };
  }

  // Получить точку пересечения диагоналей четырехугольника
  public getDiagonalIntersection(): Point {
    // Используем точную функцию нахождения пересечения диагоналей
    const intersection = findQuadDiagonalIntersection(this.vertices);

    // Если пересечения нет (что маловероятно для обычных четырехугольников),
    // используем запасной метод - центр четырехугольника
    if (intersection === null) {
      return this.getCenter();
    }

    return intersection;
  }

  // Получить диагонали четырехугольника
  public getDiagonals(): Line[] {
    return [
      // Диагональ от верхнего левого до нижнего правого
      { start: this.vertices[0], end: this.vertices[2] },
      // Диагональ от верхнего правого до нижнего левого
      { start: this.vertices[1], end: this.vertices[3] },
    ];
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

// Стандартная функция рендеринга с диагоналями и центральным кругом
export const defaultRectangleRenderer: RectangleRenderFunction = (
  p5Instance,
  progress,
  lines,
  intersectionPoint, // Точка пересечения диагоналей, вычисленная методом getDiagonalIntersection()
  vertices,
  color,
  metadata
) => {
  // Настройка параметров рендеринга
  p5Instance.noFill();
  
  // Рисуем диагонали
  p5Instance.stroke(255, 255, 255, 80); // Диагонали белым цветом
  p5Instance.strokeWeight(0.5);
  
  // Диагональ 1: верхний левый - нижний правый
  p5Instance.line(vertices[0].x, vertices[0].y, vertices[2].x, vertices[2].y);
  
  // Диагональ 2: верхний правый - нижний левый
  p5Instance.line(vertices[1].x, vertices[1].y, vertices[3].x, vertices[3].y);
  
  // Рисуем круги в вершинах четырехугольника
  p5Instance.fill(color.r, color.g, color.b);
  p5Instance.noStroke();
  
  // Радиус круга: 5 пикселей (половина от прошлого размера)
  const circleRadius = 5;
  
  // Рисуем круг в каждой вершине
  for (const vertex of vertices) {
    p5Instance.ellipse(vertex.x, vertex.y, circleRadius * 2, circleRadius * 2);
  }
};
