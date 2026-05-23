import { useEffect, useState } from 'react';

// festivals.js region ID → 광역시도 areaCd 매핑
export const REGION_AREA_CD = {
  seoul:     '11',
  busan:     '26',
  gyeongju:  '47',
  jeonju:    '52',
  jeju:      '50',
  andong:    '47',
  chuncheon: '51',
  gwangju:   '29',
  incheon:   '28',
  daejeon:   '30',
  gangneung: '51',
  tongyeong: '48',
  yeosu:     '46',
  sokcho:    '51',
  damyang:   '46',
};

export function useVisitorData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/visitors.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function formatVisitors(num) {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${Math.round(num / 10000)}만`;
  return num.toLocaleString();
}

export function getAreaData(visitorData, regionId) {
  if (!visitorData) return null;
  const code = REGION_AREA_CD[regionId];
  return visitorData.byArea[code] ?? null;
}
