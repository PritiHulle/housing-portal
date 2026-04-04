package com.nexthouse.market.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class WhatIfService {

    private final RestClient restClient;

    public WhatIfService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://housing-api-n7yg.onrender.com")
                .build();
    }

    public Double runSimulation(Map<String, Object> adjustedParameters) {
        try {
            // Forward dynamic parameters to Python ML Container for inference
            Map<String, Object> response = restClient.post()
                    .uri("/predict")
                    .body(adjustedParameters)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("prediction")) {
                Object predictionObj = response.get("prediction");
                if (predictionObj instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) predictionObj;
                    if (!list.isEmpty() && list.get(0) instanceof Number) {
                        return ((Number) list.get(0)).doubleValue();
                    }
                } else if (predictionObj instanceof Number) {
                    return ((Number) predictionObj).doubleValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to contact Python ML Container: " + e.getMessage());
        }
        return 0.0;
    }
}
