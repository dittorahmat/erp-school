import { Hono } from 'hono';
import {
  catalogMedia,
  listLibraryMedia,
  issueBook,
  returnBook,
  markLostBook,
  listLibraryIssues
} from '../domain';
import type { Bindings } from '../index';

export const libraryRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/library/media - Search and list cataloged media
libraryRouter.get('/media', async (c) => {
  const schoolId = c.req.query('schoolId') || c.req.header('x-school-id') || '';
  const search = c.req.query('q');
  const db = (c as any).var?.db;
  const items = await listLibraryMedia(db, schoolId, search);
  return c.json({ data: items });
});

// POST /api/library/media - Catalog new media (creates product + library_media)
libraryRouter.post('/media', async (c) => {
  const body = await c.req.json();
  const db = (c as any).var?.db;
  const rawDb = c.env.DB;
  const media = await catalogMedia(db, rawDb, body);
  return c.json({ success: true, data: media }, 201);
});

// GET /api/library/issues - Circulation active / returned loans
libraryRouter.get('/issues', async (c) => {
  const schoolId = c.req.query('schoolId') || c.req.header('x-school-id') || '';
  const status = c.req.query('status');
  const studentId = c.req.query('studentId');
  const db = (c as any).var?.db;
  const issues = await listLibraryIssues(db, schoolId, { status, studentId });
  return c.json({ data: issues });
});

// POST /api/library/issues/checkout - Issue / Loan book to student
libraryRouter.post('/issues/checkout', async (c) => {
  try {
    const body = await c.req.json();
    const db = (c as any).var?.db;
    const rawDb = c.env.DB;
    const issue = await issueBook(db, rawDb, body);
    return c.json({ success: true, data: issue }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// POST /api/library/issues/return - Return book inspection & fine calculation
libraryRouter.post('/issues/return', async (c) => {
  try {
    const body = await c.req.json();
    const db = (c as any).var?.db;
    const rawDb = c.env.DB;
    const result = await returnBook(db, rawDb, body);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// POST /api/library/issues/lost - Mark lost & generate replacement cost invoice
libraryRouter.post('/issues/lost', async (c) => {
  try {
    const body = await c.req.json();
    const db = (c as any).var?.db;
    const rawDb = c.env.DB;
    const result = await markLostBook(db, rawDb, body);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});
