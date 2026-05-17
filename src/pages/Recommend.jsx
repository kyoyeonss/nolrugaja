import { useState } from "react";
import { questions, getRecommendations } from "../data/recommendations";
import "./Recommend.css";

export default function Recommend() {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = result
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);

  const totalSteps = questions.length;

  function handleAnswer(option) {
    const newAnswers = [...answers, option.tags];
    setAnswers(newAnswers);

    if (step < totalSteps) {
      setStep(step + 1);
    }

    if (step === totalSteps) {
      const allTags = newAnswers.flat();
      setResults(getRecommendations(allTags));
      setStep(totalSteps + 1);
    }
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setResults(null);
  }

  if (step === 0) {
    return (
      <div className="recommend-page">
        <div className="recommend-intro">
          <span className="intro-icon">✨</span>
          <h2>나에게 맞는 여행지 찾기</h2>
          <p>
            5가지 질문에 답하면 당신의 여행 성향을 분석해<br />
            딱 맞는 국내 여행지와 추천 축제를 알려드립니다!
          </p>
          <button className="btn-start" onClick={() => setStep(1)}>
            테스트 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (step <= totalSteps) {
    const q = questions[step - 1];
    const progress = ((step - 1) / totalSteps) * 100;

    return (
      <div className="recommend-page">
        <div className="quiz-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="step-label">
            {step} / {totalSteps}
          </p>
          <h2 className="question-text">{q.text}</h2>
          <div className="options-grid">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className="option-btn"
                onClick={() => handleAnswer(opt)}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommend-page">
      <div className="result-container">
        <h2 className="result-title">당신을 위한 추천 여행지</h2>
        <p className="result-sub">분석 결과, 이런 여행지가 잘 맞을 것 같아요!</p>

        <div className="result-cards">
          {results.map((dest, i) => (
            <div key={dest.id} className={`result-card rank-${i + 1}`}>
              {i === 0 && <span className="rank-badge">Best Match</span>}
              <img src={dest.image} alt={dest.name} />
              <div className="result-info">
                <h3>{dest.name}</h3>
                <p>{dest.description}</p>
                <div className="tags" style={{ marginBottom: 10 }}>
                  {dest.tags.map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="best-festivals">
                  <strong>추천 축제</strong>
                  <ul>
                    {dest.bestFestivals.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <p className="dest-tip">💡 {dest.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-restart" onClick={restart}>
          다시 테스트하기
        </button>
      </div>
    </div>
  );
}
