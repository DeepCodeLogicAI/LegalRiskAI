package com.oracle.Legal.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oracle.Legal.domain.Boonjang;
import com.oracle.Legal.dto.BoonjangDto;
import com.oracle.Legal.repository.BoonjangRepository;

import lombok.RequiredArgsConstructor;

/**
 * 분쟁 서비스
 * 
 * [역할]
 * - 비즈니스 로직 처리
 * - 트랜잭션 관리
 * - Entity ↔ DTO 변환
 * 
 * [흐름]
 * Controller → Service → Repository → DB
 *           ↑           ↑
 *          DTO        Entity
 * 
 * [원리]
 * @Service: 스프링이 이 클래스를 서비스 빈으로 등록
 * @Transactional: 메서드 실행 시 트랜잭션 시작, 완료 시 커밋, 예외 시 롤백
 * @RequiredArgsConstructor: final 필드에 대한 생성자 자동 생성 (의존성 주입)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoonjangService {
    
    private final BoonjangRepository boonjangRepository;
    
    /**
     * 분쟁 내용 분석 및 저장
     * 
     * [처리 순서]
     * 1. 입력 데이터 검증
     * 2. Entity 생성 및 저장
     * 3. 분석 수행 (현재는 임시 로직)
     * 4. 결과 DTO 반환
     * 
     * @param request 분쟁 입력 요청
     * @return 분석 결과 DTO
     */
    @Transactional
    public BoonjangDto.Response analyze(BoonjangDto.Request request) {
        
        // 1. Entity 생성
        Boonjang boonjang = Boonjang.builder()
            .clientCode(request.getClientCode() != null ? request.getClientCode() : 0L)
            .boonjangDate(LocalDateTime.now())
            .boonjangInput(request.getBoonjangInput())
            .boonjangOutput(null)  // 분석 후 업데이트
            .build();
        
        // 2. DB 저장
        Boonjang saved = boonjangRepository.save(boonjang);
        
        // 3. 분석 수행 (TODO: 실제 AI 모델 연동)
        AnalysisResult analysis = analyzeBoonjangContent(request.getBoonjangInput());
        
        // 4. 분석 결과를 Entity에 저장
        saved.setBoonjangOutput(analysis.getSummary());
        boonjangRepository.save(saved);
        
        // 5. 응답 DTO 생성
        return BoonjangDto.Response.builder()
            .boonjangId(saved.getBoonjangId())
            .classification(analysis.getClassification())
            .subType(analysis.getSubType())
            .summary(analysis.getSummary())
            .keywords(analysis.getKeywords())
            .judgment(analysis.getJudgment())
            .relatedLaws(analysis.getRelatedLaws())
            .boonjangInput(saved.getBoonjangInput())
            .boonjangDate(saved.getBoonjangDate())
            .build();
    }
    
    /**
     * 분쟁 목록 조회
     */
    public List<BoonjangDto.Response> findAll() {
        return boonjangRepository.findAllByOrderByBoonjangDateDesc()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Entity → Response DTO 변환
     */
    private BoonjangDto.Response toResponse(Boonjang entity) {
        return BoonjangDto.Response.builder()
            .boonjangId(entity.getBoonjangId())
            .boonjangInput(entity.getBoonjangInput())
            .boonjangDate(entity.getBoonjangDate())
            .build();
    }
    
    /**
     * 분쟁 내용 분석 (임시 로직)
     * 
     * [TODO]
     * - 실제 AI 모델 연동
     * - 또는 키워드 기반 규칙 적용
     */
    private AnalysisResult analyzeBoonjangContent(String input) {
        // 임시 분석 로직 - 키워드 기반
        String classification = "민사";
        String subType = "소비자";
        List<String> keywords = Arrays.asList("#청약철회", "#전자상거래", "#환불거부");
        List<String> relatedLaws = Arrays.asList(
            "전자상거래 등에서의 소비자보호에 관한 법률",
            "소비자기본법"
        );
        
        // 키워드 기반 간단한 분류
        if (input.contains("계약") || input.contains("위약금")) {
            subType = "계약";
            keywords = Arrays.asList("#계약위반", "#위약금", "#손해배상");
            relatedLaws = Arrays.asList("민법 제390조 (채무불이행)", "민법 제398조 (손해배상의 예정)");
        }
        if (input.contains("임대") || input.contains("월세") || input.contains("보증금")) {
            subType = "부동산";
            keywords = Arrays.asList("#임대차", "#보증금", "#월세");
            relatedLaws = Arrays.asList("주택임대차보호법", "민법 제618조 (임대차의 의의)");
        }
        if (input.contains("형사") || input.contains("고소") || input.contains("사기")) {
            classification = "형사";
            keywords = Arrays.asList("#사기", "#고소", "#형사처벌");
            relatedLaws = Arrays.asList("형법 제347조 (사기)", "형사소송법");
        }
        
        String summary = "온라인 쇼핑몰에서 구매한 전자제품을 7일 이내에 환불 요청했으나 판매자가 개봉을 이유로 거부하고 있는 상황입니다.";
        String judgment = "온라인 쇼핑몰에서 구매한 전자제품을 7일 이내에 환불 요청했으나 판매자가 개봉을 이유로 거부하고 있는 상황입니다. 이는 전자상거래법상 보장되는 청약철회권과 판매자의 자체 규정이 충돌하는 분쟁입니다.";
        
        return new AnalysisResult(classification, subType, summary, keywords, judgment, relatedLaws);
    }
    
    /**
     * 분석 결과 내부 클래스
     */
    private static class AnalysisResult {
        private final String classification;
        private final String subType;
        private final String summary;
        private final List<String> keywords;
        private final String judgment;
        private final List<String> relatedLaws;
        
        public AnalysisResult(String classification, String subType, String summary, 
                             List<String> keywords, String judgment, List<String> relatedLaws) {
            this.classification = classification;
            this.subType = subType;
            this.summary = summary;
            this.keywords = keywords;
            this.judgment = judgment;
            this.relatedLaws = relatedLaws;
        }
        
        public String getClassification() { return classification; }
        public String getSubType() { return subType; }
        public String getSummary() { return summary; }
        public List<String> getKeywords() { return keywords; }
        public String getJudgment() { return judgment; }
        public List<String> getRelatedLaws() { return relatedLaws; }
    }
}
