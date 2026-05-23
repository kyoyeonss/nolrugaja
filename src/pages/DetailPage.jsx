import { useParams, useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import BottomNav from '../components/BottomNav';
import { useVisitorData, getAreaData, formatVisitors } from '../hooks/useVisitorData';
import './DetailPage.css';

const TREND_CONFIG = {
  상승: { cls: 'trend-up',   label: '▲ 상승' },
  유지: { cls: 'trend-keep', label: '▶ 유지' },
  하락: { cls: 'trend-down', label: '▼ 하락' },
};

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const festival = festivals.find(f => f.id === Number(id));
  const { data: visitorData } = useVisitorData();
  const areaData = festival ? getAreaData(visitorData, festival.region) : null;

  if (!festival) {
    return (
      <div className="dp-not-found">
        <p>축제를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  const trend = TREND_CONFIG[festival.trend];
  const festivalVisitors = (festival.visitors / 10000).toFixed(1);

  return (
    <div className="dp-page">
      {/* 뒤로 가기 */}
      <button className="dp-back" onClick={() => navigate(-1)}>← 뒤로</button>

      {/* 히어로 이미지 */}
      <div className="dp-hero">
        <img src={festival.image} alt={festival.name} className="dp-hero-img" />
        <div className="dp-hero-overlay" />
        <div className="dp-hero-info">
          <div className="dp-tags">
            {festival.tags.map(t => <span key={t} className="dp-tag">#{t}</span>)}
          </div>
          <h1 className="dp-title">{festival.name}</h1>
          <p className="dp-date">📅 {festival.date}</p>
        </div>
      </div>

      <div className="dp-body">
        {/* 기본 정보 */}
        <section className="dp-section">
          <div className="dp-stat-row">
            <div className="dp-stat">
              <span className="dp-stat-label">연간 방문자</span>
              <span className="dp-stat-value">{festivalVisitors}만 명</span>
            </div>
            <div className="dp-stat">
              <span className="dp-stat-label">전국 순위</span>
              <span className="dp-stat-value">#{festival.popularityRank}</span>
            </div>
            <span className={`dp-trend ${trend.cls}`}>{trend.label}</span>
          </div>
          <p className="dp-desc">{festival.description}</p>
        </section>

        {/* 실시간 지역 방문자 */}
        {areaData && (
          <section className="dp-section">
            <h2 className="dp-section-title">📊 {areaData.name} 실시간 방문자</h2>
            <p className="dp-section-sub">최근 30일 누적 · 한국관광공사 TourAPI</p>

            {/* 합계 */}
            <div className="dp-total-visitors">
              <span className="dp-total-num">{formatVisitors(areaData.total)}</span>
              <span className="dp-total-label">명 방문</span>
            </div>

            {/* 방문자 유형 바 */}
            <div className="dp-breakdown">
              {[
                { label: '현지인', value: areaData.local,    cls: 'bar-local' },
                { label: '외지인', value: areaData.nonlocal, cls: 'bar-nonlocal' },
                { label: '외국인', value: areaData.foreign,  cls: 'bar-foreign' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="dp-bar-row">
                  <span className="dp-bar-label">{label}</span>
                  <div className="dp-bar-track">
                    <div
                      className={`dp-bar-fill ${cls}`}
                      style={{ width: `${(value / areaData.total) * 100}%` }}
                    />
                  </div>
                  <span className="dp-bar-num">{formatVisitors(value)}</span>
                </div>
              ))}
            </div>

            {/* 트렌드 차트 */}
            {areaData.trend.length > 0 && (
              <div className="dp-chart">
                <h3 className="dp-chart-title">일별 방문자 추이</h3>
                <div className="dp-chart-bars">
                  {(() => {
                    const max = Math.max(...areaData.trend.map(t => t.total));
                    return areaData.trend.map(({ date, total }) => (
                      <div key={date} className="dp-chart-bar-wrap" title={`${date.slice(4,6)}/${date.slice(6)} : ${formatVisitors(total)}`}>
                        <div
                          className="dp-chart-bar"
                          style={{ height: `${(total / max) * 100}%` }}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="dp-chart-labels">
                  <span>{areaData.trend[0]?.date.slice(4, 8).replace(/(\d{2})(\d{2})/, '$1/$2')}</span>
                  <span>{areaData.trend[areaData.trend.length - 1]?.date.slice(4, 8).replace(/(\d{2})(\d{2})/, '$1/$2')}</span>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default DetailPage;
