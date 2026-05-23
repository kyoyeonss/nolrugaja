#!/usr/bin/env node
// 한국관광공사 방문자 통계 API → public/data/visitors.json

const KEY = process.env.TOUR_API_KEY;
const BASE = 'https://apis.data.go.kr/B551011/DataLabService';

if (!KEY) {
  console.error('TOUR_API_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

function formatDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function getDateRange(daysAgo) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // 어제까지 (오늘 데이터는 없음)
  const start = new Date(end);
  start.setDate(start.getDate() - daysAgo);
  return { start: formatDate(start), end: formatDate(end) };
}

async function fetchAll(startYmd, endYmd) {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${BASE}/metcoRegnVisitrDDList?serviceKey=${KEY}&MobileOS=ETC&MobileApp=nolrugaja&startYmd=${startYmd}&endYmd=${endYmd}&numOfRows=1000&pageNo=${page}&_type=json`;
    const res = await fetch(url);
    const data = await res.json();
    const body = data.response.body;
    const chunk = Array.isArray(body.items?.item)
      ? body.items.item
      : body.items?.item
        ? [body.items.item]
        : [];
    items.push(...chunk);
    if (items.length >= body.totalCount) break;
    page++;
  }
  return items;
}

async function main() {
  const { start, end } = getDateRange(30);
  console.log(`📡 ${start} ~ ${end} 데이터 수집 중...`);

  const items = await fetchAll(start, end);
  console.log(`✅ ${items.length}개 레코드 수신`);

  // 지역별 집계
  const byArea = {};
  const trendMap = {}; // areaCode → { date → total }

  for (const it of items) {
    const { areaCode, areaNm, touDivCd, touNum, baseYmd } = it;
    const num = parseFloat(touNum) || 0;

    if (!byArea[areaCode]) {
      byArea[areaCode] = { name: areaNm, total: 0, local: 0, nonlocal: 0, foreign: 0 };
      trendMap[areaCode] = {};
    }

    byArea[areaCode].total += num;
    if (touDivCd === '1') byArea[areaCode].local += num;
    if (touDivCd === '2') byArea[areaCode].nonlocal += num;
    if (touDivCd === '3') byArea[areaCode].foreign += num;

    if (!trendMap[areaCode][baseYmd]) trendMap[areaCode][baseYmd] = 0;
    trendMap[areaCode][baseYmd] += num;
  }

  // 트렌드 배열 정렬
  for (const code of Object.keys(byArea)) {
    byArea[code].trend = Object.entries(trendMap[code])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total: Math.round(total) }));

    // 숫자 반올림
    byArea[code].total = Math.round(byArea[code].total);
    byArea[code].local = Math.round(byArea[code].local);
    byArea[code].nonlocal = Math.round(byArea[code].nonlocal);
    byArea[code].foreign = Math.round(byArea[code].foreign);
  }

  const result = {
    updatedAt: formatDate(new Date()),
    period: { start, end },
    byArea,
  };

  const { writeFileSync, mkdirSync } = await import('fs');
  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/visitors.json', JSON.stringify(result, null, 2));
  console.log(`💾 public/data/visitors.json 저장 완료 (${Object.keys(byArea).length}개 지역)`);
}

main().catch(err => { console.error(err); process.exit(1); });
