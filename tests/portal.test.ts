import { describe, it, expect, beforeEach } from "vitest";
import { portalManagement } from "../src/domain/portal";
import app from "../src/index";
import { createMockD1Database } from "./helpers/d1-mock";

describe("Portal Domain & Row-Level Security (RLS) Guardrail (#37)", () => {
  const schoolId = "school_sma_hb";

  // Mock data for student and guardian
  const mockStudents = [
    {
      id: "std_andi",
      schoolId,
      userId: "usr_student_andi",
      guardianId: "grd_joko",
      nis: "202601001",
      nisn: "0089123456",
      name: "Andi Pratama",
      gender: "male",
    },
    {
      id: "std_bella",
      schoolId,
      userId: "usr_student_bella",
      guardianId: "grd_susanto",
      nis: "202601002",
      nisn: "0089123457",
      name: "Bella Cantika",
      gender: "female",
    },
    {
      id: "std_erik",
      schoolId,
      userId: null,
      guardianId: "grd_joko",
      nis: "202601005",
      nisn: "0089123460",
      name: "Erik Setiawan",
      gender: "male",
    },
  ];

  const mockGuardians = [
    {
      id: "grd_joko",
      userId: "usr_ortu_andi",
      name: "Joko Pratama",
    },
  ];

  const mockDbHelper = (customStudents = mockStudents, customGuardians = mockGuardians) => {
    return {
      select: (fields?: any) => ({
        from: (table: any) => ({
          where: (condition: any) => {
            const tableStr = String(table);
            // student table lookup
            return {
              limit: (n: number) => customStudents.slice(0, n),
              orderBy: () => [],
              then: (resolve: any) => resolve([]),
            };
          },
          innerJoin: () => ({
            innerJoin: () => ({
              where: () => ({
                orderBy: () => [],
              }),
            }),
            where: () => ({
              orderBy: () => [],
            }),
          }),
        }),
      }),
    };
  };

  it("should assert portal access rejection when a student queries another student's record", () => {
    const andiScope = {
      role: "student",
      userId: "usr_student_andi",
      studentIds: ["std_andi"],
      students: [
        {
          id: "std_andi",
          nis: "202601001",
          nisn: "0089123456",
          name: "Andi Pratama",
          gender: "male",
        },
      ],
    };

    // Access to Andi's own record is allowed
    expect(portalManagement.assertPortalAccess(andiScope, "std_andi")).toBe("std_andi");
    expect(portalManagement.assertPortalAccess(andiScope, null)).toBe("std_andi");

    // Attempting to query Bella's record MUST throw Access Denied
    expect(() => {
      portalManagement.assertPortalAccess(andiScope, "std_bella");
    }).toThrow(/Access Denied/i);

    // Attempting to query Erik's record MUST throw Access Denied
    expect(() => {
      portalManagement.assertPortalAccess(andiScope, "std_erik");
    }).toThrow(/Access Denied/i);
  });

  it("should permit guardians to access all linked children but reject unlinked students", () => {
    // Joko is father to Andi and Erik
    const jokoScope = {
      role: "guardian",
      userId: "usr_ortu_andi",
      studentIds: ["std_andi", "std_erik"],
      students: [
        {
          id: "std_andi",
          nis: "202601001",
          nisn: "0089123456",
          name: "Andi Pratama",
          gender: "male",
        },
        {
          id: "std_erik",
          nis: "202601005",
          nisn: "0089123460",
          name: "Erik Setiawan",
          gender: "male",
        },
      ],
    };

    // Joko can access Andi
    expect(portalManagement.assertPortalAccess(jokoScope, "std_andi")).toBe("std_andi");
    // Joko can access Erik
    expect(portalManagement.assertPortalAccess(jokoScope, "std_erik")).toBe("std_erik");

    // Joko CANNOT access Bella (daughter of Susanto)
    expect(() => {
      portalManagement.assertPortalAccess(jokoScope, "std_bella");
    }).toThrow(/Access Denied/i);
  });

  it("should return 403 Forbidden on /api/portal/overview when accessing unauthorized student", async () => {
    // Mock D1 returning Andi as the student for usr_student_andi
    const mockStudentRows = [
      ["std_andi", "school_sma_hb", "usr_student_andi", "grd_joko", "202601001", "0089123456", "Andi Pratama", "male", "2010-04-12", "Jakarta", "Jl. Tebet", null, null, "active", 1761476400, 1761476400]
    ];
    const mockDb = createMockD1Database(mockStudentRows);

    const res = await app.request(
      "/api/portal/overview?studentId=std_bella",
      {
        headers: {
          "x-user-id": "usr_student_andi",
          "x-user-role": "student",
        },
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/Access Denied/i);
  });

  it("should return 200 on /api/portal/overview when accessing authorized student", async () => {
    const mockStudentRows = [
      ["std_andi", "school_sma_hb", "usr_student_andi", "grd_joko", "202601001", "0089123456", "Andi Pratama", "male", "2010-04-12", "Jakarta", "Jl. Tebet", null, null, "active", 1761476400, 1761476400]
    ];
    const mockDb = createMockD1Database(mockStudentRows);

    const res = await app.request(
      "/api/portal/overview?studentId=std_andi",
      {
        headers: {
          "x-user-id": "usr_student_andi",
          "x-user-role": "student",
        },
      },
      { DB: mockDb } as any
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("selectedStudentId", "std_andi");
    expect(body.data).toHaveProperty("timetables");
    expect(body.data).toHaveProperty("attendance");
    expect(body.data).toHaveProperty("grades");
    expect(body.data).toHaveProperty("invoices");
  });
});
