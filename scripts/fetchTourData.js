async function fetchFestivals() {
  const url = `${BASE_URL}/searchFestival1?serviceKey=${API_KEY}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=Test&_type=json&contentTypeId=15&eventStartDate=20260101&eventEndDate=20261231&arrange=B`;

  console.log("요청 URL (키 제외):", url.replace(API_KEY, "***"));

  const res = await fetch(url);
  const text = await res.text();
  console.log("응답 앞 300자:", text.slice(0, 300));

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("JSON 파싱 실패:", text.slice(0, 500));
    return [];
  }

  const header = data?.response?.header;
  console.log("응답 헤더:", JSON.stringify(header));

  if (header?.resultCode !== "0000") {
    console.error("API 에러:", header?.resultMsg);
    return [];
  }

  const items = data?.response?.body?.items?.item;
  if (!items) {
    console.log("items 없음");
    return [];
  }

  return Array.isArray(items) ? items : [items];
}
