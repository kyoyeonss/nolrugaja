import { useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import BottomNav from '../components/BottomNav';
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

function formatVisitors(num) {
  const man = num / 10000;
  return `${man % 1 === 0 ? man : man.toFixed(1)}만 명`;
}

function Homepage() {
  const navigate = useNavigate();

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
            <span className="hero-stat-num">15</span>
            <span className="hero-stat-label">개 축제</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">10</span>
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

      <BottomNav />
    </div>
  );
}

export default Homepage;
