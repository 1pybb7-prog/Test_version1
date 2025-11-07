/**
 * 반려동물 API 테스트 스크립트
 *
 * 실제 API를 호출해서 응답 구조를 확인합니다.
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
};

// 테스트할 관광지 ID들 (반려동물 정보가 있을 가능성이 있는 관광지)
const testContentIds = [
  "2750144", // 로그에서 본 ID
  "2805408",
  "2750143",
  "127480",
  "1433504",
  "2901530",
  "1797757",
  "126273",
  "2019720",
  "2788416",
  "2866408",
  "1965380",
];

/**
 * API 키를 환경 변수에서 가져오기
 * 주의: 실제 환경 변수는 .env.local에 있으므로 이 스크립트는 직접 실행할 수 없습니다.
 * 대신 Next.js 서버에서 실행되거나, 환경 변수를 직접 입력해야 합니다.
 */
async function testPetTourAPI(contentId: string, serviceKey: string) {
  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

  console.log(`\n=== 테스트: contentId=${contentId} ===`);
  console.log(`URL: ${url.substring(0, 100)}...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ HTTP 에러: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();

    console.log(`\n📋 응답 구조:`);
    console.log(`- resultCode: ${data.response?.header?.resultCode}`);
    console.log(`- resultMsg: ${data.response?.header?.resultMsg}`);
    console.log(`- totalCount: ${data.response?.body?.totalCount}`);
    console.log(`- items 타입: ${typeof data.response?.body?.items}`);
    console.log(`- items 값:`, data.response?.body?.items);

    if (data.response?.body?.items) {
      if (
        typeof data.response.body.items === "object" &&
        "item" in data.response.body.items
      ) {
        const item = data.response.body.items.item;
        console.log(`\n✅ item 데이터:`);
        console.log(JSON.stringify(item, null, 2));
      } else {
        console.log(`\n⚠️ items가 객체가 아니거나 item 속성이 없습니다.`);
      }
    } else {
      console.log(`\n⚠️ items가 없거나 빈 문자열입니다.`);
    }
  } catch (error) {
    console.error(`❌ 에러 발생:`, error);
  }
}

/**
 * 메인 함수
 *
 * 사용법:
 * 1. 환경 변수에서 API 키를 가져와서 실행
 * 2. 또는 직접 API 키를 입력해서 실행
 */
async function main() {
  // 환경 변수에서 API 키 가져오기 (Node.js 환경에서만 작동)
  const serviceKey =
    process.env.NEXT_PUBLIC_TOUR_PET_API_KEY || process.env.TOUR_PET_API_KEY;

  if (!serviceKey) {
    console.error("❌ API 키가 설정되지 않았습니다.");
    console.log(
      "환경 변수 NEXT_PUBLIC_TOUR_PET_API_KEY 또는 TOUR_PET_API_KEY를 설정해주세요.",
    );
    console.log("\n또는 직접 API 키를 입력해서 테스트할 수 있습니다:");
    console.log(
      "node -e \"require('./scripts/test-pet-api.ts').testWithKey('YOUR_API_KEY')\"",
    );
    return;
  }

  console.log(`🔑 API 키 확인: ${serviceKey.substring(0, 8)}...`);
  console.log(`\n🧪 ${testContentIds.length}개의 관광지 ID로 테스트 시작...\n`);

  // 각 관광지 ID로 테스트
  for (const contentId of testContentIds) {
    await testPetTourAPI(contentId, serviceKey);
    // API 호출 간격 (너무 빠르게 호출하지 않도록)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n✅ 테스트 완료!`);
}

// 직접 API 키를 입력해서 테스트하는 함수
export async function testWithKey(apiKey: string) {
  console.log(`🔑 API 키 사용: ${apiKey.substring(0, 8)}...`);
  console.log(`\n🧪 ${testContentIds.length}개의 관광지 ID로 테스트 시작...\n`);

  for (const contentId of testContentIds) {
    await testPetTourAPI(contentId, apiKey);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n✅ 테스트 완료!`);
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}
