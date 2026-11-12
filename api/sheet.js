/* Vercel 서버리스 함수: 구글 시트 4개 탭을 CSV로 읽어 JSON으로 돌려준다.
   다른 보고서에 재사용하려면 SHEET_ID(또는 Vercel 환경변수 SHEET_ID)와 TABS만 바꾸면 된다.
   시트는 공유 설정이 "링크가 있는 모든 사용자 · 뷰어"여야 한다. */

const SHEET_ID = process.env.SHEET_ID || '1xinncZkPT9_j4Pc3rQUu3InQCiDFfwa4gDU2VOhfs80';
const TABS = {
  main:    { name: '엑셀공작소 월간보고서',      range: 'A1:W140' },
  record:  { name: '데이터 기록(직접작성)',      range: 'A1:R14'  },
  insight: { name: '인사이트/액션플랜(직접작성)', range: 'A1:F200' },
  ads:     { name: '광고관리',                  range: 'A1:X400' },
};

const csvUrl = tab =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0` +
  `&sheet=${encodeURIComponent(tab.name)}&range=${tab.range}`;

async function fetchCsv(tab) {
  const res = await fetch(csvUrl(tab), { redirect: 'follow' });
  const type = res.headers.get('content-type') || '';
  // 비공개 시트는 200으로 로그인 페이지(HTML)를 돌려주므로 content-type까지 확인한다.
  if (!res.ok || !type.includes('csv')) {
    throw new Error(`'${tab.name}' 탭을 읽지 못했습니다 (HTTP ${res.status}). 시트 공유 설정과 탭 이름을 확인하세요.`);
  }
  return res.text();
}

export default async function handler(req, res) {
  try {
    const keys = Object.keys(TABS);
    const csvs = await Promise.all(keys.map(k => fetchCsv(TABS[k])));
    const tabs = Object.fromEntries(keys.map((k, i) => [k, { name: TABS[k].name, csv: csvs[i] }]));
    // 평소엔 CDN에서 5분 캐시, '새로고침' 버튼(?fresh=1)은 캐시 없이 바로 조회
    res.setHeader('Cache-Control', req.query && req.query.fresh
      ? 'no-store'
      : 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ sheetId: SHEET_ID, fetchedAt: new Date().toISOString(), tabs });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: e.message });
  }
}
