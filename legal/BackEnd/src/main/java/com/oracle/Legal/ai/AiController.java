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
}