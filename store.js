// 저장소 어댑터 — Firebase Realtime Database (프로젝트 pds-diary-sterran)
// 규칙: {".read":true,".write":true} — 로그인 없는 공개 앱 계약에 맞춰
// 링크를 아는 사람은 누구나 읽고 쓸 수 있다. 잠금은 7번 과제에서 다룬다.
const DOC_URL = 'https://pds-diary-sterran-default-rtdb.firebaseio.com/pds-diary-v1.json';

export function emptyDoc() {
  return {
    schema_version: 'pds-diary-v1',
    meta: { seeded: false, updated_at: null },
    plans: [],
    plan_revisions: [],
    tasks: [],
    executions: [],
    completions: [],
    improvements: []
  };
}

export async function loadDoc() {
  const res = await fetch(DOC_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`읽기 실패 (${res.status})`);
  const data = await res.json();
  return data ?? null; // RTDB는 없는 경로를 200 + null로 돌려준다
}

export async function saveDoc(doc) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(DOC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (res.ok) return;
    if (attempt === 0) { await new Promise(r => setTimeout(r, 400)); continue; }
    throw new Error(`저장 실패 (${res.status})`);
  }
}

// 모든 쓰기를 직렬화한다. 최신 문서를 읽고 → 변형 → 통째로 저장한다.
let queue = Promise.resolve();
export function transact(fn) {
  const job = queue.then(async () => {
    const doc = (await loadDoc()) || emptyDoc();
    const result = await fn(doc);
    doc.meta.updated_at = new Date().toISOString();
    await saveDoc(doc);
    return { doc, result };
  });
  queue = job.catch(() => {});
  return job;
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
