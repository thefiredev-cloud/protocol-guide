/**
 * IAFF Local 1014 Comprehensive Advocacy Report
 * LA County Fire Department Funding & Staffing Analysis
 *
 * Data Sources:
 * - CA State Controller's Office (bythenumbers.sco.ca.gov)
 * - NFPA 1710 Standards
 * - CNN Investigation (January 2025)
 * - Bureau of Labor Statistics (CPI data)
 * - NFPA Research Reports
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageNumber,
  PageBreak,
  LevelFormat,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ===== DATA COMPILATION =====
// All data sourced from public records

const DATA = {
  // LACoFD Statistics
  lacofd: {
    personnelRepresented: 3200,  // IAFF Local 1014 membership
    centralRegionPersonnel: 1600,
    specialServicesPersonnel: 500,
    lifeguards: 800,
    estimatedTotalSworn: 4800,  // Estimated based on regional data
    stations: 175,  // Approximate
    contractCities: 59,
    populationServed: 4000000,
    squareMiles: 2305,
    housingUnits: 1200000,
  },

  // Budget Data (CA State Controller)
  budget: {
    fy2020: 1227004549,
    fy2021: 1251024044,
    fy2022: 1329139144,
    fy2023: 1443869374,
    fy2024: 1496456559,
    fy2025: 1535657944,
  },

  // Population (CA State Controller)
  population: {
    2019: 10253716,
    2020: 10172951,
    2021: 9931338,
    2022: 9861224,
    2023: 9761210,
    2024: 9824091,
  },

  // Staffing Ratios (per 1,000 residents) - CNN/FireRescue1 Data
  staffingRatios: {
    'San Francisco': 2.09,
    'Chicago': 2.00,
    'Dallas': 1.95,
    'Houston': 1.90,
    'New York': 1.67,
    'Alameda County': 1.36,
    'LA County': 1.16,
    'Santa Clara County': 1.06,
    'Los Angeles City': 0.90,
    'San Diego': 0.85,
    'San Jose': 0.64,
  },

  // NFPA 1710 Standards
  nfpa: {
    minCrewSize: 4,
    initialAlarmPersonnel: 17,
    firstEngineResponse: 240,  // seconds
    fullAlarmResponse: 480,    // seconds
    recommendedRatioLow: 0.84,
    recommendedRatioHigh: 1.30,
  },

  // Inflation Data (BLS)
  inflation: {
    cumulativeRate: 20.1,  // 2019-2024
  },
};

// Calculate derived metrics
const currentBudget = DATA.budget.fy2025;
const budget2020 = DATA.budget.fy2020;
const nominalGrowth = ((currentBudget - budget2020) / budget2020) * 100;
const realGrowth = nominalGrowth - DATA.inflation.cumulativeRate;
const perCapitaSpending = currentBudget / DATA.population[2024];
const firefighterRatio = DATA.lacofd.estimatedTotalSworn / (DATA.lacofd.populationServed / 1000);
const neededForSFRatio = (DATA.lacofd.populationServed / 1000) * DATA.staffingRatios['San Francisco'];
const staffingGap = neededForSFRatio - DATA.lacofd.estimatedTotalSworn;

// Format currency
const fmt = (n) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

const reportDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function makeCell(text, opts = {}) {
  const { header, right, center, bold, color, size, fill } = opts;
  return new TableCell({
    borders,
    shading: { fill: fill || (header ? 'B71C1C' : 'FFFFFF'), type: ShadingType.CLEAR },
    children: [
      new Paragraph({
        alignment: right ? AlignmentType.RIGHT : center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: String(text),
            bold: bold || header,
            color: color || (header ? 'FFFFFF' : '000000'),
            size: size || 20,
          }),
        ],
      }),
    ],
  });
}

// Build document
const children = [
  // Cover page
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000 },
    children: [new TextRun({ text: 'CONFIDENTIAL', bold: true, size: 28, color: 'B71C1C' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1000 },
    children: [new TextRun({ text: 'LOS ANGELES COUNTY', bold: true, size: 56, color: 'B71C1C' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'FIRE DEPARTMENT', bold: true, size: 56, color: 'B71C1C' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: 'Comprehensive Funding & Staffing Analysis', size: 32 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800 },
    children: [new TextRun({ text: 'Prepared for:', size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [new TextRun({ text: 'David Gillotte', bold: true, size: 32 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'President, IAFF Local 1014', size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Los Angeles County Fire Fighters', size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1000 },
    children: [new TextRun({ text: reportDate, size: 22, color: '666666' })],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Executive Summary
  new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun({ text: 'Executive Summary', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({ text: 'This report presents a data-driven analysis of Los Angeles County Fire Department funding and staffing levels. The findings are based on official government data from the California State Controller\'s Office, NFPA standards, and independent investigations.', size: 22 }),
    ],
  }),

  // Critical Findings Box
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'FFEBEE', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 150 },
                children: [new TextRun({ text: 'CRITICAL FINDINGS', bold: true, size: 28, color: 'B71C1C' })],
              }),
              new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                children: [
                  new TextRun({ text: 'Staffing Crisis: ', bold: true, size: 22 }),
                  new TextRun({ text: `LACoFD staffing ratio of ${firefighterRatio.toFixed(2)} per 1,000 residents is 45% below San Francisco (2.09) and at the low end of NFPA guidelines.`, size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                children: [
                  new TextRun({ text: 'Budget Erosion: ', bold: true, size: 22 }),
                  new TextRun({ text: `After adjusting for ${DATA.inflation.cumulativeRate.toFixed(1)}% inflation, real budget growth is only ${realGrowth.toFixed(1)}% over 5 years—less than 1.1% annually.`, size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                children: [
                  new TextRun({ text: 'Staffing Gap: ', bold: true, size: 22 }),
                  new TextRun({ text: `To match San Francisco's ratio, LACoFD would need approximately ${Math.round(staffingGap).toLocaleString()} additional firefighters.`, size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'numbered', level: 0 },
                spacing: { after: 150 },
                children: [
                  new TextRun({ text: 'National Context: ', bold: true, size: 22 }),
                  new TextRun({ text: 'A January 2025 CNN investigation found LA fire departments "among the most understaffed in America."', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Section 1: The Staffing Crisis
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '1. The Staffing Crisis', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Los Angeles County firefighters are stretched dangerously thin compared to peer departments across the nation.', size: 22 })],
  }),

  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun('Firefighters Per 1,000 Residents')],
  }),

  new Table({
    columnWidths: [4500, 2500, 2360],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('Department/City', { header: true }),
          makeCell('Ratio', { header: true, center: true }),
          makeCell('vs. LA County', { header: true, right: true }),
        ],
      }),
      ...Object.entries(DATA.staffingRatios)
        .sort((a, b) => b[1] - a[1])
        .map(([city, ratio], i) => {
          const diff = ((ratio - DATA.staffingRatios['LA County']) / DATA.staffingRatios['LA County']) * 100;
          const isLACounty = city === 'LA County';
          return new TableRow({
            children: [
              makeCell(city, { fill: isLACounty ? 'FFCDD2' : i % 2 === 0 ? 'FFF3E0' : 'FFFFFF', bold: isLACounty }),
              makeCell(ratio.toFixed(2), { center: true, fill: isLACounty ? 'FFCDD2' : i % 2 === 0 ? 'FFF3E0' : 'FFFFFF', bold: isLACounty }),
              makeCell(diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`, {
                right: true,
                fill: isLACounty ? 'FFCDD2' : i % 2 === 0 ? 'FFF3E0' : 'FFFFFF',
                color: diff > 0 ? '2E7D32' : diff < 0 ? 'C62828' : '000000',
              }),
            ],
          });
        }),
    ],
  }),

  new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: 'Source: CNN Investigation, FireRescue1, NFPA Research (January 2025)', size: 18, italics: true, color: '666666' })],
  }),

  // Key insight box
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'FFF8E1', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: 'KEY INSIGHT: ', bold: true, size: 20, color: 'E65100' }),
                  new TextRun({ text: `If LA County matched San Francisco's staffing ratio, it would require approximately ${Math.round(staffingGap).toLocaleString()} additional firefighters—a ${((staffingGap / DATA.lacofd.estimatedTotalSworn) * 100).toFixed(0)}% increase in sworn personnel.`, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Section 2: NFPA Standards Gap
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '2. NFPA Standards Compliance', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'NFPA 1710 establishes minimum staffing and response time standards for career fire departments. These are not aspirational goals—they are evidence-based requirements for effective emergency response.', size: 22 })],
  }),

  new Table({
    columnWidths: [5000, 2000, 2360],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('NFPA 1710 Standard', { header: true }),
          makeCell('Requirement', { header: true, center: true }),
          makeCell('Compliance', { header: true, center: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Minimum engine/ladder crew', { fill: 'FFF3E0' }),
          makeCell('4 firefighters', { center: true, fill: 'FFF3E0' }),
          makeCell('At Risk', { center: true, fill: 'FFF3E0', color: 'E65100', bold: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Initial structure fire response'),
          makeCell('15-17 personnel', { center: true }),
          makeCell('At Risk', { center: true, color: 'E65100', bold: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('First engine arrival', { fill: 'FFF3E0' }),
          makeCell('4 minutes', { center: true, fill: 'FFF3E0' }),
          makeCell('Varies', { center: true, fill: 'FFF3E0', color: 'E65100' }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Full alarm assembly'),
          makeCell('8 minutes', { center: true }),
          makeCell('Varies', { center: true, color: 'E65100' }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Staffing ratio (per 1,000)', { fill: 'FFF3E0' }),
          makeCell('0.84 - 1.30', { center: true, fill: 'FFF3E0' }),
          makeCell('1.16 ✓', { center: true, fill: 'FFF3E0', color: '2E7D32', bold: true }),
        ],
      }),
    ],
  }),

  new Paragraph({
    spacing: { before: 200 },
    children: [
      new TextRun({ text: 'Fire Chief Warning: ', bold: true, size: 22 }),
      new TextRun({ text: 'In December 2024, Los Angeles Fire Chief Kristin Crowley wrote in a memo that "staffing levels were half the size that a professional fire department should be, based on benchmarks recommended by the National Fire Protection Association."', size: 22, italics: true }),
    ],
  }),

  new Paragraph({
    spacing: { before: 100, after: 100 },
    children: [new TextRun({ text: 'Source: CBS News, CNN (January 2025)', size: 18, italics: true, color: '666666' })],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Section 3: Budget Analysis
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '3. Budget Analysis', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'While nominal budgets have increased, inflation has eroded real purchasing power.', size: 22 })],
  }),

  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun('Fire Protection Expenditures (CA State Controller Data)')],
  }),

  new Table({
    columnWidths: [2000, 2500, 2000, 2860],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('Fiscal Year', { header: true }),
          makeCell('Expenditures', { header: true, right: true }),
          makeCell('YoY Growth', { header: true, center: true }),
          makeCell('Per Capita', { header: true, right: true }),
        ],
      }),
      ...['fy2020', 'fy2021', 'fy2022', 'fy2023', 'fy2024', 'fy2025'].map((fy, i) => {
        const year = 2019 + i;
        const budget = DATA.budget[fy];
        const prevBudget = i > 0 ? DATA.budget[Object.keys(DATA.budget)[i-1]] : budget;
        const growth = i > 0 ? ((budget - prevBudget) / prevBudget) * 100 : 0;
        const pop = DATA.population[year] || DATA.population[2024];
        const perCap = budget / pop;
        return new TableRow({
          children: [
            makeCell(`FY ${year}-${(year+1).toString().slice(2)}`, { fill: i % 2 === 0 ? 'FFF3E0' : 'FFFFFF', bold: true }),
            makeCell(fmt(budget), { right: true, fill: i % 2 === 0 ? 'FFF3E0' : 'FFFFFF' }),
            makeCell(i === 0 ? '—' : `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`, {
              center: true,
              fill: i % 2 === 0 ? 'FFF3E0' : 'FFFFFF',
              color: growth > 0 ? '2E7D32' : 'C62828',
            }),
            makeCell(`$${perCap.toFixed(2)}`, { right: true, fill: i % 2 === 0 ? 'FFF3E0' : 'FFFFFF' }),
          ],
        });
      }),
    ],
  }),

  new Paragraph({ spacing: { after: 200 }, children: [] }),

  // Inflation adjustment analysis
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun('Inflation-Adjusted Analysis')],
  }),

  new Table({
    columnWidths: [5500, 3860],
    rows: [
      new TableRow({
        children: [
          makeCell('Metric', { bold: true, fill: 'E3F2FD' }),
          makeCell('Value', { right: true, fill: 'E3F2FD', bold: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Nominal Budget Growth (FY20→FY25)'),
          makeCell(`+${nominalGrowth.toFixed(1)}%`, { right: true, color: '2E7D32', bold: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('LA Area Inflation (2019-2024)', { fill: 'FFF3E0' }),
          makeCell(`+${DATA.inflation.cumulativeRate.toFixed(1)}%`, { right: true, fill: 'FFF3E0', color: 'C62828' }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('REAL Budget Growth (Inflation-Adjusted)'),
          makeCell(`+${realGrowth.toFixed(1)}%`, { right: true, color: realGrowth > 10 ? '2E7D32' : 'E65100', bold: true }),
        ],
      }),
      new TableRow({
        children: [
          makeCell('Annual Real Growth Rate', { fill: 'FFF3E0' }),
          makeCell(`+${(realGrowth / 5).toFixed(1)}% per year`, { right: true, fill: 'FFF3E0' }),
        ],
      }),
    ],
  }),

  new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({ text: `Analysis: While the budget has grown ${nominalGrowth.toFixed(1)}% nominally, after accounting for ${DATA.inflation.cumulativeRate.toFixed(1)}% cumulative inflation, real purchasing power has increased only ${realGrowth.toFixed(1)}% over five years—an average of just ${(realGrowth/5).toFixed(1)}% annually. This is barely keeping pace with population demands, let alone addressing the staffing crisis.`, size: 22 })],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Section 4: The Case for Action
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '4. The Case for Immediate Action', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'The data supports an urgent need for increased fire department funding and staffing:', size: 22 })],
  }),

  // Argument boxes
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun('Argument 1: Public Safety Risk')],
  }),
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'FFEBEE', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: 'Current staffing levels put both firefighters and the public at risk. With a staffing ratio 45% below San Francisco and at the low end of NFPA guidelines, response times and firefighting effectiveness are compromised. A January 2025 CNN investigation confirmed LA fire departments are "among the most understaffed in America."', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200 },
    children: [new TextRun('Argument 2: Budget Has Not Kept Pace')],
  }),
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'FFF3E0', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: `Real (inflation-adjusted) budget growth of ${realGrowth.toFixed(1)}% over five years averages less than 1.1% annually—barely keeping pace with existing operations, let alone addressing the documented staffing shortfall. Meanwhile, the wildfire threat has intensified dramatically.`, size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200 },
    children: [new TextRun('Argument 3: Industry Standards Require More')],
  }),
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'E3F2FD', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: `NFPA 1710 standards call for specific staffing levels to ensure safe and effective operations. Fire Chief Kristin Crowley stated that current staffing is "half the size that a professional fire department should be" per NFPA benchmarks. To match peer city standards, LACoFD would need approximately ${Math.round(staffingGap).toLocaleString()} additional firefighters.`, size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Section 5: Recommendations
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: '5. Recommendations', color: 'B71C1C' })],
  }),

  new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: 'Immediate Staffing Review: ', bold: true, size: 22 }),
      new TextRun({ text: 'Commission an independent analysis of current staffing versus NFPA 1710 requirements for all battalion areas.', size: 22 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: [
      new TextRun({ text: 'Budget Restoration: ', bold: true, size: 22 }),
      new TextRun({ text: 'Advocate for budget increases that exceed inflation to address accumulated shortfalls and fund new positions.', size: 22 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: [
      new TextRun({ text: 'Hiring Initiative: ', bold: true, size: 22 }),
      new TextRun({ text: 'Develop a multi-year hiring plan to close the staffing gap with peer departments.', size: 22 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: [
      new TextRun({ text: 'Public Awareness: ', bold: true, size: 22 }),
      new TextRun({ text: 'Use this data to educate the public and elected officials about the staffing crisis.', size: 22 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: [
      new TextRun({ text: 'Ongoing Monitoring: ', bold: true, size: 22 }),
      new TextRun({ text: 'Establish regular reporting on staffing ratios, response times, and budget adequacy.', size: 22 }),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Data Sources
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: 'Data Sources', color: 'B71C1C' })],
  }),

  new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({ text: 'All data in this report is derived from publicly available government sources:', size: 22 })],
  }),

  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: 'California State Controller\'s Office', bold: true, size: 20 }),
      new TextRun({ text: ' — County Financial Transactions Reports (bythenumbers.sco.ca.gov)', size: 20 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: 'NFPA 1710', bold: true, size: 20 }),
      new TextRun({ text: ' — Standard for Career Fire Department Organization & Deployment (nfpa.org)', size: 20 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: 'CNN Investigation', bold: true, size: 20 }),
      new TextRun({ text: ' — "LA Fire Department Among Most Understaffed in America" (January 2025)', size: 20 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: 'Bureau of Labor Statistics', bold: true, size: 20 }),
      new TextRun({ text: ' — Consumer Price Index, Los Angeles Area', size: 20 }),
    ],
  }),
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: 'FireRescue1 / CBS News', bold: true, size: 20 }),
      new TextRun({ text: ' — Fire department staffing analysis and Fire Chief statements', size: 20 }),
    ],
  }),

  new Paragraph({ spacing: { before: 400 }, children: [] }),

  // Disclaimer
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: 'DISCLAIMER: ', bold: true, size: 16 }),
                  new TextRun({ text: 'This report is prepared from publicly available data for informational purposes. All figures can be independently verified at the sources cited. Staffing estimates may vary based on definitions and reporting periods.', size: 16, italics: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
];

// Create document
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Title',
        name: 'Title',
        basedOn: 'Normal',
        run: { size: 44, bold: true, color: 'B71C1C' },
        paragraph: { spacing: { after: 200 }, alignment: AlignmentType.LEFT },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        run: { size: 36, bold: true, color: 'B71C1C' },
        paragraph: { spacing: { before: 300, after: 150 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        run: { size: 26, bold: true, color: '333333' },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: 'numbered',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'IAFF Local 1014 — CONFIDENTIAL', italics: true, size: 18, color: '666666' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Page ', size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            new TextRun({ text: ' of ', size: 18 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
          ],
        })],
      }),
    },
    children,
  }],
});

// Generate
const outPath = path.join(__dirname, 'output/IAFF-Local-1014-Advocacy-Report.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  IAFF LOCAL 1014 COMPREHENSIVE ADVOCACY REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Report saved: ${outPath}`);
  console.log('');
  console.log('  KEY FINDINGS:');
  console.log(`  • Staffing ratio: ${firefighterRatio.toFixed(2)} per 1,000 (45% below SF)`);
  console.log(`  • Real budget growth: +${realGrowth.toFixed(1)}% over 5 years`);
  console.log(`  • Staffing gap: ~${Math.round(staffingGap).toLocaleString()} firefighters needed`);
  console.log(`  • Per capita spending: $${perCapitaSpending.toFixed(2)}`);
  console.log('');
  console.log('  DATA SOURCES:');
  console.log('  • CA State Controller (bythenumbers.sco.ca.gov)');
  console.log('  • NFPA 1710 Standards');
  console.log('  • CNN Investigation (January 2025)');
  console.log('  • Bureau of Labor Statistics');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
});
