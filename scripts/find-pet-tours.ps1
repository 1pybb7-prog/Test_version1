# 반려동물 정보가 있는 관광지 찾기 스크립트

$apiKey = "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc"
$baseUrl = "https://apis.data.go.kr/B551011/KorService2"

Write-Host "🔍 반려동물 정보가 있는 관광지 찾기 시작...`n" -ForegroundColor Cyan

$foundTours = @()

# 테스트할 지역과 타입 조합
$testConfigs = @(
    @{areaCode="1"; contentTypeId="12"; name="서울 관광지"},
    @{areaCode="6"; contentTypeId="12"; name="부산 관광지"},
    @{areaCode="39"; contentTypeId="12"; name="제주 관광지"},
    @{areaCode="1"; contentTypeId="14"; name="서울 문화시설"},
    @{areaCode="1"; contentTypeId="28"; name="서울 레포츠"},
    @{areaCode="32"; contentTypeId="32"; name="서울 숙박"}
)

foreach ($config in $testConfigs) {
    Write-Host "`n📋 $($config.name) 조회 중..." -ForegroundColor Yellow
    
    # 관광지 목록 조회
    $listParams = @{
        serviceKey = $apiKey
        MobileOS = "ETC"
        MobileApp = "MyTrip"
        _type = "json"
        areaCode = $config.areaCode
        contentTypeId = $config.contentTypeId
        numOfRows = "30"
        pageNo = "1"
    }
    
    $listQueryString = ($listParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $listUrl = "$baseUrl/areaBasedList2?$listQueryString"
    
    try {
        $listResponse = Invoke-RestMethod -Uri $listUrl -Method Get -ErrorAction Stop
        
        if ($listResponse.response.header.resultCode -ne "0000") {
            Write-Host "  ⚠️  API 에러: $($listResponse.response.header.resultMsg)" -ForegroundColor Red
            continue
        }
        
        $tours = @()
        if ($listResponse.response.body.items -and $listResponse.response.body.items.item) {
            if ($listResponse.response.body.items.item -is [Array]) {
                $tours = $listResponse.response.body.items.item
            } else {
                $tours = @($listResponse.response.body.items.item)
            }
        }
        
        if ($tours.Count -eq 0) {
            Write-Host "  ⚠️  관광지 없음" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "  ✅ $($tours.Count)개의 관광지 조회됨" -ForegroundColor Green
        Write-Host "  🔍 반려동물 정보 확인 중..." -ForegroundColor Cyan
        
        $checkedCount = 0
        $foundCount = 0
        
        # 각 관광지의 반려동물 정보 확인 (처음 20개만)
        foreach ($tour in $tours[0..[Math]::Min(19, $tours.Count - 1)]) {
            $petParams = @{
                serviceKey = $apiKey
                MobileOS = "ETC"
                MobileApp = "MyTrip"
                _type = "json"
                contentId = $tour.contentid
            }
            
            $petQueryString = ($petParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
            $petUrl = "$baseUrl/detailPetTour2?$petQueryString"
            
            try {
                $petResponse = Invoke-RestMethod -Uri $petUrl -Method Get -ErrorAction Stop
                
                if ($petResponse.response.header.resultCode -eq "0000") {
                    $totalCount = $petResponse.response.body.totalCount
                    $items = $petResponse.response.body.items
                    
                    # 반려동물 정보가 있는지 확인
                    if ($totalCount -gt 0 -and $items -ne "" -and $items -ne $null) {
                        if ($items.GetType().Name -eq "PSCustomObject" -and $items.item) {
                            $petInfo = $items.item
                            
                            # 반려동물 정보가 실제로 있는지 확인
                            $hasPetInfo = $false
                            if ($petInfo.chkpetleash -or $petInfo.chkpetsize -or $petInfo.chkpetplace -or $petInfo.petinfo) {
                                $hasPetInfo = $true
                            }
                            
                            if ($hasPetInfo) {
                                $foundCount++
                                $foundTours += @{
                                    contentId = $tour.contentid
                                    title = $tour.title
                                    areaCode = $config.areaCode
                                    contentTypeId = $config.contentTypeId
                                    petInfo = $petInfo
                                }
                                
                                Write-Host "`n  ✅ 발견! $($tour.title) (ID: $($tour.contentid))" -ForegroundColor Green
                                Write-Host "     - chkpetleash: $($petInfo.chkpetleash)" -ForegroundColor Gray
                                Write-Host "     - chkpetsize: $($petInfo.chkpetsize)" -ForegroundColor Gray
                                Write-Host "     - chkpetplace: $($petInfo.chkpetplace)" -ForegroundColor Gray
                                Write-Host "     - petinfo: $($petInfo.petinfo)" -ForegroundColor Gray
                                
                                # 5개 찾으면 충분
                                if ($foundTours.Count -ge 5) {
                                    break
                                }
                            }
                        }
                    }
                }
            } catch {
                # 에러 무시하고 계속
            }
            
            $checkedCount++
            Start-Sleep -Milliseconds 300
        }
        
        Write-Host "  📊 확인: $checkedCount 개, 발견: $foundCount 개" -ForegroundColor Cyan
        
        if ($foundTours.Count -ge 5) {
            break
        }
    } catch {
        Write-Host "  ⚠️  조회 실패: $_" -ForegroundColor Red
    }
}

Write-Host "`n`n🎉 결과: 총 $($foundTours.Count)개의 반려동물 정보가 있는 관광지를 찾았습니다!`n" -ForegroundColor Green

if ($foundTours.Count -gt 0) {
    Write-Host "📋 발견된 관광지 목록:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $foundTours.Count; $i++) {
        $tour = $foundTours[$i]
        Write-Host "`n$($i + 1). $($tour.title) (ID: $($tour.contentId))" -ForegroundColor Yellow
        Write-Host "   지역: $($tour.areaCode), 타입: $($tour.contentTypeId)" -ForegroundColor Gray
        Write-Host "   반려동물 정보:" -ForegroundColor Gray
        $tour.petInfo | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  반려동물 정보가 있는 관광지를 찾지 못했습니다." -ForegroundColor Red
    Write-Host "   - API에 반려동물 정보가 있는 관광지가 적을 수 있습니다." -ForegroundColor Yellow
    Write-Host "   - 더 많은 관광지를 테스트해보세요." -ForegroundColor Yellow
}

