# 엑셀공작소 월간 보고서 (Vercel)

구글 시트를 실시간으로 읽어 보여 주는 월간 보고서 대시보드입니다. 빌드 과정이 없는 정적 페이지 + 서버리스 함수 1개 구성입니다.

```
public/index.html    보고서 화면 (Chart.js는 CDN에서 로드)
public/snapshot.js   실시간 조회 실패 시 쓰는 예비 데이터 (2026-11-02 내보내기)
api/sheet.js         구글 시트 4개 탭을 읽어 JSON으로 돌려주는 서버리스 함수
vercel.json          검색엔진 수집 차단 헤더 등
```

## 배포

**방법 1 — GitHub 연결**
1. 이 폴더를 GitHub 저장소에 올립니다.
2. vercel.com → Add New → Project → 저장소 선택 → Framework Preset은 **Other**, 나머지는 기본값으로 Deploy.

**방법 2 — CLI**
```
npm i -g vercel
vercel          # 미리보기 배포
vercel --prod   # 운영 배포
```

## 배포 전 확인

- 구글 시트 공유 → 일반 액세스가 **"링크가 있는 모든 사용자 · 뷰어"** 여야 실시간 조회가 됩니다. 아니면 화면 상단에 안내가 뜨고 `snapshot.js` 저장본이 표시됩니다.
- Vercel 주소는 링크를 아는 누구나 열 수 있습니다. 매출 수치가 담겨 있으니, 사내 전용으로 쓰려면 Vercel의 Deployment Protection(비밀번호/로그인 보호)을 켜세요.
- `public/snapshot.js`에도 10월 실적이 들어 있습니다. 예비 데이터가 필요 없으면 파일을 지워도 됩니다.

## 설정 바꾸기

- 다른 시트에 연결: Vercel 프로젝트 환경변수 `SHEET_ID`를 지정하거나 `api/sheet.js`의 `SHEET_ID`를 수정합니다.
- 탭 이름·범위: `api/sheet.js`의 `TABS`.
- 캐시: 기본 5분(`s-maxage=300`). 화면의 **↻ 새로고침** 버튼은 캐시 없이 바로 다시 읽습니다.
- 특정 월 바로 열기: 주소 끝에 `#2026-10`처럼 붙입니다.
