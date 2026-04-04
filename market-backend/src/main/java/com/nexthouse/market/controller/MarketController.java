package com.nexthouse.market.controller;

import com.nexthouse.market.service.MarketDataService;
import com.nexthouse.market.service.WhatIfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;
    private final WhatIfService whatIfService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMarketStats(
            @RequestParam(required = false) String segment,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) Integer maxYear) {
        return ResponseEntity.ok(marketDataService.getAggregateStats(segment, minYear, maxYear));
    }

    @GetMapping("/distribution")
    public ResponseEntity<Map<String, Object>> getDistribution() {
        return ResponseEntity.ok(Map.of(
                "labels", java.util.List.of("Starter (<200k)", "Mid-Tier (200k-300k)", "Luxury (>300k)"),
                "values", marketDataService.getDistribution()));
    }

    @PostMapping("/what-if")
    public ResponseEntity<Map<String, Object>> simulateWhatIfScenario(@RequestBody Map<String, Object> params) {
        Double simulatedOutcome = whatIfService.runSimulation(params);
        return ResponseEntity.ok(Map.of(
                "scenario", params,
                "projectedValue", simulatedOutcome,
                "status", "simulation_complete"));
    }
}
