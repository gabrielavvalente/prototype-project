# Feature 009: Reporting and Analytics

## Goal
Give EHS managers, owners, regional users and administrators computable, scope-controlled views of event data - from ready-made reports to cross-site roll-ups - from a single consolidated data model.

## Why
With all plants on one data model, group-level EHS KPIs become computable from a single database. Four layers serve different questions: standard reports for recurring monthly-review questions, live site dashboards for today's position, self-service chart building for one-off questions, and pillar/cross-site scorecard roll-up boards for cross-site comparison.

## Platform context
- Source: Event Reporting BRD v1.0.0 - §3.1(8), §12, §2.1, §6.1, §9.2, §14; story prefix `US-REP-`.
- Modules involved: Reports Home, Standard Reports, Site Dashboards, Chart Builder, Pillar Boards, cross-site scorecard Boards.
- Platform contracts reused: role/scope model (business > plant > pillar) for server-side filtering; behavior observation program scores consumed for display only; AI services limited to translation fallback and cross-site scorecard summaries (§14).
- Reports are not visible to the base User role (§4.3).

### Strategic metrics served (§2.1)

| Objective | Metric | Surfaced in |
|---|---|---|
| Standardize global EHS event reporting | 100% of SG plants on a single tool | US-REP-06 |
| Reduce time to report an event | Event creation under 3 minutes on mobile | US-REP-03 |
| Increase investigation quality | Root cause analysis completion rate per level | US-REP-01, US-REP-05 |
| Accelerate corrective action closure | Reduction in average days event > closed action | US-REP-03 |
| Enable cross-plant learning | Safety Warnings published and viewed across plants | US-REP-06 |
| Improve data trust | 100% traceability of post-review field changes | Record Historian - see [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) |

## User stories
1. US-REP-01 - As an EHS Manager, I want a set of ready-made reports I can run without building anything, so that I can answer the recurring questions at my monthly review.
2. US-REP-02 - As an EHS Manager, I want to narrow any report and take the result away, so that I can put site-specific numbers into a presentation.
3. US-REP-03 - As a Site Manager, I want a live dashboard for my pillar, so that I can see today's position rather than last month's report.
4. US-REP-04 - As a Regional User with a question no standard report answers, I want to compose a chart myself and save it, so that I do not need a development request for every new question.
5. US-REP-05 - As a pillar lead, I want visualisations built for my specific pillar's analysis, so that I can see injury patterns or risk distribution the way my discipline reads them.
6. US-REP-06 - As a Regional Management Office user, I want cross-site and business-unit roll-ups against targets, so that I can compare plants and spot regional patterns.
7. US-REP-07 - As an EHS data owner, I want every aggregate to respect the viewer's scope, so that a site manager cannot infer another site's numbers from a chart.

## Scope
- IN (MVP, §13): US-REP-01 Run a Standard Report; US-REP-02 Filter and Export a Report; US-REP-03 Site Dashboard; US-REP-07 Scope Enforcement. Delivered surfaces: Reports Home, Standard Reports, Site Dashboards.
- OUT (MVP, §13): US-REP-04 Chart Builder; US-REP-05 Pillar Boards; US-REP-06 cross-site scorecard Boards; KPI Drilldown.
- OUT (feature boundary, §14): behavior observation program data entry - Event Reporting consumes behavior observation program scores for display only, it does not replace the behavior observation program tool. AI-generated content anywhere in analytics other than cross-site scorecard criticality summaries (AI is used only for translation fallback and cross-site scorecard summaries; it does not auto-fill investigation fields).

