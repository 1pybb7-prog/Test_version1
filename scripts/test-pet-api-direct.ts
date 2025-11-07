/**
 * 반려동물 동반 관광지 API 직접 테스트
 *
 * 이전에 찾은 관광지 ID들로 실제 API를 호출해서 데이터가 제대로 반환되는지 확인합니다.
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

// 이전 테스트에서 찾은 반려동물 동반 관광지 ID들
const knownPetTourIds = [
  "1887866", // 전구역 동반가능
  "126644", // 일부구역 동반가능 (간현관광지)
  "2024432", // 전구역 동반가능 (가우도)
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

    // 🔥 전체 응답 데이터 출력
    console.log(`\n   📋 전체 응답 데이터:`);
    console.log(JSON.stringify(data, null, 2));

    // API 응답 구조 확인
    console.log(`\n   📊 응답 구조:`, {
      resultCode: data.response?.header?.resultCode,
      resultMsg: data.response?.header?.resultMsg,
      totalCount: data.response?.body?.totalCount,
      hasItems: !!data.response?.body?.items,
      itemsType: typeof data.response?.body?.items,
    });

    // API 에러 체크
    if (data.response?.header?.resultCode !== "0000") {
      console.log(
        `   ⚠️  API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
      return null;
    }

    // items가 빈 문자열이거나 null인 경우
    if (
      !data.response.body.items ||
      (typeof data.response.body.items === "string" &&
        data.response.body.items === "")
    ) {
      console.log(`   ℹ️  반려동물 정보 없음 (items가 비어있음)`);
      return null;
    }

    // items가 객체가 아닌 경우
    if (typeof data.response.body.items !== "object") {
      console.log(
        `   ℹ️  반려동물 정보 없음 (items 타입: ${typeof data.response.body
          .items})`,
      );
      return null;
    }

    const items = data.response.body.items.item;
    if (!items) {
      console.log(`   ℹ️  반려동물 정보 없음 (item이 없음)`);
      return null;
    }

    const petInfo = Array.isArray(items) ? items[0] : items;

    console.log(`\n   ✅ 반려동물 정보 발견!`);
    console.log(`      - contentid: ${petInfo.contentid || "없음"}`);
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

    // 🔥 전체 petInfo 객체 출력
    console.log(`\n   📋 전체 petInfo 객체:`);
    console.log(JSON.stringify(petInfo, null, 2));

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
 * 메인 테스트 함수
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🐾 반려동물 동반 관광지 API 직접 테스트");
  console.log("=".repeat(60));
  console.log(`🔑 API 키: ${API_KEY.substring(0, 20)}...`);
  console.log(`📅 테스트 시간: ${new Date().toLocaleString("ko-KR")}\n`);

  console.log(`📋 테스트할 관광지 ID: ${knownPetTourIds.join(", ")}\n`);

  let foundCount = 0;
  const foundTours: Array<{ contentId: string; petInfo: any }> = [];

  for (const contentId of knownPetTourIds) {
    const petInfo = await getPetTourInfo(contentId);
    if (petInfo) {
      foundCount++;
      foundTours.push({ contentId, petInfo });
    }
    // API 호출 간격
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

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
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error("❌ 스크립트 실행 중 에러:", error);
  process.exit(1);
});
