export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function calculateGrade(marks: number, passingMarks: number = 75): string {
  return marks >= 90 ? "A" : marks >= 80 ? "B" : marks >= passingMarks ? "C" : "D";
}
