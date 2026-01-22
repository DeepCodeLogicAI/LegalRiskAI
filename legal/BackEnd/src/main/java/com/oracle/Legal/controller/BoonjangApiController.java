package com.oracle.Legal.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.oracle.Legal.dto.BoonjangDto;
import com.oracle.Legal.service.BoonjangService;

import lombok.RequiredArgsConstructor;

/**
 * 분쟁 유형 분류 API 컨트롤러
 * 
 * [역할]
 * - React 프론트엔드에서 호출하는 REST API 엔드포인트 제공
 * - /api/boonjang 경로로 분쟁 데이터 저장 및 조회
 * 
 * [엔드포인트]
 * - POST /api/boonjang : 분쟁 내용 저장 및 분석
 * - GET /api/boonjang : 분쟁 목록 조회
 * 
 * [데이터 흐름]
 * React → POST /api/boonjang → Controller → Service → Repository → DB
 *                                    ↓
 *                              분석 결과 반환
 */
@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api/boonjang")
@RequiredArgsConstructor
public class BoonjangApiController {
    
    private final BoonjangService boonjangService;
    
    /**
     * 분쟁 내용 분석 및 저장
     * 
     * [요청 형식]
     * POST /api/boonjang
     * Content-Type: application/json
     * {
     *   "boonjangInput": "분쟁 내용...",
     *   "clientCode": 1001  (선택, 로그인한 사용자)
     * }
     * 
     * [응답 형식]
     * {
     *   "boonjangId": 1001,
     *   "classification": "민사",
     *   "subType": "소비자",
     *   "summary": "...",
     *   "keywords": ["#청약철회", ...],
     *   "judgment": "...",
     *   "relatedLaws": ["전자상거래법", ...]
     * }
     */
    @PostMapping
    public ResponseEntity<BoonjangDto.Response> analyzeBoonjang(
            @RequestBody BoonjangDto.Request request) {
        
        BoonjangDto.Response result = boonjangService.analyze(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 분쟁 목록 조회
     * 
     * [응답 형식]
     * [
     *   { "boonjangId": 1001, "boonjangInput": "...", "boonjangDate": "..." },
     *   ...
     * ]
     */
    @GetMapping
    public ResponseEntity<List<BoonjangDto.Response>> getBoonjangList() {
        List<BoonjangDto.Response> list = boonjangService.findAll();
        return ResponseEntity.ok(list);
    }
}
