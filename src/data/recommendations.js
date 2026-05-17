export const questions = [
  {
    id: 1,
    text: "여행에서 가장 중요한 것은?",
    options: [
      { text: "자연과 힐링", tags: ["자연", "힐링"] },
      { text: "문화와 역사 탐방", tags: ["전통", "문화", "역사"] },
      { text: "맛집 투어", tags: ["음식"] },
      { text: "액티비티와 스포츠", tags: ["액티비티", "바다"] },
    ],
  },
  {
    id: 2,
    text: "선호하는 여행 동반자는?",
    options: [
      { text: "혼자 (자유 여행)", tags: ["사진", "예술"] },
      { text: "연인과 함께", tags: ["야경", "커플"] },
      { text: "가족과 함께", tags: ["가족", "체험"] },
      { text: "친구들과 함께", tags: ["음악", "청년"] },
    ],
  },
  {
    id: 3,
    text: "여행 시기 선호도는?",
    options: [
      { text: "봄 (3~5월)", tags: ["봄", "벚꽃"] },
      { text: "여름 (6~8월)", tags: ["여름", "바다"] },
      { text: "가을 (9~11월)", tags: ["전통", "문화"] },
      { text: "겨울 (12~2월)", tags: ["야경", "겨울"] },
    ],
  },
  {
    id: 4,
    text: "선호하는 축제 분위기는?",
    options: [
      { text: "조용하고 감성적인", tags: ["예술", "사진", "야경"] },
      { text: "활기차고 신나는", tags: ["음악", "액티비티", "불꽃"] },
      { text: "전통적이고 교육적인", tags: ["전통", "역사", "체험"] },
      { text: "글로벌하고 트렌디한", tags: ["영화", "세계문화"] },
    ],
  },
  {
    id: 5,
    text: "여행에서 꼭 하고 싶은 것은?",
    options: [
      { text: "인생 사진 남기기", tags: ["사진", "야경", "봄"] },
      { text: "현지 음식 먹기", tags: ["음식", "전통"] },
      { text: "공연·전시 관람", tags: ["공연", "예술", "영화"] },
      { text: "자연 속 체험 활동", tags: ["자연", "야외", "액티비티"] },
    ],
  },
];

export const destinations = [
  {
    id: "jeju",
    name: "제주도",
    description: "청정 자연과 독특한 문화가 공존하는 대한민국 대표 여행지. 한라산, 성산일출봉, 올레길 등 볼거리가 넘쳐납니다.",
    tags: ["자연", "봄", "사진", "야외", "힐링"],
    bestFestivals: ["제주 들불 축제", "제주 유채꽃 축제"],
    image: "https://picsum.photos/seed/jeju-dest/600/350",
    tip: "렌터카 필수! 3박 4일 이상 추천",
  },
  {
    id: "gyeongju",
    name: "경주",
    description: "신라 천년의 역사가 살아숨쉬는 도시. 불국사, 첨성대, 동궁과 월지 등 유네스코 세계유산을 품고 있습니다.",
    tags: ["전통", "문화", "역사", "사진", "야경"],
    bestFestivals: ["경주 벚꽃 축제", "경주 한국의 술과 떡 잔치"],
    image: "https://picsum.photos/seed/gyeongju-dest/600/350",
    tip: "봄 벚꽃 시즌 방문 강력 추천",
  },
  {
    id: "jeonju",
    name: "전주",
    description: "한국 전통 문화의 중심지. 한옥마을에서 한복 체험, 전주비빔밥, 막걸리 골목 등 오감을 만족시키는 여행지.",
    tags: ["전통", "음식", "문화", "야경", "겨울"],
    bestFestivals: ["전주 국제 영화제", "전주 한옥마을 빛 축제"],
    image: "https://picsum.photos/seed/jeonju-dest/600/350",
    tip: "한복 대여 후 한옥마을 산책 필수",
  },
  {
    id: "busan",
    name: "부산",
    description: "도시와 바다가 만나는 역동적인 항구 도시. 해운대, 광안리, 감천문화마을 등 다양한 매력을 자랑합니다.",
    tags: ["바다", "여름", "커플", "야경", "음식"],
    bestFestivals: ["부산 바다 축제", "부산 국제 영화제"],
    image: "https://picsum.photos/seed/busan-dest/600/350",
    tip: "여름 방문 시 숙소 예약 필수",
  },
  {
    id: "andong",
    name: "안동",
    description: "한국 유교 문화의 본고장. 하회마을, 도산서원 등 전통과 자연이 어우러진 깊은 울림을 주는 여행지.",
    tags: ["전통", "역사", "공연", "세계문화", "체험"],
    bestFestivals: ["안동 국제 탈춤 페스티벌"],
    image: "https://picsum.photos/seed/andong-dest/600/350",
    tip: "하회별신굿 탈놀이 공연 일정 확인 필수",
  },
  {
    id: "seoul",
    name: "서울",
    description: "전통과 현대가 공존하는 대한민국의 수도. 고궁, 한강, 홍대, 성수동까지 취향에 따라 즐기는 방법이 무궁무진.",
    tags: ["야경", "문화", "음악", "영화", "청년"],
    bestFestivals: ["서울 빛초롱 축제", "서울 세계 불꽃 축제"],
    image: "https://picsum.photos/seed/seoul-dest/600/350",
    tip: "대중교통 최강! 서울 시티패스 활용 추천",
  },
  {
    id: "chuncheon",
    name: "춘천",
    description: "호수와 산이 어우러진 낭만의 도시. 닭갈비 골목, 남이섬, 소양강 스카이워크 등 힐링 여행의 정석.",
    tags: ["자연", "힐링", "커플", "음식", "봄"],
    bestFestivals: ["춘천 마임 축제"],
    image: "https://picsum.photos/seed/chuncheon-dest/600/350",
    tip: "서울에서 ITX 청춘열차로 1시간 30분",
  },
  {
    id: "incheon",
    name: "인천",
    description: "차이나타운, 월미도, 강화도까지 다양한 볼거리를 갖춘 항구 도시. 서울 근교 당일치기로도 좋습니다.",
    tags: ["음악", "액티비티", "청년", "바다"],
    bestFestivals: ["인천 펜타포트 락 페스티벌"],
    image: "https://picsum.photos/seed/incheon-dest/600/350",
    tip: "수도권 전철로 쉽게 접근 가능",
  },
];

export function getRecommendations(selectedTags) {
  const scores = destinations.map((dest) => {
    const score = dest.tags.filter((tag) => selectedTags.includes(tag)).length;
    return { ...dest, score };
  });
  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}
