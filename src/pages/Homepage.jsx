import { useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import BottomNav from '../components/BottomNav';
import { useVisitorData, formatVisitors, REGION_AREA_CD } from '../hooks/useVisitorData';
import './Homepage.css';

const TOP3 = [...festivals]
  .sort((a, b) => b.visitors - a.visitors)
  .slice(0, 3);

const RANK_META = [
  { medal: '🥇', bg: '#FEF3C7', color: '#B45309' },
  { medal: '🥈', bg: '#F1F5F9', color: '#475569' },
  { medal: '🥉', bg: '#FFF7ED', color: '#C2410C' },
];

const TREND_CONFIG = {
  상승: { cls: 'trend-up',   label: '▲ 상승' },
  유지: { cls: 'trend-keep', label: '▶ 유지' },
  하락: { cls: 'trend-down', label: '▼ 하락' },
};

// 지역명 한글 표시
const REGION_LABEL = {
  seoul: '서울', busan: '부산', gyeongju: '경주', jeonju: '전주',
  jeju: '제주', andong: '안동', chuncheon: '춘천', gwangju: '광주',
  incheon: '인천', daejeon: '대전', gangneung: '강릉', tongyeong: '통영',
  yeosu: '여수', sokcho: '속초', damyang: '담양',
};

function Homepage() {
  const navigate = useNavigate();
  const { data: visitorData, loading } = useVisitorData();

  return (
    <div className="homepage">

      {/* ── 히어로 ──────────────────────────── */}
      <section className="hero">
        <div className="hero-circle hero-circle--lg" />
        <div className="hero-circle hero-circle--sm" />
        <div className="hero-ring" />

        <div className="hero-content">
          <span className="hero-eyebrow">전국 축제 탐색</span>
          <h1 className="hero-title">놀러가자</h1>
          <p className="hero-desc">
            전국 축제를 한눈에 탐색하고<br />
            내 취향에 맞는 축제를 찾아보세요
          </p>
          <button className="hero-btn" onClick={() => navigate('/map')}>
            지도로 탐색하기
            <span className="hero-btn-arrow">→</span>
          </button>
        </div>

        {/* 히어로 통계 칩 */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">30</span>
            <span className="hero-stat-label">개 축제</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">15</span>
            <span className="hero-stat-label">개 지역</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">실시간</span>
            <span className="hero-stat-label">업데이트</span>
          </div>
        </div>
      </section>

      {/* ── TOP 3 ───────────────────────────── */}
      <section className="top3-section">
        <div className="section-header">
          <h2 className="section-title">🔥 이번 주 인기 축제</h2>
          <span className="section-sub">방문자 수 기준</span>
        </div>

        <div className="card-list">
          {TOP3.map((festival, idx) => {
            const rank = RANK_META[idx];
            const trend = TREND_CONFIG[festival.trend];
            return (
              <div key={festival.id} className="festival-card">
                {/* 이미지 */}
                <div className="card-img-wrap">
                  <img
                    src={festival.image}
                    alt={festival.name}
                    className="card-img"
                  />
                  <span
                    className="card-medal"
                    style={{ background: rank.bg, color: rank.color }}
                  >
                    {rank.medal} {idx + 1}위
                  </span>
                </div>

                {/* 정보 */}
                <div className="card-body">
                  <div className="card-top-row">
                    <h3 className="card-name">{festival.name}</h3>
                    <span className={`card-trend ${trend.cls}`}>{trend.label}</span>
                  </div>
                  <p className="card-date">{festival.date}</p>
                  <div className="card-meta">
                    <span className="card-visitors">
                      👥 {formatVisitors(festival.visitors)}
                    </span>
                    <span className="card-rank-chip">전국 #{festival.popularityRank}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 지도로 전체 보기 */}
        <button className="map-btn" onClick={() => navigate('/map')}>
          전체 축제 지도로 보기
        </button>
      </section>

      {/* ── 실시간 지역별 방문자 ─────────────────── */}
      <section className="visitor-section">
        <div className="section-header">
          <h2 className="section-title">📊 실시간 지역별 방문자</h2>
          <span className="section-sub">
            {visitorData ? `${visitorData.updatedAt.slice(0,4)}.${visitorData.updatedAt.slice(4,6)}.${visitorData.updatedAt.slice(6)} 기준` : '로딩 중...'}
          </span>
        </div>

        {loading && <div className="visitor-loading">데이터 불러오는 중...</div>}

        {visitorData && (() => {
          // 축제가 있는 지역만 추려서 방문자 순으로 정렬
          const regionEntries = Object.entries(REGION_LABEL).map(([regionId, label]) => {
            const areaCd = REGION_AREA_CD[regionId];
            const area = visitorData.byArea[areaCd];
            return { regionId, label, area };
          }).filter(e => e.area).sort((a, b) => b.area.total - a.area.total);

          const maxTotal = regionEntries[0]?.area.total || 1;

          return (
            <div className="visitor-list">
              {regionEntries.map(({ regionId, label, area }, i) => (
                <div key={regionId} className="visitor-row">
                  <span className="visitor-rank">#{i + 1}</span>
                  <span className="visitor-name">{label}</span>
                  <div className="visitor-bar-wrap">
                    <div
                      className="visitor-bar"
                      style={{ width: `${(area.total / maxTotal) * 100}%` }}
                    />
                  </div>
                  <span className="visitor-num">{formatVisitors(area.total)}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {visitorData && (
          <p className="visitor-source">출처: 한국관광공사 TourAPI · 매일 갱신</p>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

export default Homepage;
