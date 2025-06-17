# Dashboard Variable Explanations

## 1. Reprise of Original Explanation

The variables `arrJoursDuMois_Type1` and `arrJoursDuMois_Type2` (lines 211-212) are arrays used to track daily unit counts for two different types of robots:

```typescript
const arrJoursDuMois_Type1: string[] = [...arrJoursDuMois];  // Type 1 (time-based)
const arrJoursDuMois_Type2: string[] = [...arrJoursDuMois];  // Type 2 (other)
```

- Initialized as 31-element arrays (one per day) filled with "0"
- Used to accumulate daily values when aggregating data across multiple robots
- Type 1 is for time-based robots (lines 275-277)
- Type 2 is for other robot types (lines 277-279)

## 2. Explanation of totalUnitesMoisN... Variables

These variables aggregate totals across different time periods (lines 215-222):

```typescript
let totalUnitesMoisCourant_Type1 = 0;  // Current month (Type 1)
let totalUnitesMoisN1_Type1 = 0;       // Month N-1 (Type 1)
let totalUnitesMoisN2_Type1 = 0;       // Month N-2 (Type 1)
let totalUnitesMoisN3_Type1 = 0;       // Month N-3 (Type 1)
let totalUnitesMoisCourant_Type2 = 0;  // Current month (Type 2)
let totalUnitesMoisN1_Type2 = 0;       // Month N-1 (Type 2)
let totalUnitesMoisN2_Type2 = 0;       // Month N-2 (Type 2)
let totalUnitesMoisN3_Type2 = 0;       // Month N-3 (Type 2)
```

Key roles:
- Track aggregated values for display in charts/tables
- Separated by robot type (Type 1 = time-based, Type 2 = others)
- Updated when processing each robot's data (lines 259-269)
- Used to populate the final merged data structure (lines 291-303)

## 3. Calculation of Histogram Values

The histogram values are calculated through:

1. **Daily Aggregation** (lines 270-281):
   - Loops through each day (1-31)
   - For each robot, checks if data exists for that date
   - Accumulates values into the appropriate type array
   - Time-based robots go to `arrJoursDuMois_Type1`
   - Other robots go to `arrJoursDuMois_Type2`

2. **Monthly Aggregation** (lines 259-269):
   - Sums values from each robot's monthly totals
   - Applies unit conversion factors for time-based robots
   - Stores results in the `totalUnitesMoisN...` variables

3. **Final Merging** (lines 291-303):
   - Combines daily and monthly aggregates into final data structure
   - Formats numbers for display (using `formatNumber` function)
   - Sets up data for chart rendering

## 4. Line References

Key line numbers for referenced code:

- Variable declarations: 211-222
- Daily aggregation loop: 270-281 
- Monthly aggregation: 259-269
- Data merging: 291-303
- Type 1 calculations: 275-277
- Type 2 calculations: 277-279
- Final data structure: 291-297