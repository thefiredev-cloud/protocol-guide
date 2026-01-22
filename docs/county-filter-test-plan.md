# County Filtering Test Plan - Protocol Guide Manus

## Document Information
- **Version**: 1.0
- **Created**: 2026-01-20
- **Purpose**: Comprehensive validation of county-level filtering functionality
- **Scope**: Geographic filtering for EMS protocol search

---

## Overview

This test plan validates the county filtering functionality in Protocol Guide Manus to ensure users can accurately filter EMS protocols by state and county. The filtering system must guarantee that users only see protocols relevant to their selected geographic jurisdiction.

### Critical Requirements
- County filters must be exclusive (LA County results should NOT include other jurisdictions)
- State-level filters must include all agencies within that state
- No filter should return protocols from multiple states/agencies
- Protocol number searches must respect geographic filters
- Search performance must remain under 3 seconds with filters applied

---

## Test Environment

### Prerequisites
- Protocol Guide Manus app installed and running
- Test device with network connectivity
- Access to protocol database with multi-state data
- Known test protocols from multiple jurisdictions

### Test Data Requirements
```
California - Los Angeles County:
  - Protocol: "Cardiac Arrest Adult" (Ref. No. 502)
  - Agency: LA County EMS

California - Other Counties:
  - Multiple agencies (Santa Clara, San Diego, etc.)

Other States:
  - Illinois protocols
  - Texas protocols
  - Various other state protocols

Test Search Terms:
  - "cardiac arrest adult"
  - "seizure"
  - "overdose naloxone"
  - "502"
```

---

## Test Cases

### Test Case 1: LA County Exclusive Filter

**Test ID**: TC-CF-001
**Priority**: CRITICAL
**Category**: Geographic Filtering - County Level

#### Objective
Verify that selecting LA County returns ONLY LA County protocols and excludes all other jurisdictions.

#### Prerequisites
- Database contains protocols from multiple California counties
- Database contains protocols from Illinois, Texas, and other states
- LA County has protocol Ref. No. 502 for "Cardiac Arrest Adult"

#### Test Steps
1. Launch Protocol Guide Manus app
2. Navigate to protocol search
3. Select geographic filter dropdown
4. Select "California" from state list
5. Select "Los Angeles" from county list
6. Enter search term: "cardiac arrest adult"
7. Execute search
8. Review all search results

#### Expected Results
```
✓ Search returns LA County protocols only
✓ Protocol Ref. No. 502 appears in results
✓ Protocol source is labeled as "Los Angeles County EMS"
✓ Result count shows only LA County matches
✓ No protocols from other California counties appear
✓ No protocols from Illinois appear
✓ No protocols from Texas appear
✓ No protocols from any other state appear
```

#### Failure Criteria
```
✗ Any protocol from another California county appears
✗ Any protocol from Illinois appears
✗ Any protocol from Texas appears
✗ Any protocol from another state appears
✗ Protocol Ref. No. 502 does not appear
✗ Protocol is labeled incorrectly
```

#### Test Data
```json
{
  "filters": {
    "state": "California",
    "county": "Los Angeles"
  },
  "searchTerm": "cardiac arrest adult",
  "expectedProtocol": {
    "refNo": "502",
    "title": "Cardiac Arrest Adult",
    "agency": "Los Angeles County EMS"
  },
  "excludedStates": ["Illinois", "Texas"],
  "excludedCounties": ["Santa Clara", "San Diego"]
}
```

---

### Test Case 2: State-Level Filter (No County Selected)

**Test ID**: TC-CF-002
**Priority**: HIGH
**Category**: Geographic Filtering - State Level

#### Objective
Verify that selecting only a state (no county) returns protocols from multiple agencies within that state only.

#### Prerequisites
- Database contains multiple California counties with protocols
- Database contains protocols from other states
- California has multiple agencies with seizure protocols

#### Test Steps
1. Launch Protocol Guide Manus app
2. Navigate to protocol search
3. Select geographic filter dropdown
4. Select "California" from state list
5. Leave county selection empty (or select "All Counties")
6. Enter search term: "seizure"
7. Execute search
8. Review all search results
9. Document all unique agencies in results

#### Expected Results
```
✓ Results include protocols from multiple California agencies
✓ Results include LA County protocols
✓ Results include other California county protocols (e.g., San Diego, Santa Clara)
✓ All results are from California agencies only
✓ No protocols from other states appear
✓ Agency names are clearly labeled for each result
✓ Results show diversity of California agencies
```

