# 플랜두씨 다이어리 1 — 내 계획과 실제를 담는 앱

계획(Plan) → 실제로 한 일(Do) → 돌아보기(See)가 하나로 이어지는 다이어리입니다.
로그인이 없습니다 — 링크를 아는 사람은 누구나 읽고 쓸 수 있습니다.

- 공개 결과물: https://sterran123.github.io/pds-diary/
- 소스 저장소: https://github.com/sterran123/pds-diary

## 구조

- `index.html` · `styles.css` · `app.js` — 순수 HTML/CSS/JavaScript(ES 모듈). 빌드 없음.
- `store.js` — 서버 저장소 어댑터. kvdb.io 호스팅 KV 저장소의 단일 문서(`pds-diary-v1` 키)를
  읽고(read) → 바꾸고(modify) → 통째로 덮어씁니다(PUT). 모든 변경은 이 경로로 직렬화됩니다.
- `contracts/pds-schema-v2.json` — 최종 데이터베이스 계약: 6개 컬렉션의 필드·관계·날짜 규칙·집계 규칙.
- `.github/workflows/pages.yml` — GitHub Pages 배포(Actions 빌드 방식).

## 서버 저장소

- 엔진: kvdb.io(호스팅 키-값 저장소). 버킷 `Y4iYs5RBcvWiMi4FjsA1EX`, 키 `pds-diary-v1`.
- 버킷 ID는 접근 식별자이며 비밀키가 아닙니다. 링크를 아는 사람의 읽기·쓰기는 과제 계약입니다.
- 코드·배포 파일·Git 기록 어디에도 비밀값 원문이 없습니다.

## 동작 규칙 핵심

- 계획을 고치면 `plan_revisions`에 새 행이 쌓이고 rev 0(처음 계획)은 절대 덮어쓰지 않습니다.
- 완료는 멱등키 `complete:<task_id>` 한 건만 남습니다 — 연속 클릭·중복 요청에도 기록 1건.
- 실행 기록(시작·끝·실제 시간·막힌 이유)은 계획 값과 별개 컬렉션에 쌓입니다.
- 돌아보기 집계는 화면에서 숫자를 누르면 근거 기록 목록으로 갑니다.
- 화면 표시는 `textContent`만 사용 — 스크립트 모양 글자도 글자 그대로 보입니다.
