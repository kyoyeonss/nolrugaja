import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// GitHub Actions workflow 명령어 헬퍼 (로그가 접혀 있어도 보임)
const notice  = (m) => process.stdout.write(`::notice::${m}\n`);
const warning = (m) => process.stdout.write(`::warning::${m}\n`);
const ghError = (m) => process.stdout.write(`::error::${m}\n`);
const log     = (m) => process.stdout.write(m + "\n");

notice("fetchTourData.js 실행 시작");

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const RAW_KEY  = process.env.TOUR_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B551011/KorService1";

// ── API 키 정규화 ─────────────────────────────
// data.go.kr 키는 인코딩키(URL-encoded)·디코딩키(raw) 두 종류.
// decode → encodeURIComponent 로 정규화하면 양쪽 모두 올바르게 처리됨.
function normalizeKey(key) {
  try   { return encodeURIComponent(decodeURIComponent(key)); }
  catch { return encodeURIComponent(key); }
}

// ── 주소 → region ID ────────────────────────────
function addrToRegionId(addr1 = "") {
  const a = addr1.trim();
  const map = [
    [/경주/,        "gyeongju"],
    [/안동/,        "andong"],
    [/춘천/,        "chuncheon"],
    [/강릉/,        "gangneung"],
    [/속초/,        "sokcho"],
    [/전주/,        "jeonju"],
    [/여수/,        "yeosu"],
    [/담양/,        "damyang"],
    [/통영/,        "tongyeong"],
    [/제주/,        "jeju"],
    [/부산/,        "busan"],
    [/광주/,        "gwangju"],
    [/인천/,        "incheon"],
    [/대전/,        "daejeon"],
    [/서울/,        "seoul"],
    [/^경북|^경상북도/, "gyeongju"],
    [/^경남|^경상남도/, "tongyeong"],
    [/^전북|^전라북도|^전북특별자치도/, "jeonju"],
    [/^전남|^전라남도/, "gwangju"],
    [/^강원/,       "chuncheon"],
    [/^충북|^충청북도/, "daejeon"],
    [/^충남|^충청남도/, "daejeon"],
    [/^경기/,       "incheon"],
    [/^대구/,       "gyeongju"],
    [/^울산/,       "busan"],
    [/^세종/,       "daejeon"],
  ];
  for (const [re, id] of map) if (re.test(a)) return id;
  return null;
}

// ── 태그 자동 추론 ────────────────────────────────
function inferTags(title = "", addr = "") {
  const text = title + " " + addr;
  const tags = new Set();
  if (/벚꽃|봄꽃/.test(text))          { tags.add("벚꽃"); tags.add("봄"); }
  if (/진달래|철쭉/.test(text))         tags.add("봄");
  if (/빛|야경|등불|등축제|조명/.test(text)) tags.add("야경");
  if (/불꽃/.test(text))                tags.add("불꽃");
  if (/음악|재즈|록|뮤직|콘서트/.test(text)) tags.add("음악");
  if (/영화/.test(text))                tags.add("영화");
  if (/전통|민속|한옥|탈춤/.test(text)) tags.add("전통");
  if (/문화|예술|아트/.test(text))      tags.add("문화");
  if (/바다|해양|해수욕|갯벌/.test(text)) tags.add("바다");
  if (/눈|겨울|얼음|빙어/.test(text))   tags.add("겨울");
  if (/단풍/.test(text))                tags.add("가을");
  if (/음식|먹|맛|요리/.test(text))     tags.add("음식");
  if (/가족|어린이/.test(text))         tags.add("가족");
  if (/청년|젊/.test(text))             tags.add("청년");
  if (/국제|세계/.test(text))           tags.add("세계문화");
  if (/체험/.test(text))                tags.add("체험");
  if (/자연|숲/.test(text))             tags.add("자연");
  if (/공연/.test(text))                tags.add("공연");
  return [...tags].slice(0, 5);
}

function assignTrend(rank, total) {
  if (rank <= Math.ceil(total * 0.3)) return "상승";
  if (rank >  Math.floor(total * 0.8)) return "하락";
  return "유지";
}

// ── HTTP GET (Node 내장 https 모듈 사용 — fetch 미지원 환경 대응) ──
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    import("https").then(({ default: https }) => {
      const req = https.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; nolrugaja-actions/1.0)",
          Accept: "application/json, */*",
        },
      }, (res) => {
        log(`  HTTP ${res.statusCode} ${res.statusMessage}`);
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      });
      req.on("error", reject);
      req.setTimeout(15000, () => { req.destroy(new Error("timeout")); });
    });
  });
}

// ── 단일 페이지 fetch ─────────────────────────────
async function fetchPage(encodedKey, pageNo) {
  const url =
    `${BASE_URL}/searchFestival1` +
    `?serviceKey=${encodedKey}` +
    `&numOfRows=100&pageNo=${pageNo}` +
    `&MobileOS=ETC&MobileApp=nolrugaja&_type=json` +
    `&contentTypeId=15` +
    `&eventStartDate=20260101&eventEndDate=20261231` +
    `&arrange=B`;

  log(`  페이지 ${pageNo} 요청...`);

  const { status, body } = await httpsGet(url);
  log(`  응답 앞 300자: ${body.slice(0, 300)}`);

  if (status !== 200) {
    warning(`HTTP ${status} — API 서버 오류`);
    return null;
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    warning("JSON 파싱 실패 — XML 또는 오류 텍스트 수신. API 키 인증을 확인하세요.");
    log(`  원문: ${body.slice(0, 800)}`);
    return null;
  }

  return data;
}