#### Failure Criteria
```
✗ Any non-California protocol appears
✗ Only one California county appears (should be multiple)
✗ Agency labels are missing or incorrect
✗ State filter is not applied
```

#### Test Data
```json
{
  "filters": {
    "state": "California",
    "county": null
  },
  "searchTerm": "seizure",
  "expectedAgencies": [
    "Los Angeles County EMS",
    "San Diego County EMS",
    "Santa Clara County EMS"
  ],
  "excludedStates": ["Illinois", "Texas", "New York"],
  "minimumAgencyCount": 2
}
```

---

### Test Case 3: No Geographic Filter Applied

**Test ID**: TC-CF-003
**Priority**: HIGH
**Category**: Geographic Filtering - Baseline

#### Objective
Verify that without any geographic filters, search returns protocols from multiple states and agencies.

#### Prerequisites
- Database contains protocols from multiple states
- Multiple states have protocols containing "overdose naloxone"
- Database has sufficient diversity for multi-state results

#### Test Steps
1. Launch Protocol Guide Manus app
2. Navigate to protocol search
3. Ensure no geographic filters are selected (default state)
4. Verify filter shows "All States" or no selection
5. Enter search term: "overdose naloxone"
6. Execute search
7. Review all search results
8. Document all unique states and agencies in results

#### Expected Results
```
✓ Results include protocols from multiple states
✓ Results include protocols from multiple agencies
✓ Results include at least 3 different states
✓ Results include California protocols
✓ Results include at least one other state (Illinois, Texas, etc.)
✓ Each result shows state and agency identification
✓ Result count reflects multi-jurisdiction search
```

#### Failure Criteria
```
✗ Results are limited to single state
✗ Results are limited to single agency
✗ State/agency information is missing
✗ No results returned (should have matches)
```

#### Test Data
```json
{
  "filters": {
    "state": null,
    "county": null
  },
  "searchTerm": "overdose naloxone",
  "expectedMinStates": 3,
  "expectedStates": ["California", "Illinois", "Texas"],
  "minimumResultCount": 5
}
```

---

### Test Case 4: Protocol Number Search with County Filter

**Test ID**: TC-CF-004
**Priority**: HIGH
**Category**: Geographic Filtering - Protocol ID Search

#### Objective
Verify that protocol number searches respect geographic filters and return only the protocol from the selected jurisdiction.

#### Prerequisites
- LA County has protocol Ref. No. 502
- Other jurisdictions may have protocols with number "502"
- Geographic filter is functioning for text searches

#### Test Steps
1. Launch Protocol Guide Manus app
2. Navigate to protocol search
3. Select geographic filter dropdown
4. Select "California" from state list
5. Select "Los Angeles" from county list
6. Enter search term: "502"
7. Execute search
8. Review search results
9. Verify protocol details

#### Expected Results
```
✓ Search returns LA County Ref. No. 502 only
✓ Protocol is from Los Angeles County EMS
✓ No protocols from other jurisdictions appear
✓ If other jurisdictions have "502", they are filtered out
✓ Protocol details match LA County's Ref. No. 502
✓ Result count is 1 (or limited to LA County protocols)
```

#### Failure Criteria
```
✗ Protocols from other jurisdictions with "502" appear
✗ LA County Ref. No. 502 does not appear
✗ Geographic filter is ignored for number search
✗ Multiple jurisdictions' "502" protocols appear
```

#### Test Data
```json
{
  "filters": {
    "state": "California",
    "county": "Los Angeles"
  },
  "searchTerm": "502",
  "expectedProtocol": {
    "refNo": "502",
    "agency": "Los Angeles County EMS",
    "state": "California",
    "county": "Los Angeles"
  },
  "excludedAgencies": ["Illinois EMS", "Texas EMS"]
}
```

---

### Test Case 5: Search Performance with Filters

**Test ID**: TC-CF-005
**Priority**: CRITICAL
**Category**: Performance - Geographic Filtering

#### Objective
Verify that search performance remains acceptable (under 3 seconds) when geographic filters are applied.

#### Prerequisites
- Database contains substantial protocol data
- Network conditions are stable
- Timer/profiling tools are available

#### Test Steps
1. Launch Protocol Guide Manus app
2. Navigate to protocol search
3. Select geographic filter dropdown
4. Select "California" from state list
5. Select "Los Angeles" from county list
6. Enter search term: "cardiac arrest adult"
7. Start timer
8. Execute search
9. Stop timer when results are displayed
10. Record time elapsed
11. Repeat test 5 times
12. Calculate average, min, max response times

