/**
 * 반려동물 동반 관광지 API 간단 테스트
 *
 * 이전에 찾은 관광지 ID 하나로만 테스트해서 API가 정상 작동하는지 확인합니다.
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const API_KEY =
  "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";

// 이전 테스트에서 찾은 반려동물 동반 관광지 ID (하나만 테스트)
const testContentId = "126644"; // 간현관광지

async function testPetTourAPI() {
  const searchParams = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
    contentId: testContentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

  console.log("=".repeat(60));
  console.log("🐾 반려동물 동반 관광지 API 간단 테스트");
  console.log("=".repeat(60));
  console.log(`🔑 API 키: ${API_KEY.substring(0, 20)}...`);
  console.log(`📋 테스트 관광지 ID: ${testContentId}`);
  console.log(`📅 테스트 시간: ${new Date().toLocaleString("ko-KR")}\n`);
  console.log(`🔗 전체 URL: ${url}\n`);

  try {
    console.log("⏳ API 호출 중...\n");
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`❌ HTTP 에러: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();

    console.log("✅ API 호출 성공!\n");

    // 🔥 전체 응답 데이터 출력
    console.log("📋 전체 응답 데이터:");
    console.log(JSON.stringify(data, null, 2));

    // API 응답 구조 확인
    console.log("\n📊 응답 구조 요약:");
    console.log({
      resultCode: data.response?.header?.resultCode,
      resultMsg: data.response?.header?.resultMsg,
      totalCount: data.response?.body?.totalCount,
      hasItems: !!data.response?.body?.items,
      itemsType: typeof data.response?.body?.items,
    });

    // API 에러 체크
    if (data.response?.header?.resultCode !== "0000") {
      console.log(
        `\n⚠️  API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
      return;
    }

    // items가 빈 문자열이거나 null인 경우
    if (
      !data.response.body.items ||
      (typeof data.response.body.items === "string" &&
        data.response.body.items === "")
    ) {
      console.log("\nℹ️  반려동물 정보 없음 (items가 비어있음)");
      return;
    }

    // items가 객체가 아닌 경우
    if (typeof data.response.body.items !== "object") {
      console.log(
        `\nℹ️  반려동물 정보 없음 (items 타입: ${typeof data.response.body
          .items})`,
      );
      return;
    }

    const items = data.response.body.items.item;
    if (!items) {
      console.log("\nℹ️  반려동물 정보 없음 (item이 없음)");
      return;
    }

    const petInfo = Array.isArray(items) ? items[0] : items;

    console.log("\n✅ 반려동물 정보 발견!\n");
    console.log("📋 반려동물 정보 상세:");
    console.log(JSON.stringify(petInfo, null, 2));

    console.log("\n📊 주요 필드:");
    console.log(`   - contentid: ${petInfo.contentid || "없음"}`);
    console.log(
      `   - acmpyTypeCd (동반 타입): ${petInfo.acmpyTypeCd || "없음"}`,
    );
    console.log(
      `   - acmpyPsblCpam (동반 가능): ${petInfo.acmpyPsblCpam || "없음"}`,
    );
    console.log(
      `   - acmpyNeedMtr (필요 사항): ${petInfo.acmpyNeedMtr || "없음"}`,
    );
    console.log(
      `   - etcAcmpyInfo (기타 정보): ${petInfo.etcAcmpyInfo || "없음"}`,
    );

    console.log("\n✅ 테스트 완료!");
  } catch (error) {
    console.error(
      "\n❌ 에러 발생:",
      error instanceof Error ? error.message : error,
    );
  }
}

// 스크립트 실행
testPetTourAPI().catch((error) => {
  console.error("❌ 스크립트 실행 중 에러:", error);
  process.exit(1);
});
