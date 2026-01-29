package com.oracle.Legal.ai;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Service
public class AiService {

    private final WebClient aiWebClient;

    public AiService(WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    public Mono<AiDto.AnalyzeResponse> analyze(AiDto.AnalyzeRequest request) {
        return aiWebClient.post()
                .uri("/analyze")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiDto.AnalyzeResponse.class);
    }

    /**
     * 위험도 분석 API 호출 (Gemini 연동)
     * - 승소율, 형량, 벌금, 위험도 점수 예측
     * - Gemini를 통한 상세 피드백 생성
     */
    public Mono<AiDto.RiskAnalyzeResponse> riskAnalyze(AiDto.RiskAnalyzeRequest request) {
        return aiWebClient.post()
                .uri("/risk-analyze")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiDto.RiskAnalyzeResponse.class);
    }
}