#### Expected Results
```
✓ Average search time < 3000ms
✓ Maximum search time < 5000ms (allowing for network variance)
✓ Minimum search time < 2000ms
✓ Results load progressively (if applicable)
✓ UI remains responsive during search
✓ No timeout errors occur
✓ 95th percentile < 3500ms
```

#### Failure Criteria
```
✗ Average search time > 3000ms
✗ Any search takes longer than 5000ms
✗ UI becomes unresponsive during search
✗ Timeout errors occur
✗ Results fail to load
```

#### Performance Benchmarks
```json
{
  "target": {
    "average": "< 3000ms",
    "p95": "< 3500ms",
    "maximum": "< 5000ms"
  },
  "acceptable": {
    "average": "< 4000ms",
    "p95": "< 4500ms",
    "maximum": "< 6000ms"
  },
  "unacceptable": {
    "average": "> 4000ms",
    "p95": "> 5000ms",
    "maximum": "> 6000ms"
  }
}
```

#### Test Iterations
```
Iteration 1: California -> Los Angeles -> "cardiac arrest adult"
Iteration 2: California -> Los Angeles -> "seizure"
Iteration 3: California -> Los Angeles -> "502"
Iteration 4: California -> All Counties -> "overdose"
Iteration 5: No filters -> "trauma"
```

---

## Additional Test Scenarios

### Test Case 6: Filter Persistence

**Test ID**: TC-CF-006
**Priority**: MEDIUM

#### Objective
Verify that selected filters persist across searches until explicitly changed.

#### Test Steps
1. Select California -> Los Angeles
2. Search "cardiac arrest"
3. Search "seizure" (without changing filters)
4. Verify both searches used LA County filter

#### Expected Results
- Filter selection persists between searches
- User doesn't need to reselect filters for each search

---

### Test Case 7: Filter Clear/Reset

**Test ID**: TC-CF-007
**Priority**: MEDIUM

#### Objective
Verify ability to clear filters and return to unfiltered search.

#### Test Steps
1. Select California -> Los Angeles
2. Search "cardiac arrest"
3. Clear/reset filters
4. Search "cardiac arrest" again
5. Verify results now include multiple states

#### Expected Results
- Clear filter button resets to "All States/Counties"
- Subsequent searches are unfiltered
- UI clearly indicates filter state

---

### Test Case 8: Invalid Filter Combinations

**Test ID**: TC-CF-008
**Priority**: LOW

#### Objective
Verify handling of invalid or edge case filter combinations.

#### Test Steps
1. Attempt to select county without selecting state
2. Select state, then select county from different state
3. Verify system prevents invalid selections

#### Expected Results
- County dropdown disabled until state selected
- County list updates based on selected state
- No invalid filter combinations possible

---

## Test Execution Guidelines

### Test Order
1. Execute TC-CF-003 first (baseline, no filters)
2. Execute TC-CF-002 (state-level filters)
3. Execute TC-CF-001 (county-level filters)
4. Execute TC-CF-004 (protocol number search)
5. Execute TC-CF-005 (performance testing)
6. Execute TC-CF-006-008 (additional scenarios)

### Pass/Fail Criteria

#### Individual Test
- **PASS**: All expected results achieved, no failure criteria met
- **FAIL**: Any failure criterion met
- **BLOCKED**: Cannot execute due to environmental issues
- **SKIP**: Test not applicable to current build

#### Overall Test Suite
- **PASS**: All critical tests pass, no more than 1 high priority failure
- **FAIL**: Any critical test fails, or more than 2 high priority failures
- **PARTIAL**: Non-critical failures only

### Defect Severity Guidelines

#### Critical (P0)
- Wrong protocols returned (patient safety issue)
- Geographic filters completely non-functional
- Search returns no results when data exists

#### High (P1)
- Geographic filter partially working but allows some incorrect results
- Performance exceeds 5 seconds consistently
- Filter persistence broken

#### Medium (P2)
- UI/UX issues with filter selection
- Performance between 3-5 seconds
- Missing filter clear functionality

#### Low (P3)
- Minor UI inconsistencies
- Missing helpful features (e.g., recent filters)

---

## Test Data Setup

### Required Test Protocols

