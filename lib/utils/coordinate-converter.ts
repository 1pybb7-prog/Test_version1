/**
 * @file coordinate-converter.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API는 KATEC 좌표계를 사용하며, Google 지도는 WGS84 좌표계를 사용합니다.
 * 이 모듈은 KATEC 좌표계를 WGS84 좌표계로 변환하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. KATEC 정수형 좌표를 실수형으로 변환
 * 2. KATEC → WGS84 좌표 변환 (proj4 라이브러리 사용)
 * 3. Google Maps에서 사용할 수 있는 형식으로 반환
 *
 * 좌표 변환 과정:
 * 1. KATEC 정수형 좌표를 실수형으로 변환 (mapx / 10000000, mapy / 10000000)
 * 2. proj4 라이브러리를 사용하여 한국 TM 좌표계(EPSG:5181) → WGS84(EPSG:4326) 변환
 * 3. Google Maps 형식 (lat, lng)으로 반환
 *
 * @see {@link /docs/prd.md#53-좌표-변환} - PRD 문서의 좌표 변환 섹션
 */

import proj4 from "proj4";

/**
 * Google Maps에서 사용할 수 있는 좌표 타입
 */
export interface GoogleLatLng {
  /** 위도 (latitude) */
  lat: number;
  /** 경도 (longitude) */
  lng: number;
}

/**
 * EPSG:5181 좌표계 정의 (한국 2000 / Central Belt 2010)
 * proj4가 EPSG 코드를 인식할 수 있도록 좌표계 정의를 등록합니다.
 */
if (typeof proj4 !== "undefined" && !proj4.defs("EPSG:5181")) {
  proj4.defs(
    "EPSG:5181",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs",
  );
}

/**
 * EPSG:4326 좌표계 정의 (WGS84)
 * WGS84는 기본적으로 정의되어 있지만, 명시적으로 정의합니다.
 */
if (typeof proj4 !== "undefined" && !proj4.defs("EPSG:4326")) {
  proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
}

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns Google Maps에서 사용할 수 있는 좌표 객체 { lat, lng }
 *
 * @example
 * ```typescript
 * const { lat, lng } = convertKatecToWgs84("1290000000", "350000000");
 * // { lat: 35.123456, lng: 129.123456 }
 * ```
 */
export function convertKatecToWgs84(mapx: string, mapy: string): GoogleLatLng {
  try {
    // 1. KATEC 정수형 좌표를 실수형으로 변환
    const katecX = parseFloat(mapx) / 10000000; // 경도 (X)
    const katecY = parseFloat(mapy) / 10000000; // 위도 (Y)

    // 유효성 검사
    if (
      isNaN(katecX) ||
      isNaN(katecY) ||
      !isFinite(katecX) ||
      !isFinite(katecY)
    ) {
      throw new Error(`유효하지 않은 좌표 값: mapx=${mapx}, mapy=${mapy}`);
    }

    // 2. KATEC → WGS84 변환 (proj4 라이브러리 사용)
    // 한국 TM 좌표계 (EPSG:5181) → WGS84 (EPSG:4326)
    // proj4는 [경도(X), 위도(Y)] 순서로 입력받습니다.
    const [wgs84Lng, wgs84Lat] = proj4(
      "EPSG:5181", // 한국 2000 / Central Belt 2010 (KATEC)
      "EPSG:4326", // WGS84
      [katecX, katecY],
    );

    // 결과 유효성 검사
    if (
      isNaN(wgs84Lat) ||
      isNaN(wgs84Lng) ||
      !isFinite(wgs84Lat) ||
      !isFinite(wgs84Lng)
    ) {
      throw new Error(
        `좌표 변환 결과가 유효하지 않습니다: lat=${wgs84Lat}, lng=${wgs84Lng}`,
      );
    }

    // 3. Google Maps 형식으로 반환 (위도, 경도 순서)
    return {
      lat: wgs84Lat,
      lng: wgs84Lng,
    };
  } catch (error) {
    console.error(
      `[convertKatecToWgs84] 좌표 변환 실패: mapx=${mapx}, mapy=${mapy}`,
      error,
    );
    throw error;
  }
}

/**
 * TourItem 또는 TourDetail의 좌표를 Google Maps 형식으로 변환
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns Google Maps에서 사용할 수 있는 좌표 객체 { lat, lng }
 *
 * @example
 * ```typescript
 * const tourItem: TourItem = { mapx: "1290000000", mapy: "350000000", ... };
 * const { lat, lng } = convertTourCoordinates(tourItem.mapx, tourItem.mapy);
 * ```
 */
export function convertTourCoordinates(
  mapx: string,
  mapy: string,
): GoogleLatLng {
  return convertKatecToWgs84(mapx, mapy);
}
