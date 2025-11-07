/**
 * 반려동물 정보가 있는 관광지 찾기 스크립트
 *
 * 여러 관광지를 테스트해서 반려동물 정보가 있는 관광지를 찾습니다.
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
};

/**
 * 관광지 목록 조회
 */
async function getTourList(
  serviceKey: string,
  areaCode?: string,
  contentTypeId?: string,
  numOfRows: number = 50,
) {
  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    numOfRows: numOfRows.toString(),
    pageNo: "1",
  });

  if (areaCode) {
    searchParams.append("areaCode", areaCode);
  }
  if (contentTypeId) {
    searchParams.append("contentTypeId", contentTypeId);
  }

  const url = `${BASE_URL}/areaBasedList2?${searchParams.toString()}`;

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
    console.error("관광지 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 반려동물 정보 조회
 */
async function getPetTourInfo(serviceKey: string, contentId: string) {
  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

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

    return Array.isArray(items) ? items[0] : items;
  } catch (error) {
    return null;
  }
}

/**
 * 여러 관광지를 테스트해서 반려동물 정보가 있는 관광지 찾기
 */
async function findPetTours(serviceKey: string) {
  console.log("🔍 반려동물 정보가 있는 관광지 찾기 시작...\n");

  // 다양한 지역과 타입의 관광지 조회
  const testConfigs = [
    { areaCode: "1", contentTypeId: "12", name: "서울 관광지" },
    { areaCode: "6", contentTypeId: "12", name: "부산 관광지" },
    { areaCode: "39", contentTypeId: "12", name: "제주 관광지" },
    { areaCode: "1", contentTypeId: "14", name: "서울 문화시설" },
    { areaCode: "1", contentTypeId: "28", name: "서울 레포츠" },
  ];

  const foundTours: Array<{
    contentId: string;
    title: string;
    areaCode: string;
    contentTypeId: string;
    petInfo: any;
  }> = [];

  for (const config of testConfigs) {
    console.log(`\n📋 ${config.name} 조회 중...`);
    const tours = await getTourList(
      serviceKey,
      config.areaCode,
      config.contentTypeId,
      50,
    );

    if (tours.length === 0) {
      console.log(`  ⚠️  관광지 없음`);
      continue;
    }

    console.log(`  ✅ ${tours.length}개의 관광지 조회됨`);
    console.log(`  🔍 반려동물 정보 확인 중...`);

    let checkedCount = 0;
    let foundCount = 0;

    // 각 관광지의 반려동물 정보 확인
    for (const tour of tours.slice(0, 20)) {
      // 처음 20개만 테스트
      const petInfo = await getPetTourInfo(serviceKey, tour.contentid);
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

        console.log(`\n  ✅ 발견! ${tour.title} (${tour.contentid})`);
        console.log(`     - chkpetleash: ${petInfo.chkpetleash || "없음"}`);
        console.log(`     - chkpetsize: ${petInfo.chkpetsize || "없음"}`);
        console.log(`     - chkpetplace: ${petInfo.chkpetplace || "없음"}`);
        console.log(`     - petinfo: ${petInfo.petinfo || "없음"}`);

        // 5개 찾으면 충분
        if (foundTours.length >= 5) {
          break;
        }
      }

      // API 호출 간격
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`  📊 확인: ${checkedCount}개, 발견: ${foundCount}개`);

    if (foundTours.length >= 5) {
      break;
    }
  }

  console.log(`\n\n🎉 결과:`);
  console.log(
    `총 ${foundTours.length}개의 반려동물 정보가 있는 관광지를 찾았습니다!\n`,
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

/**
 * 메인 함수
 */
async function main() {
  const serviceKey =
    process.env.NEXT_PUBLIC_TOUR_PET_API_KEY || process.env.TOUR_PET_API_KEY;

  if (!serviceKey) {
    console.error("❌ API 키가 설정되지 않았습니다.");
    console.log(
      "환경 변수 NEXT_PUBLIC_TOUR_PET_API_KEY 또는 TOUR_PET_API_KEY를 설정해주세요.",
    );
    return;
  }

  console.log(`🔑 API 키 확인: ${serviceKey.substring(0, 8)}...\n`);

  await findPetTours(serviceKey);
}

// 직접 API 키를 입력해서 테스트하는 함수
export async function findWithKey(apiKey: string) {
  console.log(`🔑 API 키 사용: ${apiKey.substring(0, 8)}...\n`);
  await findPetTours(apiKey);
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}
