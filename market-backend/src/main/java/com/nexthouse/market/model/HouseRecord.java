package com.nexthouse.market.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HouseRecord {
    private int squareFootage;
    private int bedrooms;
    private double bathrooms;
    private int yearBuilt;
    private int lotSize;
    private double distance;
    private double schoolRating;
    private double price;
}