## Functional requirements (EARS)
- FR-1: WHEN a user with report access opens Reports THEN the system SHALL offer a dropdown selector of four standard reports: Number of Events by Type (stacked bar by event family and level), Status of Events (funnel or pie by lifecycle status), Number of Root Causes (bar by 6M root cause category), Number of Events by Reporter (bar by user or department). (from US-REP-01)
- FR-2: WHEN a standard report is selected THEN the system SHALL render it with the viewer's current scope applied. (from US-REP-01)
- FR-3: WHEN the user switches between standard reports THEN the system SHALL carry the active filters across. (from US-REP-01)
- FR-4: WHEN a standard report is displayed THEN the system SHALL offer the shared filters Type, Date Range, Location (down to Task level), HPR flag, Reporter and Year. (from US-REP-02)
- FR-5: WHEN a filter value changes THEN the system SHALL update both the chart and its underlying table. (from US-REP-02)
- FR-6: WHEN the user exports a report THEN the system SHALL offer PDF and CSV formats and SHALL apply the active filters to the exported output. (from US-REP-02)
- FR-7: WHEN a Site Dashboard is opened THEN the system SHALL scope it to a single pillar, update it in real time, and display event counts by family (SAF / IR / OH / ENV), behavior observation program observation scores, Safety Hot Zones (top 5 locations by event frequency) and an Identification Trends sparkline over a configurable date range. (from US-REP-03)
- FR-8: WHEN a Site Dashboard is displayed THEN the system SHALL allow filtering by date range and organizational scope. (from US-REP-03)
- FR-9: WHEN a user opens Chart Builder THEN the system SHALL allow selection of X-axis, Y-axis and group-by fields, aggregations Count / Sum / Average, chart types Bar / Line / Pie / Scatter, and custom filters. (from US-REP-04; out of MVP)
- FR-10: WHEN a Chart Builder user saves a chart THEN the system SHALL persist it as a named report shareable with the user's team. (from US-REP-04; out of MVP)
- FR-11: WHEN the SAF Pillar Board is opened THEN the system SHALL display a Body Injuries heat map, the SAF Matrix (severity distribution), an Iceberg diagram (visible vs underlying events) and an Incident Map by location. (from US-REP-05; out of MVP)
- FR-12: WHEN the IR Pillar Board is opened THEN the system SHALL display Risk Levels by Hazard / Area, PDCA cycle status and Standards Management coverage (3.4 standard). (from US-REP-05; out of MVP)
- FR-13: WHEN the ENV or OH board is opened THEN the system SHALL display trend charts and hotspot analysis. (from US-REP-05; out of MVP)
- FR-14: WHEN a cross-site scorecard Board renders THEN the system SHALL display SAF performance vs targets as a frequency rate trend, injury trend year-over-year, risk metrics aggregated by business unit, and behavior observation program participation trends. (from US-REP-06; out of MVP)
- FR-15: WHEN Risk Assessment criticality is displayed on a cross-site scorecard Board THEN the system SHALL show AI-generated summaries describing recurring patterns. (from US-REP-06; out of MVP; sole analytics use of AI-generated content per §14)
- FR-16: WHEN any report or dashboard query executes THEN the system SHALL filter results server-side by the viewer's business/plant/pillar scope. (from US-REP-07 / §9.2)
- FR-17: WHEN a user holds the base User role THEN the system SHALL NOT expose the Reports menu to that user. (from US-REP-07 / §4.3)
- FR-18: WHEN a Regional User views cross-site data THEN the system SHALL limit results to that user's assigned scope. (from US-REP-07)

## Non-functional requirements
- Performance: PDF export generates in under 10 seconds (US-REP-02); Site Dashboard KPI tiles refresh in under 5 seconds (US-REP-03).
- Security: all scope filtering enforced server-side, never client-side only (§9.2); no aggregate may allow inference of out-of-scope data.
- AI governance: AI usage restricted to translation fallback and cross-site scorecard summaries; no auto-fill of investigation fields (§14).

## Acceptance criteria (testable)

US-REP-01 - Run a Standard Report
- [ ] Given I open Reports, when the page renders, then a dropdown selector offers exactly four standard reports: Number of Events by Type, Status of Events, Number of Root Causes, Number of Events by Reporter.
- [ ] Given a report is selected, when it renders, then my current scope is applied.
- [ ] Given active filters, when I switch reports, then the filters carry across.

