package com.oracle.Legal.ai;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    public Mono<AiDto.AnalyzeResponse> analyze(
            @RequestBody AiDto.AnalyzeRequest request
    ) {
        return aiService.analyze(request);
    }

    /**
     * 위험도 분석 API (Gemini 연동)
     * 
     * @param request 사건 텍스트
     * @return 승소율, 형량, 벌금, 위험도 점수 및 Gemini 피드백
     */
    @PostMapping("/risk-analyze")
    public Mono<AiDto.RiskAnalyzeResponse> riskAnalyze(
            @RequestBody AiDto.RiskAnalyzeRequest request
    ) {
        return aiService.riskAnalyze(request);
    }
}