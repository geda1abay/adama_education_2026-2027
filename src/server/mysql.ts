import { Pool, type QueryResultRow } from 'pg';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import type {
  AdminProfile,
  Appearance,
  Attendance,
  ExamResult,
  SchoolInfo,
  Student,
  StudentFee,
  Teacher,
} from '@/lib/data';

const scryptAsync = promisify(crypto.scrypt);

type UserRole = 'admin' | 'student' | 'teacher';

type SessionUser = {
  uid: string;
  email: string;
  role: UserRole;
  linkedId: string | null;
  name: string;
};

type StudentInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  contactEmail: string;
  contactPhone: string;
  parentPhone?: string;
  enrollmentDate?: string;
  gradeLevel: string;
  parentIds?: string[];
  password?: string;
};

type TeacherInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  contactEmail: string;
  contactPhone: string;
  hireDate?: string;
  department: string;
  qualification?: string;
  classes?: string[] | string;
  password?: string;
};

type AttendanceInput = {
  studentName: string;
  recordedByTeacherName?: string;
  subjectName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  createdAt?: string;
};

type ExamResultInput = {
  studentName: string;
  subjectName: string;
  score: number;
  maxScore: number;
  resultDate?: string;
  gradedByTeacherName?: string;
};

type FeeInput = {
  studentName: string;
  amount: number;
  feeDate?: string;
  academicYear: string;
  status: 'paid' | 'due' | 'overdue';
};

export type AppSnapshot = {
  students: Student[];
  teachers: Teacher[];
  studentAttendance: Attendance[];
  recentExamResults: ExamResult[];
  feesData: StudentFee[];
  adminProfile: (AdminProfile & { id: string }) | null;
  schoolInfo: (SchoolInfo & { id: string }) | null;
  appearance: (Appearance & { id: string }) | null;
};

let poolInstance: Pool | null = null;

function getDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL;
  const useSsl = connectionString?.includes('sslmode=require') || process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production';

  if (connectionString) {
    return {
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.POSTGRES_HOST || process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 5432),
    user: process.env.POSTGRES_USER || process.env.PGUSER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || '',
    database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE || 'school_dashboard',
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };
}

async function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      ...getDatabaseConfig(),
      max: 10,
    });
  }

  return poolInstance;
}

async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const pool = await getPool();
  return pool.query<T>(text, params);
}

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, hash: string) {
  const [salt, storedKey] = hash.split(':');
  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(storedKey, 'hex'), derivedKey);
}

