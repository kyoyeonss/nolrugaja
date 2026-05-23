import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

process.stdout.write("[fetchTourData] 스크립트 시작\n");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_KEY = process.env.TOUR_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B551011/KorService1";

// data.go.kr 키는 인코딩키/디코딩키 두 종류가 있음.
// 디코딩키(+, / 포함)를 환경변수에 넣었을 때도 올바르게 동작하도록
// 한 번 decode → encodeURIComponent 로 정규화.
function normalizeKey(key) {
  try {
    return encodeURIComponent(decodeURIComponent(key));
  } catch {
    return encodeURIComponent(key);
  }
}

// 축제 addr1 → regions 배열의 id 매핑
function addrToRegionId(addr1 = "") {
  const a = addr1.trim();
  // 구체적인 도시명 우선
  if (a.includes("경주")) return "gyeongju";
  if (a.includes("안동")) return "andong";
  if (a.includes("춘천")) return "chuncheon";
  if (a.includes("강릉")) return "gangneung";
  if (a.includes("속초")) return "sokcho";
  if (a.includes("전주")) return "jeonju";
  if (a.includes("여수")) return "yeosu";
  if (a.includes("담양")) return "damyang";
  if (a.includes("통영")) return "tongyeong";
  if (a.includes("제주")) return "jeju";
  if (a.includes("부산")) return "busan";
  if (a.includes("광주")) return "gwangju";
  if (a.includes("인천")) return "incheon";
  if (a.includes("대전")) return "daejeon";
  if (a.includes("서울")) return "seoul";
  // 광역시도 단위
  if (a.match(/^경북|^경상북도/)) return "gyeongju";
  if (a.match(/^경남|^경상남도/)) return "tongyeong";
  if (a.match(/^전북|^전라북도|^전북특별자치도/)) return "jeonju";
  if (a.match(/^전남|^전라남도/)) return "gwangju";
  if (a.match(/^강원|^강원특별자치도/)) return "chuncheon";
  if (a.match(/^충북|^충청북도/)) return "daejeon";
  if (a.match(/^충남|^충청남도/)) return "daejeon";
  if (a.match(/^경기/)) return "incheon";
  if (a.match(/^대구/)) return "gyeongju";
  if (a.match(/^울산/)) return "busan";
  if (a.match(/^세종/)) return "daejeon";
  return null;
}

// 제목·주소 기반 태그 자동 추론
function inferTags(title = "", addr = "") {
  const text = title + " " + addr;
  const tags = new Set();
  if (/벚꽃|봄꽃/.test(text)) { tags.add("벚꽃"); tags.add("봄"); }
  if (/진달래|철쭉/.test(text)) tags.add("봄");
  if (/빛|야경|등불|등축제|조명/.test(text)) tags.add("야경");
  if (/불꽃/.test(text)) tags.add("불꽃");
  if (/음악|재즈|록|뮤직|콘서트/.test(text)) tags.add("음악");
  if (/영화/.test(text)) tags.add("영화");
  if (/전통|민속|한옥|탈춤/.test(text)) tags.add("전통");
  if (/문화|예술|아트/.test(text)) tags.add("문화");
  if (/바다|해양|해수욕|갯벌/.test(text)) tags.add("바다");
  if (/눈|겨울|얼음|빙어/.test(text)) tags.add("겨울");
  if (/단풍/.test(text)) tags.add("가을");
  if (/음식|먹|맛|요리/.test(text)) tags.add("음식");
  if (/가족|어린이/.test(text)) tags.add("가족");
  if (/청년|젊/.test(text)) tags.add("청년");
  if (/국제|세계/.test(text)) tags.add("세계문화");
  if (/사진|포토/.test(text)) tags.add("사진");
  if (/체험/.test(text)) tags.add("체험");
  if (/자연|숲/.test(text)) tags.add("자연");
  if (/공연/.test(text)) tags.add("공연");
  if (/과학|기술/.test(text)) tags.add("과학");
  return [...tags].slice(0, 5);
}

function assignTrend(rank, total) {
  // 상위 30%는 상승, 하위 20%는 하락, 나머지 유지
  if (rank <= Math.ceil(total * 0.3)) return "상승";
  if (rank > Math.floor(total * 0.8)) return "하락";
  return "유지";
}

