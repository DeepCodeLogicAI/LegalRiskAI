package com.oracle.Legal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Boonjang;

/**
 * 분쟁 레포지토리
 * 
 * [원리]
 * JpaRepository를 상속하면 기본 CRUD 메서드가 자동 제공됩니다:
 * - save(entity): INSERT 또는 UPDATE
 * - findById(id): SELECT by ID
 * - findAll(): SELECT ALL
 * - deleteById(id): DELETE by ID
 * 
 * 추가 메서드는 메서드 이름 규칙으로 자동 생성:
 * - findByClientCode(code) → SELECT * FROM BOONJANG WHERE CLIENT_CODE = ?
 * - findByBoonjangDateDesc() → SELECT * ... ORDER BY BOONJANG_DATE DESC
 */
@Repository
public interface BoonjangRepository extends JpaRepository<Boonjang, Long> {
    
    /**
     * 회원 코드로 분쟁 목록 조회
     * 
     * [JPA 쿼리 메서드 규칙]
     * findBy + 필드명 → WHERE 조건 자동 생성
     */
    List<Boonjang> findByClientCode(Long clientCode);
    
    /**
     * 최신 순으로 전체 조회
     */
    List<Boonjang> findAllByOrderByBoonjangDateDesc();
}