function parseArray(value: unknown) {
  if (!value) {
    return [] as string[];
  }

  if (Array.isArray(value)) {
    return value.map(String);
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toIsoString(value: unknown) {
  if (!value) {
    return new Date().toISOString();
  }

  return new Date(value as string | number | Date).toISOString();
}

function toDbTimestamp(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeClasses(classes?: string[] | string) {
  if (Array.isArray(classes)) {
    return classes.map((value) => value.trim()).filter(Boolean);
  }

  if (typeof classes === 'string') {
    return classes
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [] as string[];
}

async function hasTable(tableName: string) {
  const { rows } = await query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists
    `,
    [tableName]
  );
  return Boolean(rows[0]?.exists);
}

async function hasColumn(tableName: string, columnName: string) {
  const { rows } = await query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      ) AS exists
    `,
    [tableName, columnName]
  );
  return Boolean(rows[0]?.exists);
}

async function getNextSequentialId(tableName: 'students' | 'teachers') {
  const { rows } = await query<{ next_id: number }>(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ${tableName}`);
  return String(rows[0]?.next_id || 1);
}

export async function bootstrapDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id SMALLINT PRIMARY KEY,
      admin_name VARCHAR(100) NOT NULL,
      admin_email VARCHAR(255) NOT NULL,
      school_name VARCHAR(255) NOT NULL,
      school_address VARCHAR(255) NOT NULL,
      school_contact VARCHAR(100) NOT NULL,
      theme VARCHAR(50) NOT NULL,
      dark_mode BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'teacher')),
      linked_id VARCHAR(36),
      display_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS students (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth TIMESTAMPTZ NOT NULL,
      gender VARCHAR(50) NOT NULL,
      address VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255) NOT NULL UNIQUE,
      contact_phone VARCHAR(50) NOT NULL,
      parent_phone VARCHAR(50) NOT NULL DEFAULT 'Not Specified',
      enrollment_date TIMESTAMPTZ NOT NULL,
      grade_level VARCHAR(100) NOT NULL,
      parent_ids JSONB
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      gender VARCHAR(50) NOT NULL DEFAULT 'Not Specified',
      contact_email VARCHAR(255) NOT NULL UNIQUE,
      contact_phone VARCHAR(50) NOT NULL,
      address VARCHAR(255) NOT NULL DEFAULT 'Not Specified',
      hire_date TIMESTAMPTZ NOT NULL,
      department VARCHAR(100) NOT NULL,
      qualification VARCHAR(255) NOT NULL,
      classes JSONB
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS student_fees (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      student_name VARCHAR(255) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      fee_date TIMESTAMPTZ NOT NULL,
      academic_year VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'due', 'overdue')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      student_name VARCHAR(255) NOT NULL,
      recorded_by_teacher_name VARCHAR(255) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      student_name VARCHAR(255) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      score NUMERIC(10, 2) NOT NULL,
      max_score NUMERIC(10, 2) NOT NULL,
      result_date TIMESTAMPTZ NOT NULL,
      graded_by_teacher_name VARCHAR(255) NOT NULL
    )
  `);

  await query(
    `
      INSERT INTO app_settings (id, admin_name, admin_email, school_name, school_address, school_contact, theme, dark_mode)
      VALUES (1, $1, $2, 'Adama City Education Bureau', 'Adama, Ethiopia', '+251 912 345 678', '259 71% 50%', false)
      ON CONFLICT (id) DO NOTHING
    `,
    [process.env.ADMIN_NAME || 'Geda Abay', process.env.ADMIN_EMAIL || 'gedaabay@gmail.com']
  );

  const { rows: adminRows } = await query<{ id: string }>(`SELECT id FROM user_accounts WHERE role = 'admin' LIMIT 1`);

  if (!adminRows.length) {
    await query(
      `
        INSERT INTO user_accounts (id, email, password_hash, role, linked_id, display_name)
        VALUES ($1, $2, $3, 'admin', NULL, $4)
      `,
      [
        crypto.randomUUID(),
        process.env.ADMIN_EMAIL || 'gedaabay@gmail.com',
        await hashPassword(process.env.ADMIN_PASSWORD || '15183510'),
        process.env.ADMIN_NAME || 'Geda Abay',
      ]
    );
  }
}

export async function getSnapshot(): Promise<AppSnapshot> {
  await bootstrapDatabase();

  const [{ rows: studentsRows }, { rows: teachersRows }, { rows: feesRows }, { rows: attendanceRows }, { rows: examRows }, { rows: settingsRows }] =
    await Promise.all([
      query<any>(`SELECT * FROM students ORDER BY enrollment_date DESC`),
      query<any>(`SELECT * FROM teachers ORDER BY hire_date DESC`),
      query<any>(`SELECT * FROM student_fees ORDER BY created_at DESC`),
      query<any>(`SELECT * FROM attendance ORDER BY created_at DESC`),
      query<any>(`SELECT * FROM exam_results ORDER BY result_date DESC`),
      query<any>(`SELECT * FROM app_settings WHERE id = 1 LIMIT 1`),
    ]);

  const settings = settingsRows[0];

  return {
    students: studentsRows.map((row) => ({
      id: String(row.id),
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: toIsoString(row.date_of_birth),
      gender: row.gender,
      address: row.address,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      parentPhone: row.parent_phone,
      enrollmentDate: toIsoString(row.enrollment_date),
      gradeLevel: row.grade_level,
      parentIds: parseArray(row.parent_ids),
    })),
    teachers: teachersRows.map((row) => ({
      id: String(row.id),
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: toIsoString(row.date_of_birth),
      gender: row.gender,
      address: row.address,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      hireDate: toIsoString(row.hire_date),
      department: row.department,
      qualification: row.qualification,
      classes: parseArray(row.classes),
    })),
    studentAttendance: attendanceRows.map((row) => ({
      id: String(row.id),
      studentName: row.student_name,
      recordedByTeacherName: row.recorded_by_teacher_name,
      subjectName: row.subject_name,
      status: row.status,
      createdAt: toIsoString(row.created_at),
    })),
    recentExamResults: examRows.map((row) => ({
      id: String(row.id),
      studentName: row.student_name,
      subjectName: row.subject_name,
      score: Number(row.score),
      maxScore: Number(row.max_score),
      resultDate: toIsoString(row.result_date),
      gradedByTeacherName: row.graded_by_teacher_name,
    })),
    feesData: feesRows.map((row) => ({
      id: String(row.id),
      studentName: row.student_name,
      amount: Number(row.amount),
      feeDate: toIsoString(row.fee_date),
      academicYear: row.academic_year,
      status: row.status,
    })),
    adminProfile: settings ? { id: 'admin-profile', name: settings.admin_name, email: settings.admin_email } : null,
    schoolInfo: settings
      ? {
          id: 'school-info',
          name: settings.school_name,
          address: settings.school_address,
          contact: settings.school_contact,
        }
      : null,
    appearance: settings
      ? {
          id: 'appearance',
          theme: settings.theme,
          darkMode: Boolean(settings.dark_mode),
        }
      : null,
  };
}

export async function loginUser(email: string, password: string, role: UserRole): Promise<SessionUser | null> {
  await bootstrapDatabase();

  const { rows } = await query<{
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    linked_id: string | null;
    display_name: string;
  }>(
    `SELECT id, email, password_hash, role, linked_id, display_name FROM user_accounts WHERE email = $1 AND role = $2 LIMIT 1`,
    [email, role]
  );

  const user = rows[0];
  if (!user) {
    return null;
  }

  const matches = await verifyPassword(password, user.password_hash);
  if (!matches) {
    return null;
  }

  return {
    uid: user.id,
    email: user.email,
    role: user.role,
    linkedId: user.linked_id,
    name: user.display_name,
  };
}

export async function addStudentRecord(data: StudentInput) {
  await bootstrapDatabase();

  const studentId = await getNextSequentialId('students');
  await query(
    `
      INSERT INTO students (
        id, first_name, last_name, date_of_birth, gender, address, contact_email,
        contact_phone, parent_phone, enrollment_date, grade_level, parent_ids
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
    `,
    [
      Number(studentId),
      data.firstName,
      data.lastName,
      toDbTimestamp(data.dateOfBirth),
      data.gender || 'Not Specified',
      data.address || 'Not Specified',
      data.contactEmail,
      data.contactPhone,
      data.parentPhone || 'Not Specified',
      toDbTimestamp(data.enrollmentDate),
      data.gradeLevel,
      JSON.stringify(data.parentIds || []),
    ]
  );

  await query(
    `
      INSERT INTO user_accounts (id, email, password_hash, role, linked_id, display_name)
      VALUES ($1, $2, $3, 'student', $4, $5)
    `,
    [
      crypto.randomUUID(),
      data.contactEmail,
      await hashPassword(data.password || '123456'),
      studentId,
      `${data.firstName} ${data.lastName}`,
    ]
  );
}

export async function importStudentsRecords(rows: StudentInput[]) {
  for (const row of rows) {
    await addStudentRecord(row);
  }
}

export async function clearStudentsByClassRecord(gradeLevel: string) {
  await bootstrapDatabase();

  const { rows } = await query<{ id: number }>(`SELECT id FROM students WHERE grade_level = $1`, [gradeLevel]);
  const studentIds = rows.map((row) => String(row.id));

  if (studentIds.length) {
    await query(`DELETE FROM user_accounts WHERE role = 'student' AND linked_id = ANY($1::text[])`, [studentIds]);
  }

  await query(`DELETE FROM students WHERE grade_level = $1`, [gradeLevel]);
}

export async function deleteStudentRecord(studentId: string) {
  await bootstrapDatabase();
  await query(`DELETE FROM user_accounts WHERE role = 'student' AND linked_id = $1`, [studentId]);
  await query(`DELETE FROM students WHERE id = $1`, [Number(studentId)]);
}

export async function addTeacherRecord(data: TeacherInput) {
  await bootstrapDatabase();

  const normalizedClasses = normalizeClasses(data.classes);

  const teacherId = await getNextSequentialId('teachers');
  await query(
    `
      INSERT INTO teachers (
        id, first_name, last_name, date_of_birth, gender, contact_email,
        contact_phone, address, hire_date, department, qualification, classes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
    `,
    [
      Number(teacherId),
      data.firstName,
      data.lastName,
      toDbTimestamp(data.dateOfBirth),
      data.gender || 'Not Specified',
      data.contactEmail,
      data.contactPhone,
      data.address || 'Not Specified',
      toDbTimestamp(data.hireDate),
      data.department,
      data.qualification || data.department || 'Not Specified',
      JSON.stringify(normalizedClasses),
    ]
  );

  await query(
    `
      INSERT INTO user_accounts (id, email, password_hash, role, linked_id, display_name)
      VALUES ($1, $2, $3, 'teacher', $4, $5)
    `,
    [
      crypto.randomUUID(),
      data.contactEmail,
      await hashPassword(data.password || '123456'),
      teacherId,
      `${data.firstName} ${data.lastName}`,
    ]
  );
}

export async function importTeachersRecords(rows: TeacherInput[]) {
  for (const row of rows) {
    await addTeacherRecord(row);
  }
}

export async function deleteTeacherRecord(teacherId: string) {
  await bootstrapDatabase();
  await query(`DELETE FROM user_accounts WHERE role = 'teacher' AND linked_id = $1`, [teacherId]);
  await query(`DELETE FROM teachers WHERE id = $1`, [Number(teacherId)]);
}

export async function resetStudentPasswordRecord(studentId: string, password: string) {
  await bootstrapDatabase();
  await query(`UPDATE user_accounts SET password_hash = $1 WHERE linked_id = $2 AND role = 'student'`, [
    await hashPassword(password),
    studentId,
  ]);
}

export async function resetTeacherPasswordRecord(teacherId: string, password: string) {
  await bootstrapDatabase();
  await query(`UPDATE user_accounts SET password_hash = $1 WHERE linked_id = $2 AND role = 'teacher'`, [
    await hashPassword(password),
    teacherId,
  ]);
}

export async function addAttendanceRecord(payload: AttendanceInput, actorId?: string) {
  await bootstrapDatabase();

  let recordedByTeacherName = payload.recordedByTeacherName || 'Admin';

  if (actorId && actorId !== 'admin-user') {
    const { rows } = await query<{ display_name: string }>(`SELECT display_name FROM user_accounts WHERE id = $1 LIMIT 1`, [actorId]);
    recordedByTeacherName = rows[0]?.display_name || recordedByTeacherName;
  }

  await query(
    `
      INSERT INTO attendance (student_name, recorded_by_teacher_name, subject_name, status, created_at)
      VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, CURRENT_TIMESTAMP))
    `,
    [payload.studentName, recordedByTeacherName, payload.subjectName, payload.status, payload.createdAt || null]
  );
}

export async function addExamResultRecord(payload: ExamResultInput, actorId?: string) {
  await bootstrapDatabase();

  let gradedByTeacherName = payload.gradedByTeacherName || 'Admin';

  if (actorId && actorId !== 'admin-user') {
    const { rows } = await query<{ display_name: string }>(`SELECT display_name FROM user_accounts WHERE id = $1 LIMIT 1`, [actorId]);
    gradedByTeacherName = rows[0]?.display_name || gradedByTeacherName;
  }

  await query(
    `
      INSERT INTO exam_results (student_name, subject_name, score, max_score, result_date, graded_by_teacher_name)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      payload.studentName,
      payload.subjectName,
      payload.score,
      payload.maxScore,
      toDbTimestamp(payload.resultDate),
      gradedByTeacherName,
    ]
  );
}

export async function updateAttendanceRecord(id: string, payload: Partial<AttendanceInput>) {
  await bootstrapDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (payload.status) {
    sets.push(`status = $${i++}`);
    vals.push(payload.status);
  }
  if (payload.subjectName) {
    sets.push(`subject_name = $${i++}`);
    vals.push(payload.subjectName);
  }

  if (sets.length === 0) return;

  vals.push(Number(id));
  await query(`UPDATE attendance SET ${sets.join(', ')} WHERE id = $${i}`, vals);
}

export async function deleteAttendanceRecord(id: string) {
  await bootstrapDatabase();
  await query(`DELETE FROM attendance WHERE id = $1`, [Number(id)]);
}

export async function updateExamResultRecord(id: string, payload: Partial<ExamResultInput>) {
  await bootstrapDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (payload.score !== undefined) {
    sets.push(`score = $${i++}`);
    vals.push(payload.score);
  }
  if (payload.maxScore !== undefined) {
    sets.push(`max_score = $${i++}`);
    vals.push(payload.maxScore);
  }
  if (payload.subjectName) {
    sets.push(`subject_name = $${i++}`);
    vals.push(payload.subjectName);
  }

  if (sets.length === 0) return;

  vals.push(Number(id));
  await query(`UPDATE exam_results SET ${sets.join(', ')} WHERE id = $${i}`, vals);
}

export async function deleteExamResultRecord(id: string) {
  await bootstrapDatabase();
  await query(`DELETE FROM exam_results WHERE id = $1`, [Number(id)]);
}

export async function addFeeRecord(payload: FeeInput) {
  await bootstrapDatabase();

  await query(
    `
      INSERT INTO student_fees (student_name, amount, fee_date, academic_year, status)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [payload.studentName, payload.amount, toDbTimestamp(payload.feeDate), payload.academicYear, payload.status]
  );
}

export async function updateAdminProfileRecord(data: Partial<AdminProfile>) {
  await bootstrapDatabase();

  const { rows } = await query<{ admin_name: string; admin_email: string }>(
    `SELECT admin_name, admin_email FROM app_settings WHERE id = 1 LIMIT 1`
  );
  const current = rows[0];
  if (!current) {
    return;
  }

  await query(`UPDATE app_settings SET admin_name = $1, admin_email = $2 WHERE id = 1`, [
    data.name || current.admin_name,
    data.email || current.admin_email,
  ]);

  await query(`UPDATE user_accounts SET display_name = $1, email = $2 WHERE role = 'admin'`, [
    data.name || current.admin_name,
    data.email || current.admin_email,
  ]);
}

export async function updateSchoolInfoRecord(data: Partial<SchoolInfo>) {
  await bootstrapDatabase();

  const { rows } = await query<{ school_name: string; school_address: string; school_contact: string }>(
    `SELECT school_name, school_address, school_contact FROM app_settings WHERE id = 1 LIMIT 1`
  );
  const current = rows[0];
  if (!current) {
    return;
  }

  await query(`UPDATE app_settings SET school_name = $1, school_address = $2, school_contact = $3 WHERE id = 1`, [
    data.name || current.school_name,
    data.address || current.school_address,
    data.contact || current.school_contact,
  ]);
}

export async function updateAppearanceRecord(data: Partial<Appearance>) {
  await bootstrapDatabase();

  const { rows } = await query<{ theme: string; dark_mode: boolean }>(
    `SELECT theme, dark_mode FROM app_settings WHERE id = 1 LIMIT 1`
  );
  const current = rows[0];
  if (!current) {
    return;
  }

  await query(`UPDATE app_settings SET theme = $1, dark_mode = $2 WHERE id = 1`, [
    data.theme || current.theme,
    typeof data.darkMode === 'boolean' ? data.darkMode : current.dark_mode,
  ]);
}

export async function closeDatabasePool() {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

void hasTable;
void hasColumn;