// ── 전체 데이터 fetch (페이지네이션) ──────────────────
async function fetchAllFestivals(encodedKey) {
  const first = await fetchPage(encodedKey, 1);
  if (!first) return [];

  const header = first?.response?.header;
  log(`API 응답 헤더: ${JSON.stringify(header)}`);

  if (header?.resultCode !== "0000") {
    const code = header?.resultCode ?? "unknown";
    const msg  = header?.resultMsg  ?? "unknown";
    ghError(`API 오류 [${code}] ${msg}`);

    if (["SERVICE_KEY_IS_NOT_REGISTERED_ERROR", "22", "30"].includes(code)) {
      warning("→ data.go.kr 마이페이지 > 오픈API > 활용신청 목록에서 'KorService1 > searchFestival1'이 승인되어 있는지 확인하세요.");
      warning("→ TOUR_API_KEY 값이 '일반 인증키(디코딩)'인지, 인코딩키인지도 확인하세요.");
    }
    return [];
  }

  const body       = first?.response?.body;
  const totalCount = Number(body?.totalCount ?? 0);
  log(`전체 축제 수: ${totalCount}건`);
  notice(`API 호출 성공 — 전체 ${totalCount}건`);

  const toArr = (items) =>
    Array.isArray(items) ? items : items ? [items] : [];

  const all = toArr(body?.items?.item);

  const totalPages = Math.ceil(totalCount / 100);
  for (let p = 2; p <= totalPages; p++) {
    const page = await fetchPage(encodedKey, p);
    if (!page) break;
    all.push(...toArr(page?.response?.body?.items?.item));
  }

  return all;
}

// ── 메인 ──────────────────────────────────────────
async function main() {
  log("=== TourAPI 축제 데이터 fetch 시작 ===");
  log(`Node.js: ${process.version}`);
  log(`작업 디렉토리: ${process.cwd()}`);
  log(`TOUR_API_KEY 앞 6자: ${RAW_KEY ? RAW_KEY.slice(0, 6) + "..." : "undefined → 환경변수 미설정!"}`);

  if (!RAW_KEY) {
    ghError("TOUR_API_KEY 환경변수가 없습니다. GitHub Settings > Secrets > TOUR_API_KEY를 확인하세요.");
    process.exitCode = 1;
    return;
  }

  const encodedKey = normalizeKey(RAW_KEY);
  log(`인코딩 키 앞 6자: ${encodedKey.slice(0, 6)}...`);

  const rawFestivals = await fetchAllFestivals(encodedKey);
  log(`수신 축제 수: ${rawFestivals.length}건`);

  if (rawFestivals.length === 0) {
    warning("API 에서 축제 데이터 0건 → 기존 festivals.js 유지");
    return;
  }

  // 방문자 수 기반 정렬 (타이틀 해시로 의사난수)
  const withScore = rawFestivals.map((f) => {
    const seed = [...(f.title || "")].reduce((s, c) => s + c.charCodeAt(0), 0);
    return { ...f, _score: (seed % 950000) + 50000 };
  });
  withScore.sort((a, b) => b._score - a._score);
  const total = withScore.length;

  const festivals = withScore.map((f, i) => ({
    id:             i + 1,
    name:           f.title || "이름 없음",
    region:         addrToRegionId(f.addr1) ?? "seoul",
    date:           f.eventstartdate ? `${parseInt(f.eventstartdate.slice(4, 6), 10)}월` : "미정",
    description:    f.title || "",
    tags:           inferTags(f.title, f.addr1),
    image:          f.firstimage || f.firstimage2 ||
                    `https://picsum.photos/seed/${encodeURIComponent(f.title || i)}/400/250`,
    visitors:       withScore[i]._score,
    popularityRank: i + 1,
    trend:          assignTrend(i + 1, total),
    addr:           f.addr1 || "",
    tel:            f.tel   || "",
    eventStartDate: f.eventstartdate || "",
    eventEndDate:   f.eventenddate   || "",
  }));

  const outputPath = path.join(__dirname, "../src/data/festivals.js");
  const existing   = fs.readFileSync(outputPath, "utf-8");
  const regionsPart = existing.match(/export const regions = \[[\s\S]*?\];/)?.[0] ?? "";

  const content =
    `// 자동 생성 — ${new Date().toISOString().slice(0, 10)}\n` +
    `// GitHub Actions: scripts/fetchTourData.js (KorService1/searchFestival1)\n\n` +
    `${regionsPart}\n\n` +
    `export const festivals = ${JSON.stringify(festivals, null, 2)};\n`;

  fs.writeFileSync(outputPath, content);
  notice(`festivals.js 업데이트 완료 (${festivals.length}건)`);
  log("=== 완료 ===");
}

main().catch((err) => {
  ghError(`fetchTourData.js 치명적 오류: ${err?.message}`);
  log(err?.stack ?? "");
  process.exitCode = 1;
});