US-REP-02 - Filter and Export a Report
- [ ] Given any standard report, when I open the filter panel, then Type, Date Range, Location (down to Task level), HPR flag, Reporter and Year are available.
- [ ] Given a rendered report, when I change a filter, then the chart and its underlying table update.
- [ ] Given a rendered report, when I export, then both PDF and CSV are offered and the output respects the active filters.
- [ ] Given a PDF is requested, when generation runs, then it completes in under 10 seconds.

US-REP-03 - Monitor My Site in Real Time
- [ ] Given I open a Site Dashboard, when it renders, then it is scoped to a single pillar and updates in real time.
- [ ] Given the dashboard renders, when I view it, then it shows event counts by family (SAF / IR / OH / ENV), behavior observation program observation scores, Safety Hot Zones (top 5 locations by event frequency) and an Identification Trends sparkline over a configurable date range.
- [ ] Given the dashboard is displayed, when I apply filters, then date range and organizational scope filters are available.
- [ ] Given KPI tiles refresh, when the refresh runs, then it completes in under 5 seconds.

US-REP-04 - Build My Own Chart (out of MVP)
- [ ] Given I open Chart Builder, when I compose a chart, then I can select fields for X-axis, Y-axis and a group-by dimension.
- [ ] Given I choose an aggregation, when the options list, then Count, Sum and Average are available.
- [ ] Given I choose a chart type, when the options list, then Bar, Line, Pie and Scatter are available.
- [ ] Given I want to narrow the data, when I configure the chart, then custom filters are available.
- [ ] Given I am satisfied, when I save, then the chart persists as a named report I can share with my team.

US-REP-05 - Analyse a Pillar in Depth (out of MVP)
- [ ] Given I open the SAF Pillar Board, when it renders, then it shows a Body Injuries heat map, the SAF Matrix (severity distribution), an Iceberg diagram (visible vs underlying events) and an Incident Map by location.
- [ ] Given I open the IR Pillar Board, when it renders, then it shows Risk Levels by Hazard / Area, PDCA cycle status and Standards Management coverage (3.4 standard).
- [ ] Given I open the ENV or OH board, when it renders, then it shows trend charts and hotspot analysis.

US-REP-06 - Roll Up Performance Across Sites (out of MVP)
- [ ] Given I open a cross-site scorecard Board, when it renders, then it shows SAF performance vs targets as a frequency rate trend.
- [ ] Given the board renders, when I view it, then injury trend year-over-year is shown.
- [ ] Given the board renders, when I view it, then risk metrics are aggregated by business unit.
- [ ] Given the board renders, when I view it, then behavior observation program participation trends are shown.
- [ ] Given Risk Assessment criticality is displayed, when summaries render, then AI-generated summaries describe recurring patterns.

US-REP-07 - See Only What I Am Entitled To
- [ ] Given any report or dashboard query, when it executes, then results are filtered server-side by my business/plant/pillar scope.
- [ ] Given I hold the base User role, when I open the navigation, then the Reports menu is not available to me.
- [ ] Given I am a Regional User, when I view cross-site data, then I see only data within my assigned scope.

## Dependencies
- [Event Library](../02-event-library/Event%20Library.md) - event data reported on.
- [Investigation](../04-investigation/Investigation.md) - root cause data for US-REP-01 / US-REP-05.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) - Record Historian serves the data-trust metric.
- [Global Shell](../01-global-shell/Global%20Shell.md) - Reports menu entry and role-based navigation.
- behavior observation program tool - upstream source of behavior observation program scores displayed on dashboards and cross-site scorecard boards (data entry stays in behavior observation program).

## Open questions
- [OPEN]: US-REP-03 requires "real time" dashboard updates but no refresh latency or staleness tolerance is defined beyond the 5-second KPI tile refresh - confirm what "real time" means contractually.
- [OPEN]: US-REP-06 AI-generated criticality summaries - no acceptance threshold for summary quality or accuracy is defined; confirm review or disclaimer requirements before build.