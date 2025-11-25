const API = 'http://localhost:5000';

async function req(path, opts={}){
  const res = await fetch(API+path, opts);
  const text = await res.text();
  let body = null;
  try{ body = text ? JSON.parse(text) : null }catch(e){ body = text }
  return { status: res.status, body };
}

async function register(email, password, role='alumno', firstName='Test', lastName='User'){
  return await req('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password, role, firstName, lastName }) });
}

async function login(email, password){
  return await req('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
}

async function createCourse(token, title='Prueba 101', description='Curso de prueba'){
  return await req('/api/courses', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ title, description }) });
}

async function enroll(token, courseId){
  return await req('/api/enrollments', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ courseId }) });
}

async function getMyEnrollments(token){
  return await req('/api/enrollments/me', { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
}

async function updateGrades(token, enrollmentId, grades){
  return await req(`/api/enrollments/${enrollmentId}/grades`, { method: 'PUT', headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ grades }) });
}

async function unenroll(token, enrollmentId){
  return await req(`/api/enrollments/${enrollmentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
}

async function main(){
  console.log('Starting enrollment integration test...');

  // Admin
  await register('admin2@test.local','Pass1234','admin','Admin','Dos');
  const loginAdmin = await login('admin2@test.local','Pass1234');
  if(loginAdmin.status !== 200){ console.error('Admin login failed', loginAdmin); return }
  const adminToken = loginAdmin.body.token;
  console.log('Admin token obtained');

  // Create course
  const courseRes = await createCourse(adminToken,'Curso Integracion','Descripcion prueba');
  if(courseRes.status !== 201){ console.error('Course create failed', courseRes); return }
  const courseId = courseRes.body._id || courseRes.body.id || courseRes.body._doc?._id;
  console.log('Course created:', courseId);

  // Student
  await register('student1@test.local','Pass1234','alumno','Stud','Uno');
  const loginStudent = await login('student1@test.local','Pass1234');
  if(loginStudent.status !== 200){ console.error('Student login failed', loginStudent); return }
  const studentToken = loginStudent.body.token;
  console.log('Student token obtained');

  // Enroll student
  const enrollRes = await enroll(studentToken, courseId);
  console.log('Enroll response:', enrollRes.status, enrollRes.body);
  if(enrollRes.status !== 201){ console.error('Enroll failed'); return }
  const enrollmentId = enrollRes.body._id;

  // Get my enrollments
  const myEnrolls = await getMyEnrollments(studentToken);
  console.log('My enrollments:', myEnrolls.status, JSON.stringify(myEnrolls.body, null, 2));

  // Update grades by admin (should be allowed but only if admin permitted)
  const gradesRes = await updateGrades(adminToken, enrollmentId, [{ name: 'Parcial 1', value: 90 }]);
  console.log('Update grades response:', gradesRes.status, gradesRes.body);

  // Unenroll
  const delRes = await unenroll(studentToken, enrollmentId);
  console.log('Unenroll response:', delRes.status, delRes.body);

  console.log('Integration test complete.');
}

main().catch(e=>{ console.error('Test script error', e); process.exit(1) });
