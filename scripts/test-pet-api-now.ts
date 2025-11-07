/**
 * 반려동물 API 직접 테스트 스크립트
 *
 * 제공된 API 키로 실제 API를 호출하여 반려동물 동반 관광지가 있는지 확인합니다.
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
};

// API 키
const API_KEY =
  "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";

// 테스트할 관광지 ID들 (다양한 지역과 타입)
const testContentIds = [
  "2750144", // 서울 지역 관광지
  "2805408", // 부산 지역 관광지
  "2750143", // 제주 지역 관광지
  "127480", // 문화시설
  "1433504", // 레포츠
  "2901530", // 관광지
  "1797757", // 음식점
  "126273", // 관광지
  "2019720", // 관광지
  "2788416", // 관광지
];

/**
 * 반려동물 정보 조회
 */
async function getPetTourInfo(contentId: string) {
  const searchParams = new URLSearchParams({
    serviceKey: API_KEY,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

  console.log(`\n🔍 테스트 중: contentId=${contentId}`);
  console.log(`   전체 URL: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`   ❌ HTTP 에러: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // 🔥 첫 번째 관광지의 전체 응답 데이터 출력 (디버깅용)
    if (contentId === testContentIds[0]) {
      console.log(`\n   📋 전체 응답 데이터 (첫 번째 테스트):`);
      console.log(JSON.stringify(data, null, 2));
    }

    // API 응답 구조 확인
    console.log(`   📊 응답 구조:`, {
      resultCode: data.response?.header?.resultCode,
      resultMsg: data.response?.header?.resultMsg,
      totalCount: data.response?.body?.totalCount,
      hasItems: !!data.response?.body?.items,
      itemsType: typeof data.response?.body?.items,
      itemsValue: data.response?.body?.items, // 실제 값 출력
    });

    // API 에러 체크
    if (data.response?.header?.resultCode !== "0000") {
      console.log(
        `   ⚠️  API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
      return null;
    }

    // items가 빈 문자열이거나 null인 경우 - 더 자세한 정보 출력
    if (
      !data.response.body.items ||
      data.response.body.items === "" ||
      data.response.body.items === null
    ) {
      console.log(`   ℹ️  반려동물 정보 없음 (items가 비어있음)`);
      console.log(
        `   📝 body 전체:`,
        JSON.stringify(data.response.body, null, 2),
      );
      return null;
    }

    // items가 객체가 아닌 경우
    if (typeof data.response.body.items !== "object") {
      console.log(
        `   ℹ️  반려동물 정보 없음 (items 타입: ${typeof data.response.body
          .items})`,
      );
      console.log(`   📝 items 실제 값:`, data.response.body.items);
      return null;
    }

    const items = data.response.body.items.item;
    if (!items) {
      console.log(`   ℹ️  반려동물 정보 없음 (item이 없음)`);
      console.log(
        `   📝 items 객체 전체:`,
        JSON.stringify(data.response.body.items, null, 2),
      );
      return null;
    }

    const petInfo = Array.isArray(items) ? items[0] : items;

    console.log(`   ✅ 반려동물 정보 발견!`);
    console.log(
      `      - acmpyTypeCd (동반 타입): ${petInfo.acmpyTypeCd || "없음"}`,
    );
    console.log(
      `      - acmpyPsblCpam (동반 가능): ${petInfo.acmpyPsblCpam || "없음"}`,
    );
    console.log(
      `      - acmpyNeedMtr (필요 사항): ${petInfo.acmpyNeedMtr || "없음"}`,
    );
    console.log(
      `      - etcAcmpyInfo (기타 정보): ${petInfo.etcAcmpyInfo || "없음"}`,
    );
    console.log(
      `      - relaAcdntRiskMtr (사고 위험): ${
        petInfo.relaAcdntRiskMtr || "없음"
      }`,
    );

    return petInfo;
  } catch (error) {
    console.log(
      `   ❌ 에러 발생:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * 관광지 목록 조회 (반려동물 정보가 있을 수 있는 관광지 찾기)
 */
async function getTourList(
  areaCode?: string,
  contentTypeId?: string,
  numOfRows: number = 20,
) {
  const searchParams = new URLSearchParams({
    serviceKey: API_KEY,
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
      console.error(`❌ 관광지 목록 조회 실패: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (data.response.header.resultCode !== "0000") {
      console.error(
        `❌ API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
      return [];
    }

    const items = data.response.body.items?.item;
    if (!items) {
      return [];
    }

    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error("❌ 관광지 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 메인 테스트 함수
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🐾 한국관광공사 반려동물 동반 관광지 API 테스트");
  console.log("=".repeat(60));
  console.log(`🔑 API 키: ${API_KEY.substring(0, 20)}...`);
  console.log(`📅 테스트 시간: ${new Date().toLocaleString("ko-KR")}\n`);

  // 🔥 API 키 상세 정보 확인
  console.log("🔑 API 키 상세 정보:");
  console.log(`   - 길이: ${API_KEY.length}자`);
  console.log(`   - 처음 30자: ${API_KEY.substring(0, 30)}...`);
  console.log(`   - 마지막 30자: ...${API_KEY.substring(API_KEY.length - 30)}`);
  console.log(
    `   - 공백 포함: ${
      API_KEY.includes(" ") ? "⚠️ 예 (문제 가능성)" : "✅ 아니오"
    }`,
  );
  console.log(
    `   - 줄바꿈 포함: ${
      API_KEY.includes("\n") ? "⚠️ 예 (문제 가능성)" : "✅ 아니오"
    }`,
  );
  console.log(
    `   - 탭 포함: ${
      API_KEY.includes("\t") ? "⚠️ 예 (문제 가능성)" : "✅ 아니오"
    }\n`,
  );

  // 1단계: 제공된 관광지 ID들로 테스트
  console.log("📋 1단계: 제공된 관광지 ID들로 테스트");
  console.log("-".repeat(60));

  let foundCount = 0;
  const foundTours: Array<{ contentId: string; petInfo: any }> = [];

  for (const contentId of testContentIds) {
    const petInfo = await getPetTourInfo(contentId);
    if (petInfo) {
      foundCount++;
      foundTours.push({ contentId, petInfo });
    }
    // API 호출 간격 (너무 빠르게 호출하지 않도록)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(
    `\n📊 1단계 결과: ${testContentIds.length}개 중 ${foundCount}개에서 반려동물 정보 발견`,
  );

  // 2단계: 다양한 지역의 관광지를 조회해서 반려동물 정보가 있는 관광지 찾기
  console.log("\n📋 2단계: 다양한 지역의 관광지에서 반려동물 정보 찾기");
  console.log("-".repeat(60));

  const testConfigs = [
    { areaCode: "1", contentTypeId: "12", name: "서울 관광지" },
    { areaCode: "6", contentTypeId: "12", name: "부산 관광지" },
    { areaCode: "39", contentTypeId: "12", name: "제주 관광지" },
    { areaCode: "1", contentTypeId: "14", name: "서울 문화시설" },
    { areaCode: "1", contentTypeId: "28", name: "서울 레포츠" },
    { areaCode: "32", contentTypeId: "12", name: "경기 관광지" },
    { areaCode: "38", contentTypeId: "12", name: "경남 관광지" },
    { areaCode: "2", contentTypeId: "12", name: "인천 관광지" },
    { areaCode: "3", contentTypeId: "12", name: "대전 관광지" },
    { areaCode: "4", contentTypeId: "12", name: "대구 관광지" },
  ];

  for (const config of testConfigs) {
    console.log(`\n🔍 ${config.name} 조회 중...`);
    const tours = await getTourList(config.areaCode, config.contentTypeId, 50);

    if (tours.length === 0) {
      console.log(`   ⚠️  관광지 없음`);
      continue;
    }

    console.log(`   ✅ ${tours.length}개의 관광지 조회됨`);
    console.log(`   🔍 반려동물 정보 확인 중...`);

    let checkedCount = 0;
    let foundInThisCategory = 0;

    // 각 관광지의 반려동물 정보 확인 (처음 20개로 증가)
    for (const tour of tours.slice(0, 20)) {
      const petInfo = await getPetTourInfo(tour.contentid);
      checkedCount++;

      if (petInfo) {
        foundInThisCategory++;
        foundTours.push({
          contentId: tour.contentid,
          petInfo,
        });
        console.log(`   ✅ 발견! ${tour.title} (${tour.contentid})`);
      }

      // API 호출 간격
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 충분히 찾았으면 중단
      if (foundTours.length >= 5) {
        break;
      }
    }

    console.log(
      `   📊 확인: ${checkedCount}개, 발견: ${foundInThisCategory}개`,
    );

    if (foundTours.length >= 5) {
      break;
    }
  }

  // 최종 결과
  console.log("\n" + "=".repeat(60));
  console.log("🎉 최종 결과");
  console.log("=".repeat(60));
  console.log(
    `총 ${foundTours.length}개의 반려동물 동반 관광지를 찾았습니다!\n`,
  );

  if (foundTours.length > 0) {
    console.log("📋 발견된 관광지 목록:");
    foundTours.forEach((tour, index) => {
      console.log(`\n${index + 1}. 관광지 ID: ${tour.contentId}`);
      console.log(`   반려동물 정보:`, JSON.stringify(tour.petInfo, null, 2));
    });
  } else {
    console.log("⚠️  반려동물 정보가 있는 관광지를 찾지 못했습니다.");
    console.log("   - API에 반려동물 정보가 있는 관광지가 적을 수 있습니다.");
    console.log("   - 더 많은 관광지를 테스트해보세요.");
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error("❌ 스크립트 실행 중 에러:", error);
  process.exit(1);
});
