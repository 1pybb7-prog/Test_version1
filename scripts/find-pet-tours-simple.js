/**
 * 반려동물 정보가 있는 관광지 찾기 스크립트 (Node.js)
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const API_KEY =
  "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";

const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
};

// 테스트할 지역과 타입 조합 (더 많은 지역 추가)
const testConfigs = [
  { areaCode: "1", contentTypeId: "12", name: "서울 관광지" },
  { areaCode: "2", contentTypeId: "12", name: "인천 관광지" },
  { areaCode: "3", contentTypeId: "12", name: "대전 관광지" },
  { areaCode: "4", contentTypeId: "12", name: "대구 관광지" },
  { areaCode: "5", contentTypeId: "12", name: "광주 관광지" },
  { areaCode: "6", contentTypeId: "12", name: "부산 관광지" },
  { areaCode: "7", contentTypeId: "12", name: "울산 관광지" },
  { areaCode: "8", contentTypeId: "12", name: "세종 관광지" },
  { areaCode: "31", contentTypeId: "12", name: "경기 관광지" },
  { areaCode: "32", contentTypeId: "12", name: "강원 관광지" },
  { areaCode: "33", contentTypeId: "12", name: "충북 관광지" },
  { areaCode: "34", contentTypeId: "12", name: "충남 관광지" },
  { areaCode: "35", contentTypeId: "12", name: "경북 관광지" },
  { areaCode: "36", contentTypeId: "12", name: "경남 관광지" },
  { areaCode: "37", contentTypeId: "12", name: "전북 관광지" },
  { areaCode: "38", contentTypeId: "12", name: "전남 관광지" },
  { areaCode: "39", contentTypeId: "12", name: "제주 관광지" },
  { areaCode: "1", contentTypeId: "14", name: "서울 문화시설" },
  { areaCode: "1", contentTypeId: "28", name: "서울 레포츠" },
  { areaCode: "39", contentTypeId: "28", name: "제주 레포츠" },
];

/**
 * 관광지 목록 조회
 */
async function getTourList(areaCode, contentTypeId, numOfRows = 30) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    ...COMMON_PARAMS,
    areaCode,
    contentTypeId,
    numOfRows: numOfRows.toString(),
    pageNo: "1",
  });

  const url = `${BASE_URL}/areaBasedList2?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
    }

    const items = data.response.body.items?.item;
    if (!items) {
      return [];
    }

    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error("관광지 목록 조회 실패:", error.message);
    return [];
  }
}

/**
 * 반려동물 정보 조회
 */
async function getPetTourInfo(contentId) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.response.header.resultCode !== "0000") {
      return null;
    }

    // items가 빈 문자열이거나 null인 경우
    if (
      !data.response.body.items ||
      data.response.body.items === "" ||
      data.response.body.items === null
    ) {
      return null;
    }

    // items가 객체가 아닌 경우
    if (typeof data.response.body.items !== "object") {
      return null;
    }

    const items = data.response.body.items.item;
    if (!items) {
      return null;
    }

    const petInfo = Array.isArray(items) ? items[0] : items;

    // 반려동물 정보가 실제로 있는지 확인
    if (
      petInfo.chkpetleash ||
      petInfo.chkpetsize ||
      petInfo.chkpetplace ||
      petInfo.petinfo ||
      petInfo.chkpetfee
    ) {
      return petInfo;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log("🔍 반려동물 정보가 있는 관광지 찾기 시작...\n");

  const foundTours = [];

  for (const config of testConfigs) {
    console.log(`\n📋 ${config.name} 조회 중...`);

    const tours = await getTourList(config.areaCode, config.contentTypeId, 30);

    if (tours.length === 0) {
      console.log("  ⚠️  관광지 없음");
      continue;
    }

    console.log(`  ✅ ${tours.length}개의 관광지 조회됨`);
    console.log(`  🔍 반려동물 정보 확인 중...`);

    let checkedCount = 0;
    let foundCount = 0;

    // 각 관광지의 반려동물 정보 확인 (처음 30개)
    for (const tour of tours.slice(0, 30)) {
      const petInfo = await getPetTourInfo(tour.contentid);
      checkedCount++;

      if (petInfo) {
        foundCount++;
        foundTours.push({
          contentId: tour.contentid,
          title: tour.title,
          areaCode: config.areaCode,
          contentTypeId: config.contentTypeId,
          petInfo,
        });

        console.log(`\n  ✅ 발견! ${tour.title} (ID: ${tour.contentid})`);
        console.log(`     - chkpetleash: ${petInfo.chkpetleash || "없음"}`);
        console.log(`     - chkpetsize: ${petInfo.chkpetsize || "없음"}`);
        console.log(`     - chkpetplace: ${petInfo.chkpetplace || "없음"}`);
        console.log(`     - petinfo: ${petInfo.petinfo || "없음"}`);

        // 10개 찾으면 충분
        if (foundTours.length >= 10) {
          break;
        }
      }

      // API 호출 간격
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`  📊 확인: ${checkedCount} 개, 발견: ${foundCount} 개`);

    if (foundTours.length >= 10) {
      break;
    }
  }

  console.log(
    `\n\n🎉 결과: 총 ${foundTours.length}개의 반려동물 정보가 있는 관광지를 찾았습니다!\n`,
  );

  if (foundTours.length > 0) {
    console.log("📋 발견된 관광지 목록:");
    foundTours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title} (ID: ${tour.contentId})`);
      console.log(`   지역: ${tour.areaCode}, 타입: ${tour.contentTypeId}`);
      console.log(`   반려동물 정보:`, JSON.stringify(tour.petInfo, null, 2));
    });
  } else {
    console.log("⚠️  반려동물 정보가 있는 관광지를 찾지 못했습니다.");
    console.log("   - API에 반려동물 정보가 있는 관광지가 적을 수 있습니다.");
    console.log("   - 더 많은 관광지를 테스트해보세요.");
  }

  return foundTours;
}

// 실행
main().catch(console.error);
