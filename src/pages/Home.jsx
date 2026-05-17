import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <section className="hero">
        <h1>놀러가자</h1>
        <p className="hero-sub">국내 축제와 여행지를 한눈에 — 나에게 맞는 여행을 찾아보세요</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/festivals")}>
            지역별 축제 보기
          </button>
          <button className="btn-secondary" onClick={() => navigate("/recommend")}>
            여행지 추천받기
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">🗺️</span>
          <h3>지역별 축제 지도</h3>
          <p>전국 주요 축제를 지도로 한눈에 확인하고, 지역별 상세 정보를 탐색하세요.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">✨</span>
          <h3>성향별 여행지 추천</h3>
          <p>간단한 질문에 답하면 나의 여행 성향에 꼭 맞는 국내 여행지를 추천해드립니다.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📅</span>
          <h3>시즌별 축제 안내</h3>
          <p>봄 벚꽃부터 겨울 빛 축제까지, 계절에 맞는 최고의 축제 정보를 제공합니다.</p>
        </div>
      </section>
    </div>
  );
}