```sql
-- LA County Test Protocol
INSERT INTO protocols (ref_no, title, agency, state, county, content)
VALUES ('502', 'Cardiac Arrest Adult', 'Los Angeles County EMS', 'California', 'Los Angeles', '...');

-- Other California Counties (for state-level testing)
INSERT INTO protocols (ref_no, title, agency, state, county, content)
VALUES
  ('SC-12', 'Seizure Management', 'Santa Clara County EMS', 'California', 'Santa Clara', '...'),
  ('SD-45', 'Seizure Protocol', 'San Diego County EMS', 'California', 'San Diego', '...');

-- Other States (for baseline testing)
INSERT INTO protocols (ref_no, title, agency, state, county, content)
VALUES
  ('IL-502', 'Cardiac Arrest', 'Illinois State EMS', 'Illinois', 'Cook', '...'),
  ('TX-78', 'Overdose/Naloxone', 'Texas EMS', 'Texas', 'Harris', '...');
```

---

## Test Automation Recommendations

### Automated Test Coverage
```typescript
// Example test structure using Puppeteer/Playwright

describe('County Filtering', () => {
  test('TC-CF-001: LA County exclusive filter', async () => {
    await selectFilter('California', 'Los Angeles');
    await searchProtocols('cardiac arrest adult');
    const results = await getSearchResults();

    expect(results).toContainProtocol('502');
    expect(results).not.toContainState('Illinois');
    expect(results).not.toContainState('Texas');
    expect(results).toHaveAgency('Los Angeles County EMS');
  });

  test('TC-CF-002: State-level filter', async () => {
    await selectFilter('California', null);
    await searchProtocols('seizure');
    const results = await getSearchResults();

    expect(results).toHaveMinimumAgencies(2);
    expect(results).toOnlyContainState('California');
  });

  test('TC-CF-005: Performance under 3 seconds', async () => {
    const startTime = Date.now();
    await selectFilter('California', 'Los Angeles');
    await searchProtocols('cardiac arrest adult');
    await waitForResults();
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(3000);
  });
});
```

### CI/CD Integration
- Run automated tests on every PR
- Performance tests in staging environment
- Smoke tests in production (read-only)

---

## Regression Testing

### When to Execute
- Before every release
- After any database schema changes
- After any search algorithm updates
- After any geographic data updates
- Monthly maintenance testing

### Regression Test Matrix
```
| Test ID    | Every PR | Pre-Release | Monthly | After DB Change |
|------------|----------|-------------|---------|-----------------|
| TC-CF-001  | ✓        | ✓           | ✓       | ✓               |
| TC-CF-002  | ✓        | ✓           | ✓       | ✓               |
| TC-CF-003  | ✓        | ✓           | ✓       | ✓               |
| TC-CF-004  |          | ✓           | ✓       | ✓               |
| TC-CF-005  |          | ✓           | ✓       |                 |
| TC-CF-006  |          | ✓           |         |                 |
| TC-CF-007  |          | ✓           |         |                 |
| TC-CF-008  |          |             | ✓       |                 |
```

---

## Known Issues / Limitations

### Current Known Issues
- None documented (initial test plan creation)

### Test Limitations
- Performance testing requires stable network conditions
- Test data must be maintained and kept current
- Manual testing required for UI/UX validation
- Some edge cases may require live database

---

## Test Reporting

### Test Report Template
```markdown
# County Filter Test Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Build Version**: [Version]
**Environment**: [Production/Staging/Dev]

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X
- Pass Rate: X%

## Critical Findings
[List any critical issues]

## Test Results
[Detailed results by test case]

## Recommendations
[Next steps and recommendations]
```

### Metrics to Track
- Pass rate by test execution
- Average search performance over time
- Defect discovery rate
- False positive/negative rates in filtering

---

## Sign-off

### Test Plan Approval
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] QA Lead

### Test Execution Sign-off
- [ ] All critical tests passed
- [ ] Performance benchmarks met
- [ ] No blocking defects
- [ ] Test report submitted

---

## Appendix

### Related Documents
- API documentation for search endpoints
- Database schema for protocols table
- Geographic data source documentation
- User stories for county filtering feature

### Test Environment Details
```yaml
app_version: "1.x.x"
database: "Production replica"
network: "Standard WiFi (minimum 10Mbps)"
device_specs:
  - iOS 16+ (iPhone)
  - Android 12+ (Pixel/Samsung)
test_accounts:
  - user: test_user_ca@example.com
  - user: test_user_il@example.com
```

### Contact Information
- QA Lead: [Contact]
- Product Owner: [Contact]
- Engineering Lead: [Contact]

---

**Document Version History**
- v1.0 (2026-01-20): Initial test plan creation
