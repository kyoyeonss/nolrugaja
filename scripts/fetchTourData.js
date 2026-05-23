import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.TOUR_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B551011/KorService1";

async function fetchFestivals() {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    numOfRows: 100,
    pageNo: 1,
    MobileOS: "ETC",
    MobileApp: "놀러가자",
    _type: "json",
    contentTypeId: 15,
    eventStartDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    arrange: "B",
  });

  const res = await fetch(`${BASE_URL}/searchFestival1?${params}`);
  const data = await res.json();
  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

async function main() {
  console.log("TourAPI 데이터 fetch 시작...");
  const rawFestivals = await fetchFestivals();
  console.log(`축제 데이터 ${rawFestivals.length}개 받아옴`);

  // TourAPI 데이터를 festivals.js 형식으로 변환
  const festivals = rawFestivals.map((f, i) => ({
    id: i + 1,
    name: f.title,
    region: f.addr1?.split(" ")[0] || "전국",
    date: `${f.eventstartdate?.slice(4, 6)}월`,
    description: f.overview || f.title,
    tags: [],
    image: f.firstimage || f.firstimage2 || `https://picsum.photos/seed/${i}/400/250`,
    lat: parseFloat(f.mapy) || 37.5665,
    lng: parseFloat(f.mapx) || 126.978,
    visitors: Math.floor(Math.random() * 500000) + 50000,
    popularityRank: i + 1,
    trend: "유지",
    addr: f.addr1,
    tel: f.tel,
    eventStartDate: f.eventstartdate,
    eventEndDate: f.eventenddate,
  }));

  // festivals.js 파일 덮어쓰기
  const outputPath = path.join(__dirname, "../src/data/festivals.js");
  const content = `export const festivals = ${JSON.stringify(festivals, null, 2)};\n`;
  fs.writeFileSync(outputPath, content);
  console.log("festivals.js 업데이트 완료!");
}

main().catch(console.error);
