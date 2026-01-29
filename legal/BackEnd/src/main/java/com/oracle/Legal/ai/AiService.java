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
}