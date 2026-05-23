import { useEffect, useMemo, useRef, useState } from 'react';
import { festivals, regions } from '../data/festivals';
import { useVisitorData, getAreaData, formatVisitors } from '../hooks/useVisitorData';
import './Mappage.css';

// ── 필터 옵션 ──────────────────────────────────────────────
const REGIONS     = ['전체', '서울', '경기', '강원', '충남', '경북', '경남', '전남', '부산', '제주'];
const CATEGORIES  = ['전체', '꽃·자연', '문화·전통', '액티비티', '도시·야경', '겨울·체험'];
const SEASONS     = ['전체', '봄', '여름', '가을', '겨울'];

// festivals.js region id → 필터 레이블 매핑
const REGION_IDS = {
  서울: ['seoul'],
  경기: ['incheon'],
  강원: ['chuncheon'],
  충남: ['daejeon'],
  경북: ['gyeongju', 'andong'],
  경남: [],
  전남: ['gwangju', 'jeonju'],
  부산: ['busan'],
  제주: ['jeju'],
};

// 카테고리별 대표 태그
const CATEGORY_TAGS = {
  '꽃·자연':   ['봄', '벚꽃', '자연', '사진'],
  '문화·전통': ['전통', '문화', '예술', '영화', '세계문화', '공연'],
  '액티비티':  ['액티비티', '음악', '청년', '바다', '야외'],
  '도시·야경': ['야경', '불꽃', '커플'],
  '겨울·체험': ['겨울', '체험', '음식', '과학', '가족'],
};

// 계절별 월 (날짜 문자열에서 "N월" 패턴으로 체크)
const SEASON_MONTHS = {
  봄:   ['3', '4', '5'],
  여름:  ['6', '7', '8'],
  가을:  ['9', '10'],
  겨울:  ['11', '12'],
};

const TREND = {
  상승: { label: '▲ 상승', cls: 'trend-up' },
  유지: { label: '▶ 유지', cls: 'trend-keep' },
  하락: { label: '▼ 하락', cls: 'trend-down' },
};

const KOREA_CENTER  = { lat: 36.5, lng: 127.8 };
const INITIAL_LEVEL = 13;
const OFFSETS = [[0,0],[0.18,0],[-0.18,0],[0,0.25],[0,-0.25]];

const INIT_FILTERS = { region: '전체', category: '전체', season: '전체', sortByPopularity: false };

// ── 헬퍼 ──────────────────────────────────────────────────
function matchesSeason(date, season) {
  return SEASON_MONTHS[season].some(m =>
    new RegExp(`(?<![0-9])${m}월`).test(date)
  );
}

function applyFilters(list, { region, category, season }) {
  return list.filter(f => {
    if (region !== '전체' && !(REGION_IDS[region] ?? []).includes(f.region)) return false;
    if (category !== '전체' && !f.tags.some(t => (CATEGORY_TAGS[category] ?? []).includes(t))) return false;
    if (season !== '전체' && !matchesSeason(f.date, season)) return false;
    return true;
  });
}