async function fetchPage(encodedKey, pageNo) {
  const url =
    `${BASE_URL}/searchFestival1` +
    `?serviceKey=${encodedKey}` +
    `&numOfRows=100&pageNo=${pageNo}` +
    `&MobileOS=ETC&MobileApp=nolrugaja&_type=json` +
    `&contentTypeId=15` +
    `&eventStartDate=20260101&eventEndDate=20261231` +
    `&arrange=B`;

  console.log(`페이지 ${pageNo} 요청 중...`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; nolrugaja/1.0; +https://kyoyeonss.github.io/nolrugaja)",
      Accept: "application/json",
    },
  });

  console.log(`HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();
  console.log("응답 앞 400자:", text.slice(0, 400));

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("JSON 파싱 실패 — XML 또는 오류 페이지 수신");
    return null;
  }

  return data;
}

async function fetchAllFestivals(encodedKey) {
  const first = await fetchPage(encodedKey, 1);
  if (!first) return [];

  const header = first?.response?.header;
  console.log("API 응답 헤더:", JSON.stringify(header));

  if (header?.resultCode !== "0000") {
    console.error("API 오류:", header?.resultCode, header?.resultMsg);

    // resultCode 인증 오류 시 힌트 출력
    if (["SERVICE_KEY_IS_NOT_REGISTERED_ERROR", "INVALID_REQUEST_PARAMETER_ERROR", "30", "22"].includes(header?.resultCode)) {
      console.error("→ GitHub Secret 'TOUR_API_KEY'에 저장된 키가 이 API에 신청되지 않았거나 잘못된 키일 수 있습니다.");
      console.error("→ data.go.kr 마이페이지에서 'KorService1 > searchFestival1' 활용 신청 여부를 확인하세요.");
    }
    return [];
  }

  const body = first?.response?.body;
  const totalCount = body?.totalCount || 0;
  console.log(`전체 축제 수: ${totalCount}건`);

  const toArray = (items) =>
    Array.isArray(items) ? items : items ? [items] : [];

  const all = toArray(body?.items?.item);

  // 100건 초과 시 추가 페이지 fetch
  const totalPages = Math.ceil(totalCount / 100);
  for (let p = 2; p <= totalPages; p++) {
    const page = await fetchPage(encodedKey, p);
    if (!page) break;
    all.push(...toArray(page?.response?.body?.items?.item));
  }

  return all;
}

async function main() {
  console.log("=== TourAPI 축제 데이터 fetch 시작 ===");
  console.log("TOUR_API_KEY 앞 8자:", RAW_KEY ? RAW_KEY.slice(0, 8) + "..." : "undefined → 환경변수 미설정!");

  if (!RAW_KEY) {
    console.error("TOUR_API_KEY 환경변수가 없습니다. GitHub Secrets를 확인하세요.");
    process.exit(1);
  }

  const encodedKey = normalizeKey(RAW_KEY);
  console.log("인코딩된 키 앞 8자:", encodedKey.slice(0, 8) + "...");

  const rawFestivals = await fetchAllFestivals(encodedKey);
  console.log(`축제 데이터 ${rawFestivals.length}개 수신`);

  if (rawFestivals.length === 0) {
    console.log("데이터 없음 → 기존 festivals.js 유지");
    return;
  }

  // 방문자 수 기준 정렬용 랜덤 시드 (실제 API 통계 없으므로 타이틀 해시 기반)
  const withVisitors = rawFestivals.map((f) => {
    const seed = [...(f.title || "")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { ...f, _visitors: (seed % 950000) + 50000 };
  });
  withVisitors.sort((a, b) => b._visitors - a._visitors);

  const total = withVisitors.length;

  const festivals = withVisitors.map((f, i) => {
    const regionId = addrToRegionId(f.addr1);
    const monthNum = f.eventstartdate?.slice(4, 6);
    const dateLabel = monthNum ? `${parseInt(monthNum, 10)}월` : "미정";

    return {
      id: i + 1,
      name: f.title || "이름 없음",
      region: regionId || "seoul",
      date: dateLabel,
      description: f.title || "",
      tags: inferTags(f.title, f.addr1),
      image:
        f.firstimage ||
        f.firstimage2 ||
        `https://picsum.photos/seed/${encodeURIComponent(f.title || i)}/400/250`,
      visitors: withVisitors[i]._visitors,
      popularityRank: i + 1,
      trend: assignTrend(i + 1, total),
      addr: f.addr1 || "",
      tel: f.tel || "",
      eventStartDate: f.eventstartdate || "",
      eventEndDate: f.eventenddate || "",
    };
  });

  const outputPath = path.join(__dirname, "../src/data/festivals.js");
  const existing = fs.readFileSync(outputPath, "utf-8");
  const regionsMatch = existing.match(/export const regions = \[[\s\S]*?\];/);
  const regionsCode = regionsMatch ? regionsMatch[0] : "";

  const content =
    `// 자동 생성 — ${new Date().toISOString()}\n` +
    `// GitHub Actions: scripts/fetchTourData.js\n\n` +
    `${regionsCode}\n\n` +
    `export const festivals = ${JSON.stringify(festivals, null, 2)};\n`;

  fs.writeFileSync(outputPath, content);
  console.log(`=== festivals.js 업데이트 완료 (${festivals.length}건) ===`);
}

main().catch((err) => {
  console.error("=== 치명적 에러 ===");
  console.error(err?.message || String(err));
  console.error(err?.stack || "");
  process.exit(1);
});
