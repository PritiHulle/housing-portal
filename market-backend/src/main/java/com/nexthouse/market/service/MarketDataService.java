package com.nexthouse.market.service;

import com.nexthouse.market.model.HouseRecord;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MarketDataService {
    private final List<HouseRecord> dataset = new ArrayList<>();

    @PostConstruct
    public void init() {
        try {
            var resource = getClass().getClassLoader().getResource("data/House Price Dataset.csv");
            if (resource == null) {
                throw new RuntimeException("CSV file not found in resources");
            }
            List<String> lines = Files.readAllLines(Paths.get(resource.toURI()));
            for (int i = 1; i < lines.size(); i++) {
                String[] parts = lines.get(i).split(",");
                if (parts.length < 9)
                    continue;
                dataset.add(HouseRecord.builder()
                        .squareFootage(Integer.parseInt(parts[1].trim()))
                        .bedrooms(Integer.parseInt(parts[2].trim()))
                        .bathrooms(Double.parseDouble(parts[3].trim()))
                        .yearBuilt(Integer.parseInt(parts[4].trim()))
                        .lotSize(Integer.parseInt(parts[5].trim()))
                        .distance(Double.parseDouble(parts[6].trim()))
                        .schoolRating(Double.parseDouble(parts[7].trim()))
                        .price(Double.parseDouble(parts[8].trim()))
                        .build());
            }
            System.out.println("Loaded dataset size: " + dataset.size());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Map<String, Object> getAggregateStats(String segment, Integer minYear, Integer maxYear) {
        List<HouseRecord> filtered = dataset.stream().filter(r -> {
            if (minYear != null && r.getYearBuilt() < minYear)
                return false;
            if (maxYear != null && r.getYearBuilt() > maxYear)
                return false;
            if (segment != null && !segment.equals("all")) {
                if (segment.equals("luxury") && r.getPrice() <= 300000)
                    return false;
                if (segment.equals("mid") && (r.getPrice() < 200000 || r.getPrice() > 300000))
                    return false;
                if (segment.equals("starter") && r.getPrice() >= 200000)
                    return false;
            }
            return true;
        }).toList();

        long total = filtered.size();
        double avgPrice = filtered.stream().mapToDouble(HouseRecord::getPrice).average().orElse(0.0);
        double avgSqft = filtered.stream().mapToInt(HouseRecord::getSquareFootage).average().orElse(0.0);

        return Map.of(
                "totalProperties", total,
                "avgPrice", Math.round(avgPrice),
                "avgSqft", Math.round(avgSqft),
                "topSegment", total > 0 ? "Analyzed Slice" : "N/A");
    }

    public List<Double> getDistribution() {
        double starterAvg = dataset.stream().filter(r -> r.getPrice() < 200000).mapToDouble(HouseRecord::getPrice)
                .average().orElse(0.0);
        double midAvg = dataset.stream().filter(r -> r.getPrice() >= 200000 && r.getPrice() < 300000)
                .mapToDouble(HouseRecord::getPrice).average().orElse(0.0);
        double luxuryAvg = dataset.stream().filter(r -> r.getPrice() >= 300000).mapToDouble(HouseRecord::getPrice)
                .average().orElse(0.0);
        return List.of(starterAvg, midAvg, luxuryAvg);
    }
}
