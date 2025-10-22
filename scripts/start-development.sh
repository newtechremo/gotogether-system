#!/bin/bash

echo "🚀 GoTogether 개발 프로세스 시작"

# 프로젝트 매니저 초기화
claude-code run project-manager "프로젝트 초기화 및 백로그 생성"

# 기능별 개발 사이클
FEATURES=("auth" "facility" "device" "rental" "statistics")

for feature in "${FEATURES[@]}"; do
    echo "📌 $feature 기능 개발 시작"
    
    # 백엔드 개발
    claude-code run backend-dev "Implement $feature module"
    
    # 백엔드 검수
    claude-code run backend-review "Review $feature backend code"
    
    # 백엔드 테스트
    claude-code run backend-test "Test $feature backend"
    
    # 프론트 API 연결
    claude-code run frontend-api "Connect $feature APIs"
    
    # 프론트 검수
    claude-code run frontend-review "Review $feature frontend"
    
    # E2E 테스트
    claude-code run frontend-test "E2E test for $feature"
    
    # 진행상황 업데이트
    claude-code run project-manager "Update progress for $feature"
done

echo "✅ 개발 사이클 완료"