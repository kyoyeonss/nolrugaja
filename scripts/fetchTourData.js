const fs = require("fs");
const path = require("path");

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
  const festivals = await fetchFestivals();
  console.log(`축제 데이터 ${festivals.length}개 받아옴`);

  const outputPath = path.join(__dirname, "../src/data/festivals_api.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(festivals, null, 2));
  console.log("저장 완료:", outputPath);
}

main().catch(console.error);
