package com.oracle.Legal.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 분쟁 DTO (Data Transfer Object)
 * 
 * [원리]
 * DTO는 계층 간 데이터 전송에 사용됩니다.
 * 
 * Entity vs DTO:
 * - Entity: DB 테이블과 1:1 매핑, JPA가 관리
 * - DTO: API 요청/응답용, 필요한 필드만 포함
 * 
 * 왜 분리하는가?
 * 1. Entity에 민감한 필드가 있을 수 있음 (비밀번호 등)
 * 2. API 응답에 Entity에 없는 추가 정보 포함 가능
 * 3. Entity 변경이 API에 영향 주지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoonjangDto {
    
    // 기본 정보
    private Long boonjangId;
    private Long clientCode;
    private LocalDateTime boonjangDate;
    private String boonjangInput;
    private String boonjangOutput;
    
    // 분석 결과 (Entity에는 없지만 API 응답에 필요)
    private String classification;      // 분류 (민사, 형사 등)
    private String subType;             // 세부 유형 (소비자, 계약 등)
    private String summary;             // 요약
    private List<String> keywords;      // 키워드 태그
    private String judgment;            // 법률적 판단
    private List<String> relatedLaws;   // 관련 법령
    
    /**
     * 요청 DTO (내부 클래스)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String boonjangInput;
        private Long clientCode;  // 로그인한 사용자 코드 (선택)
    }
    
    /**
     * 응답 DTO (내부 클래스)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long boonjangId;
        private String classification;
        private String subType;
        private String summary;
        private List<String> keywords;
        private String judgment;
        private List<String> relatedLaws;
        private String boonjangInput;
        private LocalDateTime boonjangDate;
    }
}
