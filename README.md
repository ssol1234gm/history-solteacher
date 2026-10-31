# history-solmi

Next.js 16 · React 19 · TypeScript · Supabase · npm 기반 메모 보드입니다.
기존 디자인, 메모 작성/조회/검색/동기화/공유/비밀번호 삭제, 관리자 개별·전체 삭제를 유지합니다.
기존 앱에는 게시글 수정, 회원 관리, 첨부파일·Storage 기능이 없습니다.

## 직접 설정하는 순서

1. Supabase 프로젝트를 만듭니다.
2. 새 데이터베이스에는 `schema.sql`을 SQL Editor에서 직접 실행합니다. 기존 데이터베이스는 먼저 백업하고 테이블 구조와 정책을 확인하세요. 이번 변경은 공개 SELECT 권한을 `id,title,content,created_at`으로 제한하여 `password_hash`를 숨깁니다. 기존 설치에서 이 보안 변경을 적용하려면 `schema.sql`의 `revoke all`부터 `grant ... service_role`까지 권한 구문을 검토 후 실행하세요. 전체 스키마를 무조건 다시 실행할 필요는 없습니다. SQL은 데이터를 삭제하지 않지만 같은 이름의 RLS 정책을 교체하며, `CREATE TABLE IF NOT EXISTS`는 기존 테이블의 다른 구조를 자동 변경하지 않습니다.
3. Supabase 설정에서 프로젝트 URL과 **Legacy anon / service_role** 키를 확인합니다. Publishable Key로 교체하지 않습니다.
4. 루트의 `.env.local`에 다음 값을 직접 입력합니다. 이 파일은 준비되어 있으며 Git에서 제외됩니다. `.env.local.example`은 원본 그대로 보존했습니다. 예시 파일의 비밀번호를 운영에 사용하지 마세요.

| 변수 | 입력 값 | 사용 위치 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 프로젝트 URL | 브라우저·서버 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy anon 키 | 브라우저·서버 |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy service_role 키 | 서버 전용 |
| `ADMIN_PASSWORD` | 직접 정한 관리자 비밀번호(평문 환경변수) | 서버 전용 |
| `ADMIN_SESSION_SECRET` | 직접 생성한 충분히 긴 무작위 문자열 | 서버 전용 |

5. 의존성이 없는 새 환경에서는 `npm ci`를 실행합니다. `npm run dev`로 시작하고 http://localhost:3000 에 접속합니다. 환경변수를 바꾼 뒤에는 서버를 완전히 종료하고 다시 시작하세요. 값이 없으면 화면은 열리지만 메모 연결과 관리자 로그인은 사용할 수 없습니다.
6. 메모 작성·조회·검색·삭제(오답/정답), 관리자 로그인·로그아웃·강제 삭제·전체 삭제를 직접 확인합니다. 전체 삭제는 테스트 데이터만 있는 보드에서 확인하세요. 수정 기능은 기존 앱에 없습니다.
7. GitHub 저장소를 직접 만들거나 기존 저장소에 소스를 업로드합니다. `.env.local`, `.next`, `node_modules`는 올리지 마세요. 기존 Git 원격과 이력은 변경하지 않았습니다.
8. Vercel에서 해당 저장소를 연결하고 Framework Preset은 Next.js, 루트는 이 프로젝트 폴더로 지정합니다. 기본 빌드 명령은 `npm run build`이며 별도 `vercel.json`은 필요하지 않습니다.
9. Vercel Environment Variables에 위 다섯 변수를 별도로 등록합니다. 로컬 `.env.local`은 Vercel로 전달되지 않습니다. 서버 전용 세 변수에 `NEXT_PUBLIC_`를 붙이지 마세요. 배포 대상 환경에 값을 등록하고 배포·재배포합니다. 공개 변수는 빌드 시 반영됩니다.
10. 배포된 HTTPS 주소에서 메모와 관리자 기능을 다시 확인합니다.

## 보안과 검증 범위

- 브라우저는 anon 키와 RLS로 공개 메모 열만 조회합니다. 비밀번호 해시는 서버에서 bcrypt로 처리하며 서버의 service_role만 조회·삭제합니다.
- 관리자 인증은 `ADMIN_PASSWORD`와 HMAC 세션을 유지합니다. 쿠키는 HttpOnly·SameSite=Strict이며 프로덕션에서는 Secure입니다. 서버에서도 8시간 만료와 서명을 검사합니다. 이번 변경으로 기존 관리자 쿠키는 재로그인이 필요합니다.
- 로그아웃은 브라우저 쿠키를 지웁니다. 탈취된 토큰의 개별 폐기 저장소는 없으므로 긴급 전체 무효화는 세션 비밀값을 교체하고 재배포하세요.
- 기존 앱에는 로그인·삭제 시도 횟수 제한이 없습니다. 공개 운영 시 Vercel 방화벽 등에서 `/api/admin/login`, `/api/memos/delete` 요청 제한을 설정하세요. 앱 내부 메모리 제한은 여러 서버 간 공유되지 않으므로 추가하지 않았습니다.
- 실제 환경변수 값, SQL 실행, 외부 Supabase 연결, 실제 데이터 쓰기·삭제, GitHub 업로드, Vercel 배포는 자동 수행하지 않았습니다.
- 정적 검사: `npm run lint`, `npx tsc --noEmit`. 빌드: `npm run build`. 프로덕션 실행: `npm start`.

## 이번 작업의 검사 결과

| 항목 | 결과 |
| --- | --- |
| 코드 문법·ESLint | 성공 |
| TypeScript | 성공 |
| 패키지·의존성 | 성공: 설치된 의존성으로 검사·빌드 완료(신규 다운로드·보안 감사 미실행) |
| 프로덕션 빌드 | 성공: 실제 환경변수 없이 완료 |
| 개발 서버 | 성공: 기동 및 HTTP 200, 이름 표시 확인 |
| API 기본 검증 | 성공: 비인증 관리자 삭제 401, 잘못된 메모 입력 400, 설정 누락 로그인 오류 응답 |
| 관리자 세션 | 성공: 서명·변조·만료·잘못된 형식·비밀값 누락 단위 검증 |
| Supabase 실제 연결 | 미검증: 실제 값 없음, 외부 요청 미실행 |
| 게시글 작성·조회·삭제 | 미검증: 실제 DB 연동 필요. 수정 기능은 기존에 없음 |
| 실제 관리자 로그인 | 미검증: 실제 비밀번호·세션 비밀값 입력 필요 |
| GitHub 업로드 준비 | 성공: 환경변수 파일 제외 확인, 기존 원격·이력 보존. 업로드 미실행 |
| Vercel 배포 준비 | 성공: Next.js 빌드 및 설정 안내 완료. 실제 배포 미검증 |

네트워크 권한 오류는 발생하지 않았습니다. Node.js와 Git이 실행 환경 PATH에 없어 설치 경로를 사용했으며, Supabase 외부 연결 권한은 실제 키가 없어 검사하지 않았습니다.
