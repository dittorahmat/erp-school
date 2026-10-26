export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function calculateGrade(marks: number, passingMarks: number = 75): string {
  return marks >= 90 ? "A" : marks >= 80 ? "B" : marks >= passingMarks ? "C" : "D";
}

/**
 * Strips undefined fields from an object, keeping defined values (including null, false, 0, "").
 */
export const compactDefined = <T extends Record<string, any>>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as Partial<T>;
