import { NextRequest, NextResponse } from 'next/server';
import {
  addAttendanceRecord,
  addExamResultRecord,
  addFeeRecord,
  addStudentRecord,
  addTeacherRecord,
  clearStudentsByClassRecord,
  deleteStudentRecord,
  deleteTeacherRecord,
  getSnapshot,
  importStudentsRecords,
  importTeachersRecords,
  resetStudentPasswordRecord,
  resetTeacherPasswordRecord,
  updateAdminProfileRecord,
  updateAppearanceRecord,
  updateSchoolInfoRecord,
} from '@/server/mysql';

export async function POST(request: NextRequest) {
  try {
    const { action, payload, actorId } = await request.json();

    switch (action) {
      case 'addStudent':
        await addStudentRecord(payload);
        break;
      case 'deleteStudent':
        await deleteStudentRecord(payload.studentId);
        break;
      case 'addTeacher':
        await addTeacherRecord(payload);
        break;
      case 'deleteTeacher':
        await deleteTeacherRecord(payload.teacherId);
        break;
      case 'resetStudentPassword':
        await resetStudentPasswordRecord(payload.studentId, payload.password);
        break;
      case 'resetTeacherPassword':
        await resetTeacherPasswordRecord(payload.teacherId, payload.password);
        break;
      case 'addAttendance':
        await addAttendanceRecord(payload, actorId || 'admin-user');
        break;
      case 'addExamResult':
        await addExamResultRecord(payload, actorId || 'admin-user');
        break;
      case 'addFee':
        await addFeeRecord(payload);
        break;
      case 'importStudents':
        await importStudentsRecords(payload.students || []);
        break;
      case 'importTeachers':
        await importTeachersRecords(payload.teachers || []);
        break;
      case 'clearStudentsByClass':
        await clearStudentsByClassRecord(payload.gradeLevel);
        break;
      case 'updateAdminProfile':
        await updateAdminProfileRecord(payload);
        break;
      case 'updateSchoolInfo':
        await updateSchoolInfoRecord(payload);
        break;
      case 'updateAppearance':
        await updateAppearanceRecord(payload);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }

    const snapshot = await getSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database update failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
