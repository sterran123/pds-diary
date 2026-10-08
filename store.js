// 저장소 어댑터 — kvdb.io (가입 없는 호스팅 KV 저장소)
// 버킷 URL 자체가 접근 식별자다. 과제 계약상 로그인이 없는 공개 앱이므로
// 링크를 아는 사람이 읽고 쓸 수 있다. 잠금은 7번 과제에서 다룬다.
const BUCKET_URL = 'https://kvdb.io/Y4iYs5RBcvWiMi4FjsA1EX';
const DOC_KEY = 'pds-diary-v1';
const DOC_URL = `${BUCKET_URL}/${encodeURIComponent(DOC_KEY)}`;

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
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`읽기 실패 (${res.status})`);
  return res.json();
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
