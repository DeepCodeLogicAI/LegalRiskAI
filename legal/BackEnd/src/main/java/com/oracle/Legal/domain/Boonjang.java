package com.oracle.Legal.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 분쟁 엔티티
 * 
 * [DB 테이블: BOONJANG]
 * - BOONJANG_ID: 분쟁 ID (기본키, 시퀀스)
 * - CLIENT_CODE: 회원 코드 (외래키)
 * - BOONJANG_DATE: 등록 일시
 * - BOONJANG_INPUT: 분쟁 내용 입력
 * - BOONJANG_OUTPUT: 분석 결과 출력
 * 
 * [원리]
 * @Entity: JPA가 이 클래스를 DB 테이블과 매핑
 * @Table: 실제 테이블 이름 지정
 * @Id + @GeneratedValue: 기본키 자동 생성 전략
 * @SequenceGenerator: Oracle 시퀀스 사용
 */
@Entity
@Table(name = "BOONJANG")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SequenceGenerator(
    name = "boonjang_seq_gen",
    sequenceName = "BOONJANG_SEQ",
    initialValue = 1,
    allocationSize = 1
)
public class Boonjang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "boonjang_seq_gen")
    @Column(name = "BOONJANG_ID")
    private Long boonjangId;
    
    @Column(name = "CLIENT_CODE")
    private Long clientCode;
    
    @Column(name = "BOONJANG_DATE")
    private LocalDateTime boonjangDate;
    
    @Lob
    @Column(name = "BOONJANG_INPUT")
    private String boonjangInput;
    
    @Lob
    @Column(name = "BOONJANG_OUTPUT")
    private String boonjangOutput;
}