// ── 컴포넌트 ───────────────────────────────────────────────
function Mappage() {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const overlaysRef     = useRef({});   // id → kakao CustomOverlay
  const overlayElsRef   = useRef({});   // id → DOM element

  const [mapReady, setMapReady]               = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [cardVisible, setCardVisible]           = useState(false);
  const [filters, setFilters]                   = useState(INIT_FILTERS);
  const { data: visitorData } = useVisitorData();

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const filteredFestivals = useMemo(() => {
    const result = applyFilters(festivals, filters);
    return filters.sortByPopularity
      ? [...result].sort((a, b) => a.popularityRank - b.popularityRank)
      : result;
  }, [filters]);

  // 슬라이드 업 애니메이션
  useEffect(() => {
    if (!selectedFestival) return;
    const raf = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [selectedFestival]);

  // 카카오맵 SDK 동적 로드 + 지도 초기화
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    const initMap = () => {
      window.kakao.maps.load(() => {
        const container = mapContainerRef.current;
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(KOREA_CENTER.lat, KOREA_CENTER.lng),
          level: INITIAL_LEVEL,
        });
        mapRef.current = map;

        const regionMap = Object.fromEntries(regions.map(r => [r.id, r]));
        const regionIdx = {};

        festivals.forEach(festival => {
          const region = regionMap[festival.region];
          if (!region) return;

          if (regionIdx[festival.region] === undefined) regionIdx[festival.region] = 0;
          const idx = regionIdx[festival.region]++;
          const [latOff, lngOff] = OFFSETS[idx] ?? [0, idx * 0.2];

          const position = new window.kakao.maps.LatLng(
            region.lat + latOff,
            region.lng + lngOff,
          );

          const el = document.createElement('div');
          el.className = 'festival-badge';

          const rankEl = document.createElement('span');
          rankEl.className = 'badge-rank';
          rankEl.textContent = `#${festival.popularityRank}`;

          el.appendChild(rankEl);
          el.appendChild(document.createTextNode(festival.name));
          el.addEventListener('click', () => setSelectedFestival(festival));

          const overlay = new window.kakao.maps.CustomOverlay({ position, content: el, yAnchor: 1, map });

          overlaysRef.current[festival.id]    = overlay;
          overlayElsRef.current[festival.id]  = el;
        });

        setMapReady(true);
      });
    };

    if (window.kakao?.maps) { initMap(); return; }

    // 이미 로딩 중인 스크립트가 있으면 onload만 추가
    const existing = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existing) {
      existing.addEventListener('load', initMap);
      return;
    }

    const script = document.createElement('script');
    script.src   = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => console.error('카카오맵 SDK 로드 실패. API 키와 등록 도메인을 확인하세요.');
    document.head.appendChild(script);
  }, []);

  // 필터 변경 → 오버레이 실시간 업데이트
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const filteredIds = new Set(filteredFestivals.map(f => f.id));

    // 가시성 토글
    Object.entries(overlaysRef.current).forEach(([id, overlay]) => {
      overlay.setMap(filteredIds.has(Number(id)) ? map : null);
    });

    // 인기순 top3 뱃지 강조 초기화 후 재적용
    Object.values(overlayElsRef.current).forEach(el => {
      el.classList.remove('badge-top1', 'badge-top2', 'badge-top3');
    });
    if (filters.sortByPopularity) {
      filteredFestivals.slice(0, 3).forEach((f, i) => {
        overlayElsRef.current[f.id]?.classList.add(`badge-top${i + 1}`);
      });
    }
  }, [filteredFestivals, mapReady]); // filteredFestivals는 filters 전체를 반영

  const handleClose = () => {
    setCardVisible(false);
    setTimeout(() => setSelectedFestival(null), 350);
  };

  return (
    <div className="mappage">

      {/* ── 필터 바 ── */}
      <div className="filter-bar">
        {/* 지역 */}
        <div className="filter-row">
          {REGIONS.map(r => (
            <button
              key={r}
              className={`filter-chip${filters.region === r ? ' active' : ''}`}
              onClick={() => setFilter('region', r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 카테고리 | 계절 | 인기순 */}
        <div className="filter-row">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`filter-chip${filters.category === c ? ' active' : ''}`}
              onClick={() => setFilter('category', c)}
            >
              {c}
            </button>
          ))}
          <div className="filter-divider" />
          {SEASONS.map(s => (
            <button
              key={s}
              className={`filter-chip${filters.season === s ? ' active' : ''}`}
              onClick={() => setFilter('season', s)}
            >
              {s}
            </button>
          ))}
          <div className="filter-divider" />
          <button
            className={`sort-btn${filters.sortByPopularity ? ' active' : ''}`}
            onClick={() => setFilter('sortByPopularity', !filters.sortByPopularity)}
          >
            🔥 인기순
          </button>
        </div>
      </div>

      {/* ── 지도 ── */}
      <div ref={mapContainerRef} className="map-container" />

      {/* ── 빈 상태 ── */}
      {mapReady && filteredFestivals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p className="empty-text">해당하는 축제가 없어요</p>
          <button className="empty-reset" onClick={() => setFilters(INIT_FILTERS)}>
            필터 초기화
          </button>
        </div>
      )}

      {/* ── 슬라이드 카드 ── */}
      {selectedFestival && (
        <div className={`festival-card${cardVisible ? ' visible' : ''}`}>
          <button className="card-close" onClick={handleClose}>✕</button>
          <img src={selectedFestival.image} alt={selectedFestival.name} className="card-image" />
          <div className="card-body">
            <h2 className="card-name">{selectedFestival.name}</h2>
            <p className="card-date">{selectedFestival.date}</p>
            <div className="card-stats">
              <div className="stat-item">
                <span className="stat-label">연간 방문자</span>
                <span className="stat-value">{formatVisitors(selectedFestival.visitors)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">전국 순위</span>
                <span className="stat-value">#{selectedFestival.popularityRank}</span>
              </div>
              <span className={`trend-badge ${TREND[selectedFestival.trend].cls}`}>
                {TREND[selectedFestival.trend].label}
              </span>
            </div>
            <p className="card-desc">{selectedFestival.description}</p>
            <div className="card-tags">
              {selectedFestival.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>

            {/* 실시간 지역 방문자 */}
            {(() => {
              const area = getAreaData(visitorData, selectedFestival.region);
              if (!area) return null;
              return (
                <div className="card-realtime">
                  <p className="card-realtime-title">📊 {area.name} 최근 30일 방문자</p>
                  <div className="card-realtime-total">{formatVisitors(area.total)}명</div>
                  <div className="card-realtime-bars">
                    {[
                      { label: '현지인', value: area.local,    cls: 'rt-local' },
                      { label: '외지인', value: area.nonlocal, cls: 'rt-nonlocal' },
                      { label: '외국인', value: area.foreign,  cls: 'rt-foreign' },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="card-rt-row">
                        <span className="card-rt-label">{label}</span>
                        <div className="card-rt-track">
                          <div className={`card-rt-fill ${cls}`} style={{ width: `${(value / area.total) * 100}%` }} />
                        </div>
                        <span className="card-rt-num">{formatVisitors(value)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="card-realtime-source">출처: 한국관광공사 TourAPI</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Mappage;
