# ENSEN LAB

개인화 행운·행동 미션 앱. **서비스 소개 → 정보입력 → AI 오행 분석 → 소망 연계 → 개인화 행동 도출 → 미션 관리**의 흐름을 가지며, 탭은 **홈 · 미션 · 컬렉션 · 리포트 · 나**로 구성됩니다.

> 이 프로젝트는 "빌드하면 단일 index.html이 나오는 유지보수 가능한 소스"입니다. 소스는 모듈로 분리되어 있고, `npm run build`가 이를 하나의 `dist/index.html`로 묶어 드래그앤드롭(Netlify) 배포가 가능합니다.

## 개발 · 빌드

```bash
npm install
npm run build      # → dist/index.html (단일 파일, 배포용)
```

`dist/index.html`을 브라우저로 열면 바로 확인할 수 있고, Netlify에 이 파일 하나만 드롭하면 배포됩니다.

## 폴더 구조

```
index.html        빌드 템플릿 (스타일/스크립트가 주입될 자리)
build.mjs         esbuild로 src를 번들 → dist/index.html 생성
src/
  styles.css      디자인 시스템 (아이보리·골드·밝은 액센트)
  assets.js       로고 · 고양이 마스코트 ENI · 오행 글리프 · 소망 아이콘
  data.js         소망 12종 · 행동 풀(서정적 이유) · 오행/행운문구 데이터
  store.js        localStorage 어댑터(키 분리) · Supabase/관리자 설정
  util.js         공용 유틸(날짜·해시·시드 셔플·toast)
  engine.js       오행 분석 · 행운문구 · 미션 생성(AI+로컬) · 완료/회고 · 지표
  screens.js      화면 렌더(온보딩 + 5탭)
  main.js         상태 · 라우터 · 상호작용 · 시트
```

## 저장 구조 (localStorage, 키 분리)

`ensen.profile` · `ensen.settings` · `ensen.missions` · `ensen.completions` · `ensen.reflections`
서버로 전환할 때는 `src/store.js`의 `DB` 어댑터만 교체하면 됩니다.

## AI 미션 (Supabase Edge Function)

미션 생성은 `ensen-production` 프로젝트의 Edge Function **`generate-missions`**(배포됨)를 호출하고, 실패 시 개인화 로컬 엔진으로 폴백합니다(랜덤 아님 — 소망·오행·성향 반영).

**AI를 실제로 켜려면** Supabase 대시보드에서 다음 시크릿을 설정하세요.

- `ANTHROPIC_API_KEY` — Anthropic API 키 (필수)
- `ENSEN_MODEL` — 사용할 모델 (선택, 기본 `claude-3-5-haiku-latest`)

설정 전에는 로컬 개인화 추천으로 동작하며, 화면에 그 사실을 정직하게 표시합니다.

## 관리자

내 정보의 "관리자 접근" 링크 또는 상단 로고 5회 탭 → 접근 코드(`src/store.js`의 `ADMIN_CODE`, 기본 `ensen-admin`) → 로컬 진단 패널. 실제 권한·전체 지표는 정식 콘솔(`ensen_admin.html`, 서버 인증)에서 관리합니다. 프런트엔드에 관리자 이메일/권한 판단 로직을 두지 않습니다.

## 접근성

키보드 포커스 스타일, 아이콘 버튼 aria-label, 색+아이콘+텍스트 병행, 안전영역 대응, 로딩/빈/오류 상태 포함.
