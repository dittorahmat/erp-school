import { Hono } from 'hono';
import {
  createAdmissionRegister,
  listAdmissionRegisters,
  submitAdmissionApplication,
  listAdmissionApplications,
  updateApplicationStatus,
  admitApplicant
} from '../domain';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// List / Create Admission Registers
app.get('/registers', async (c) => {
  const schoolId = c.req.query('schoolId') || 'sch_01';
  const db = (c as any).var?.db;
  const registers = await listAdmissionRegisters(db, schoolId);
  return c.json({ data: registers });
});

app.post('/registers', async (c) => {
  const body = await c.req.json();
  const db = (c as any).var?.db;
  const rawDb = c.env.DB;
  const result = await createAdmissionRegister(db, rawDb, body);
  return c.json({ data: result }, 201);
});

// List / Submit Applications
app.get('/applications', async (c) => {
  const registerId = c.req.query('registerId');
  if (!registerId) return c.json({ error: 'registerId is required' }, 400);
  const db = (c as any).var?.db;
  const apps = await listAdmissionApplications(db, registerId);
  return c.json({ data: apps });
});

app.post('/applications', async (c) => {
  const body = await c.req.json();
  const db = (c as any).var?.db;
  const rawDb = c.env.DB;
  const result = await submitAdmissionApplication(db, rawDb, body);
  return c.json({ data: result }, 201);
});

// Update Application Status (verify, approve, reject)
app.patch('/applications/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const db = (c as any).var?.db;
  const rawDb = c.env.DB;
  const result = await updateApplicationStatus(db, rawDb, id, status);
  return c.json({ data: result });
});

// Admit Applicant (Converts to Student, Enrollment & Admission Invoice)
app.post('/applications/:id/admit', async (c) => {
  const applicationId = c.req.param('id');
  const body = await c.req.json();
  const db = (c as any).var?.db;
  const rawDb = c.env.DB;
  const result = await admitApplicant(db, rawDb, {
    applicationId,
    ...body
  });
  return c.json({ data: result });
});

export default app;
