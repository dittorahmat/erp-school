export function createMockD1Database(mockRows: any[] = []) {
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        raw: async () => mockRows,
        all: async () => ({ results: mockRows, success: true }),
        first: async () => mockRows[0] || null,
        run: async () => ({ success: true, meta: { changes: 1 } })
      })
    }),
    batch: async (statements: any[]) => {
      return statements.map(() => ({ results: [], success: true }));
    },
    exec: async (query: string) => ({ count: 1, duration: 1 })
  } as unknown as D1Database;
}
