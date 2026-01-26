# Analytics & Reporting

Understand how your department uses Protocol Guide.

---

## Analytics Dashboard

### Overview Metrics

The main dashboard shows key metrics at a glance:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Analytics Overview                    [Last 30 days ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Active Users          Total Searches        Avg/User/Day   │
│  ┌─────────┐          ┌─────────────┐       ┌──────────┐   │
│  │   127   │          │   4,256     │       │   3.2    │   │
│  │  ↑ 12%  │          │    ↑ 8%     │       │   ↑ 5%   │   │
│  └─────────┘          └─────────────┘       └──────────┘   │
│                                                             │
│  Top Protocols This Period                                  │
│  1. Cardiac Arrest Algorithm (342 searches)                │
│  2. Medication Dosing Chart (287 searches)                 │
│  3. Pediatric Assessment (198 searches)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| Active Users | Users who signed in during period |
| Total Searches | Number of protocol searches |
| Searches per User | Average searches per active user |
| Voice Searches | Searches initiated by voice |
| Offline Searches | Searches while offline |
| Top Protocols | Most frequently accessed |
| Search Success Rate | Searches with useful results |

---

## Reports

### Pre-Built Reports

Access at **Analytics** → **Reports**:

| Report | Description | Frequency |
|--------|-------------|-----------|
| Executive Summary | High-level usage overview | Weekly/Monthly |
| User Adoption | Sign-ins, activation rates | Monthly |
| Protocol Usage | Most/least used protocols | Monthly |
| Search Trends | What users are searching | Weekly |
| Performance | Response times, errors | Weekly |
| Compliance | Access logs summary | Monthly |

### Running a Report

1. Go to **Analytics** → **Reports**
2. Select report type
3. Set date range
4. Choose filters (station, group, etc.)
5. Click **Generate**
6. View online or export (PDF, CSV, Excel)

### Scheduled Reports

Automatically receive reports via email:

1. Go to **Analytics** → **Scheduled Reports**
2. Click **New Schedule**
3. Configure:
   - Report type
   - Frequency (daily, weekly, monthly)
   - Recipients
   - Format (PDF, CSV)
4. Save

---

## Usage Analytics

### User Activity

**Department-wide view:**
- Total searches over time (graph)
- Active users over time (graph)
- Peak usage hours
- Usage by day of week

**Filter by:**
- Station/Group
- User role
- Date range

### Individual User Stats

View any user's engagement:
1. Go to **Users** → select user → **Analytics**
2. See:
   - Sign-in frequency
   - Searches per day
   - Top protocols accessed
   - Usage trends

### Engagement Scoring

Each user receives an engagement score (0-100):

| Score | Level | Description |
|-------|-------|-------------|
| 80-100 | Power User | Daily active, many searches |
| 60-79 | Active | Regular use, several times/week |
| 40-59 | Moderate | Weekly use |
| 20-39 | Light | Monthly use |
| 0-19 | Inactive | Rarely or never uses |

Use to identify training opportunities or champions.

---

## Protocol Analytics

### Most Searched Protocols

See what your department searches for most:

1. Go to **Analytics** → **Protocols**
2. View ranked list of protocols by search volume
3. Filter by time period, group, etc.

**Insights:**
- High-volume protocols may need quick-access shortcuts
- Low-volume critical protocols may need training emphasis
- Unexpected high-volume may indicate knowledge gaps

### Search Terms Analysis

View actual search queries:

1. Go to **Analytics** → **Search Terms**
2. See:
   - Most common search phrases
   - "No results" queries (gaps in understanding)
   - Voice vs. typed searches

**Use cases:**
- Identify confusing protocol names
- Discover knowledge gaps
- Improve custom protocol titles

### Protocol Coverage

See if your protocols are meeting user needs:

```
Protocol Coverage Report
─────────────────────────────────────────
Searches with good matches:     89%
Searches with partial matches:  8%
Searches with no matches:       3%

Top "no match" queries:
- "county standing orders" (custom protocol needed)
- "mutual aid protocols" (not in database)
- "new cardiac arrest update" (needs update)
```

---

## Performance Analytics

### Response Times

Monitor system performance:

| Metric | Target | Current |
|--------|--------|---------|
| Search response | <2 sec | 1.4 sec avg |
| Voice transcription | <1 sec | 0.8 sec avg |
| Page load | <3 sec | 2.1 sec avg |

### Availability

View uptime metrics:

- **Current Month**: 99.98% uptime
- **Last 12 Months**: 99.95% uptime
- **Incidents**: 2 (both <15 min duration)

### Error Tracking

Monitor issues affecting users:

1. Go to **Analytics** → **Errors**
2. See:
   - Error count over time
   - Error types (network, auth, search)
   - Affected users

---

## Comparative Analytics

### Station/Group Comparison

Compare usage across groups:

```
Station Comparison (Last 30 days)
─────────────────────────────────────────
Station       Users    Searches    Avg/User
Station 1     25       812         32.5
Station 2     22       654         29.7
Station 3     28       589         21.0  ⚠️
Station 4     20       723         36.2
Station 5     18       412         22.9
```

Low-performing stations may need:
- Additional training
- Champions/advocates
- Device availability improvements

### Trend Analysis

See how usage changes over time:

- **Week-over-week**: Short-term trends
- **Month-over-month**: Medium-term patterns
- **Year-over-year**: Long-term adoption

### Benchmarking

Compare your department to anonymized industry averages:

```
Your Department vs. Industry Average
─────────────────────────────────────────
Metric              You      Industry    Status
Active user %       85%      72%         Above avg ✅
Searches/user/day   3.2      2.8         Above avg ✅
Voice search %      15%      22%         Below avg ⚠️
Offline usage %     8%       12%         Below avg
```

---

## Custom Dashboards

### Creating Custom Dashboards

1. Go to **Analytics** → **Custom Dashboards**
2. Click **New Dashboard**
3. Name your dashboard
4. Add widgets:
   - Charts (line, bar, pie)
   - Metrics (single number)
   - Tables (top lists)
   - Maps (geographic distribution)
5. Configure each widget's data source
6. Arrange layout
7. Save

### Sharing Dashboards

Share with other admins:
1. Open dashboard
2. Click **Share**
3. Select recipients or copy link

### Dashboard Examples

**Chief's Overview:**
- Active users this month (number)
- Searches this month vs. last (comparison)
- Top 5 protocols (list)
- Usage by station (bar chart)

**Training Officer:**
- Low-engagement users (list)
- "No results" searches (list)
- Usage by certification level (pie chart)
- Week-over-week activity (line chart)

---

## Data Export

### Export Options

| Format | Best For |
|--------|----------|
| PDF | Formal reports, presentations |
| CSV | Spreadsheet analysis, data manipulation |
| Excel | Formatted reports with charts |
| JSON | API integration, data systems |

### Export Process

1. Generate any report or view
2. Click **Export**
3. Select format
4. Download or email

### Automated Exports

Set up automatic data exports:

1. Go to **Analytics** → **Exports** → **Automated**
2. Configure:
   - Data to export
   - Format
   - Destination (email, SFTP, S3)
   - Schedule

---

## Privacy Considerations

### What's Tracked

- **Aggregated**: Search volumes, popular protocols, usage patterns
- **Individual**: Sign-ins, search counts (not content), engagement

### What's NOT Tracked

- Actual patient data (Protocol Guide doesn't collect this)
- Search query content (queries are logged but anonymized in reports)
- Location data
- Audio recordings

### User Privacy

Users can see their own:
- Search history
- Bookmarks
- Activity summary

Users cannot see:
- Other users' data
- Department analytics

---

## Best Practices

### Regular Review Cadence

| Review | Frequency | Who |
|--------|-----------|-----|
| Usage snapshot | Weekly | Admin |
| Full analytics review | Monthly | Admin + Training |
| Executive report | Quarterly | Leadership |
| Adoption assessment | Annually | Leadership + Vendor |

### Actionable Insights

**Low user adoption?**
→ Identify inactive users, personal outreach, training

**High "no results" searches?**
→ Upload custom protocols, improve search terms

**Station with low usage?**
→ Check device availability, training needs

**Lots of voice search errors?**
→ Training on voice techniques, quiet areas

---

## Next Steps

- [Configure security settings →](./security.md)
- [Upload custom protocols →](./custom-protocols.md)
- [Set up SSO →](./sso-integration.md)

---

**Need help?** Contact enterprise-support@protocol-guide.com
