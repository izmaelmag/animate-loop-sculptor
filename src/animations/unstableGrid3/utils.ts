import { Point, Line } from './Rectangle';

/**
 * Находит точку пересечения двух отрезков.
 * Использует параметрическое представление линий для точного расчета.
 * 
 * @param line1 Первый отрезок
 * @param line2 Второй отрезок
 * @returns Точка пересечения отрезков или null, если пересечения нет
 */
export const findSegmentIntersection = (line1: Line, line2: Line): Point | null => {
  // Координаты первого отрезка
  const { x: x1, y: y1 } = line1.start;
  const { x: x2, y: y2 } = line1.end;
  
  // Координаты второго отрезка
  const { x: x3, y: y3 } = line2.start;
  const { x: x4, y: y4 } = line2.end;
  
  // Вычисляем знаменатель для уравнений параметров t и u
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  
  // Если знаменатель равен 0, отрезки параллельны или совпадают
  if (denominator === 0) {
    return null;
  }
  
  // Вычисляем параметры t и u
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
  
  // Проверяем, находятся ли параметры в пределах [0, 1]
  // Если да, то отрезки пересекаются
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    // Вычисляем координаты точки пересечения
    const intersectionX = x1 + ua * (x2 - x1);
    const intersectionY = y1 + ua * (y2 - y1);
    
    return { x: intersectionX, y: intersectionY };
  }
  
  // Отрезки не пересекаются
  return null;
};

/**
 * Находит точку пересечения диагоналей четырехугольника.
 * 
 * @param vertices Массив из 4 вершин четырехугольника [topLeft, topRight, bottomRight, bottomLeft]
 * @returns Точка пересечения диагоналей или null, если диагонали не пересекаются
 */
export const findQuadDiagonalIntersection = (vertices: Point[]): Point | null => {
  if (vertices.length !== 4) {
    throw new Error('Четырехугольник должен иметь ровно 4 вершины');
  }
  
  // Определяем две диагонали
  const diagonal1: Line = {
    start: vertices[0], // topLeft
    end: vertices[2]    // bottomRight
  };
  
  const diagonal2: Line = {
    start: vertices[1], // topRight
    end: vertices[3]    // bottomLeft
  };
  
  // Находим пересечение диагоналей
  return findSegmentIntersection(diagonal1, diagonal2);
}; 