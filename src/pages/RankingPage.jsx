import { useState, useMemo } from 'react';
import { festivals } from '../data/festivals';
import BottomNav from '../components/BottomNav';
import './RankingPage.css';

// ── 상수 ──────────────────────────────────────────────────
const TABS = ['전국', '수도권', '지방'];
const METRO = new Set(['seoul', 'incheon']);

const REGION_KO = {
  seoul: '서울', busan: '부산', gyeongju: '경주', jeonju: '전주',
  jeju: '제주', andong: '안동', chuncheon: '춘천', gwangju: '광주',
  incheon: '인천', daejeon: '대전',
};

const MEDAL = {
  1: {
    gradient:  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    accentClr: '#F59E0B',
    cardBg:    '#FFFBEB',
    barClr:    '#F59E0B',
    label:     '금',
  },
  2: {
    gradient:  'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
    accentClr: '#94A3B8',
    cardBg:    '#F8FAFC',
    barClr:    '#94A3B8',
    label:     '은',
  },
  3: {
    gradient:  'linear-gradient(135deg, #CD7F32 0%, #92400E 100%)',
    accentClr: '#CD7F32',
    cardBg:    '#FFF7ED',
    barClr:    '#CD7F32',
    label:     '동',
  },
};

const TREND = {
  상승: { cls: 'tr-up',   text: '▲ 상승' },
  유지: { cls: 'tr-keep', text: '▶ 유지' },
  하락: { cls: 'tr-down', text: '▼ 하락' },
};

// ── 헬퍼 ──────────────────────────────────────────────────
function formatVisitors(n) {
  const man = n / 10000;
  return `${man % 1 === 0 ? man : man.toFixed(1)}만 명`;
}

function getList(tab) {
  const filtered =
    tab === '수도권' ? festivals.filter(f => METRO.has(f.region))
    : tab === '지방'  ? festivals.filter(f => !METRO.has(f.region))
    : festivals;
  return [...filtered].sort((a, b) => b.visitors - a.visitors).slice(0, 10);
}

// ── 컴포넌트 ───────────────────────────────────────────────
function RankingPage() {
  const [activeTab, setActiveTab] = useState('전국');

  const list       = useMemo(() => getList(activeTab), [activeTab]);
  const maxVisit   = list[0]?.visitors ?? 1;

  return (
    <div className="rp-page">

      {/* ── 헤더 + 탭 ── */}
      <header className="rp-header">
        <div className="rp-header-text">
          <span className="rp-eyebrow">한국관광 빅데이터 기반</span>
          <h1 className="rp-title">인기 순위</h1>
          <p className="rp-desc">지역별 방문자 수 기준 축제 랭킹</p>
        </div>

        <div className="rp-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`rp-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ── 순위 리스트 ── */}
      <ul className="rp-list">
        {list.map((festival, idx) => {
          const rank   = idx + 1;
          const top3   = rank <= 3;
          const medal  = MEDAL[rank];
          const trend  = TREND[festival.trend];
          const barPct = Math.round((festival.visitors / maxVisit) * 100);

          return (
            <li
              key={festival.id}
              className={`rp-card${top3 ? ' top3' : ''}`}
              style={top3 ? {
                background: medal.cardBg,
                '--accent': medal.accentClr,   /* box-shadow로 사용 */
              } : {}}
            >
              {/* ─ 메인 행 ─ */}
              <div className="rp-row">

                {/* 순위 뱃지 */}
                {top3 ? (
                  <div
                    className="rp-badge medal"
                    style={{ background: medal.gradient }}
                  >
                    <span className="medal-rank">{rank}</span>
                    <span className="medal-label">{medal.label}</span>
                  </div>
                ) : (
                  <div className="rp-badge normal">{rank}</div>
                )}

                {/* 썸네일 */}
                <img
                  src={festival.image}
                  alt={festival.name}
                  className={`rp-thumb${top3 ? ' lg' : ''}`}
                />

                {/* 정보 */}
                <div className="rp-info">
                  <p className="rp-name">{festival.name}</p>
                  <p className="rp-meta">
                    <span className="rp-region">{REGION_KO[festival.region]}</span>
                    <span className="rp-dot">·</span>
                    <span className="rp-date">{festival.date}</span>
                  </p>
                  {top3 && (
                    <p className="rp-visit-lg">👥 {formatVisitors(festival.visitors)}</p>
                  )}
                </div>

                {/* 오른쪽: 방문자(일반) + 트렌드 */}
                <div className="rp-right">
                  {!top3 && (
                    <span className="rp-visit-sm">{formatVisitors(festival.visitors)}</span>
                  )}
                  <span className={`rp-trend ${trend.cls}`}>{trend.text}</span>
                </div>
              </div>

              {/* ─ 방문자 비율 바 (top3 전용) ─ */}
              {top3 && (
                <div className="rp-bar-track">
                  <div
                    className="rp-bar-fill"
                    style={{ width: `${barPct}%`, background: medal.barClr }}
                  />
                  <span className="rp-bar-pct">{barPct}%</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <div className="rp-empty">
          <p>해당 지역의 축제 데이터가 없어요</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default RankingPage;
