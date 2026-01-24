/**
 * LA County Bids DOCX Report Generator
 * Addressed to IAFF Local 1014 President David Gillotte
 *
 * Input:  scripts/output/la-county-bids-data.json
 * Output: scripts/output/LA-County-Bids-Report.docx
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

// Load data
const dataPath = path.join(__dirname, 'output/la-county-bids-data.json');
if (!fs.existsSync(dataPath)) {
  console.error('Error: la-county-bids-data.json not found.');
  console.error('Run: npx tsx scripts/la-county-bids-scraper.ts');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function makeCell(text, opts = {}) {
  const { header, right, center, bold, color, size, fill } = opts;
  return new TableCell({
    borders,
    shading: { fill: fill || (header ? '1a5276' : 'FFFFFF'), type: ShadingType.CLEAR },
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

// Prepare data
const topDepts = Object.entries(data.byDepartment)
  .sort((a, b) => b[1].count - a[1].count);

const bidTypes = Object.entries(data.byBidType)
  .sort((a, b) => b[1].count - a[1].count);

const topCommodities = Object.entries(data.byCommodity)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 15);

const upcomingBids = (data.upcomingClosings || []).slice(0, 15);
const closingSoon = (data.closingSoon || []).slice(0, 10);

// Fire Department specific data
const fireBids = data.bids.filter(b => b.department === 'Fire Department');
const fireCount = data.byDepartment['Fire Department']?.count || 0;

// Public safety related (Fire + Sheriff + Health)
const sheriffCount = data.byDepartment['Sheriff']?.count || 0;
const healthCount = data.byDepartment['Health Services']?.count || 0;
const publicSafetyTotal = fireCount + sheriffCount + healthCount;

// Format date
const reportDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Build document content
const children = [
  // Letterhead / Date
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 400 },
    children: [new TextRun({ text: reportDate, size: 22 })],
  }),

  // Recipient
  new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: 'David Gillotte', bold: true, size: 24 })],
  }),
  new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: 'President, IAFF Local 1014', size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: 'Los Angeles County Fire Fighters', size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 400 },
    children: [new TextRun({ text: 'Los Angeles, California', size: 22 })],
  }),

  // Subject Line
  new Paragraph({
    spacing: { after: 300 },
    children: [
      new TextRun({ text: 'RE: ', bold: true, size: 22 }),
      new TextRun({ text: 'Los Angeles County Open Solicitations Analysis', bold: true, size: 22 }),
    ],
  }),

  // Salutation
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'President Gillotte,', size: 22 })],
  }),

  // Opening paragraph
  new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Please find enclosed a comprehensive analysis of Los Angeles County\'s current open solicitations. This report was generated from official data published by the LA County Internal Services Department Bids Portal on ', size: 22 }),
      new TextRun({ text: new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), bold: true, size: 22 }),
      new TextRun({ text: '.', size: 22 }),
    ],
  }),

  // Key findings box
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'EBF5FB', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 150 },
                children: [new TextRun({ text: 'KEY FINDINGS', bold: true, size: 26, color: '1a5276' })],
              }),
              new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [
                  new TextRun({ text: `${data.totalBids} `, bold: true, size: 22 }),
                  new TextRun({ text: 'total open solicitations across LA County', size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [
                  new TextRun({ text: `${fireCount} `, bold: true, size: 22 }),
                  new TextRun({ text: 'solicitation(s) directly from LA County Fire Department', size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [
                  new TextRun({ text: `${publicSafetyTotal} `, bold: true, size: 22 }),
                  new TextRun({ text: 'solicitations from public safety departments (Fire, Sheriff, Health Services)', size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                children: [
                  new TextRun({ text: `${Object.keys(data.byDepartment).length} `, bold: true, size: 22 }),
                  new TextRun({ text: 'County departments with active procurement activity', size: 22 }),
                ],
              }),
              new Paragraph({
                numbering: { reference: 'bullets', level: 0 },
                spacing: { after: 150 },
                children: [
                  new TextRun({ text: `${upcomingBids.length} `, bold: true, size: 22 }),
                  new TextRun({ text: 'solicitations closing within the next 14 days', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  new Paragraph({ spacing: { after: 200 }, children: [] }),

  // Fire Department specific section
  ...(fireBids.length > 0
    ? [
        new Paragraph({
          spacing: { before: 100 },
          children: [new TextRun({ text: 'Fire Department Solicitations:', bold: true, size: 22, color: 'C0392B' })],
        }),
        ...fireBids.map(bid => new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: `• ${bid.bidNumber}: `, bold: true, size: 22 }),
            new TextRun({ text: bid.title, size: 22 }),
            new TextRun({ text: ` (Closes: ${bid.closingDate})`, size: 20, color: '666666' }),
          ],
        })),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
      ]
    : []),

  new Paragraph({ children: [new PageBreak()] }),

  // Title for detailed section
  new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun('Los Angeles County')],
  }),
  new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { after: 300 },
    children: [new TextRun('Open Solicitations Analysis')],
  }),

  // Department Analysis
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun('Solicitations by Department')],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun(`Complete breakdown of all ${data.totalBids} open solicitations by issuing department:`)],
  }),
  new Table({
    columnWidths: [5500, 1800, 2060],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('Department', { header: true }),
          makeCell('Open Bids', { header: true, center: true }),
          makeCell('% of Total', { header: true, right: true }),
        ],
      }),
      ...topDepts.map(([dept, stats], i) =>
        new TableRow({
          children: [
            makeCell(dept.length > 45 ? dept.slice(0, 42) + '...' : dept, {
              fill: dept === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
              bold: dept === 'Fire Department',
            }),
            makeCell(stats.count, {
              center: true,
              fill: dept === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
              bold: dept === 'Fire Department',
            }),
            makeCell(`${((stats.count / data.totalBids) * 100).toFixed(1)}%`, {
              right: true,
              fill: dept === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
            }),
          ],
        })
      ),
      // Total row
      new TableRow({
        children: [
          makeCell('TOTAL', { bold: true, fill: '1a5276', color: 'FFFFFF' }),
          makeCell(data.totalBids, { center: true, bold: true, fill: '1a5276', color: 'FFFFFF' }),
          makeCell('100.0%', { right: true, bold: true, fill: '1a5276', color: 'FFFFFF' }),
        ],
      }),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Bid Types
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun('Solicitation Types')],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun('Breakdown by procurement category:')],
  }),
  new Table({
    columnWidths: [5000, 2000, 2360],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('Type', { header: true }),
          makeCell('Count', { header: true, center: true }),
          makeCell('Percentage', { header: true, right: true }),
        ],
      }),
      ...bidTypes.map(([type, stats], i) =>
        new TableRow({
          children: [
            makeCell(type, { fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF' }),
            makeCell(stats.count, { center: true, fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF' }),
            makeCell(`${((stats.count / data.totalBids) * 100).toFixed(1)}%`, {
              right: true,
              fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
            }),
          ],
        })
      ),
    ],
  }),

  new Paragraph({ spacing: { after: 300 }, children: [] }),

  // Top Commodities
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun('Top Commodity Categories')],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun('Most common procurement categories by volume:')],
  }),
  new Table({
    columnWidths: [6500, 1500, 1360],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeCell('Commodity Category', { header: true }),
          makeCell('Count', { header: true, center: true }),
          makeCell('% of Total', { header: true, right: true }),
        ],
      }),
      ...topCommodities.map(([cat, stats], i) =>
        new TableRow({
          children: [
            makeCell(cat.length > 55 ? cat.slice(0, 52) + '...' : cat, {
              fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
            }),
            makeCell(stats.count, { center: true, fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF' }),
            makeCell(`${((stats.count / data.totalBids) * 100).toFixed(1)}%`, {
              right: true,
              fill: i % 2 === 0 ? 'F4F6F6' : 'FFFFFF',
            }),
          ],
        })
      ),
    ],
  }),

  new Paragraph({ children: [new PageBreak()] }),

  // Upcoming Deadlines
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun('Upcoming Closing Dates')],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun('Solicitations closing within the next 14 days:')],
  }),
  ...(upcomingBids.length > 0
    ? [
        new Table({
          columnWidths: [1800, 3700, 2000, 1860],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                makeCell('Bid #', { header: true }),
                makeCell('Title', { header: true }),
                makeCell('Department', { header: true }),
                makeCell('Closes', { header: true, center: true }),
              ],
            }),
            ...upcomingBids.map((bid, i) =>
              new TableRow({
                children: [
                  makeCell(bid.bidNumber, {
                    fill: bid.department === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'FEF9E7' : 'FFFFFF',
                    size: 18,
                  }),
                  makeCell(bid.title.length > 38 ? bid.title.slice(0, 35) + '...' : bid.title, {
                    fill: bid.department === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'FEF9E7' : 'FFFFFF',
                    size: 18,
                  }),
                  makeCell(
                    bid.department.length > 18 ? bid.department.slice(0, 15) + '...' : bid.department,
                    {
                      fill: bid.department === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'FEF9E7' : 'FFFFFF',
                      size: 18,
                    }
                  ),
                  makeCell(bid.closingDate.split(' ')[0], {
                    center: true,
                    fill: bid.department === 'Fire Department' ? 'FADBD8' : i % 2 === 0 ? 'FEF9E7' : 'FFFFFF',
                    color: 'B7950B',
                    size: 18,
                  }),
                ],
              })
            ),
          ],
        }),
      ]
    : [new Paragraph({ children: [new TextRun({ text: 'No solicitations closing within 14 days.', italics: true })] })]),

  new Paragraph({ children: [new PageBreak()] }),

  // Data Source & Verification
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun('Data Source & Verification')],
  }),
  new Paragraph({
    spacing: { after: 150 },
    children: [
      new TextRun({ text: 'Source: ', bold: true }),
      new TextRun(data.source),
    ],
  }),
  new Paragraph({
    spacing: { after: 150 },
    children: [
      new TextRun({ text: 'Portal URL: ', bold: true }),
      new TextRun(data.sourceUrl),
    ],
  }),
  new Paragraph({
    spacing: { after: 150 },
    children: [
      new TextRun({ text: 'Data Retrieved: ', bold: true }),
      new TextRun(new Date(data.generatedAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })),
    ],
  }),
  new Paragraph({
    spacing: { after: 300 },
    children: [
      new TextRun({ text: 'Total Records Analyzed: ', bold: true }),
      new TextRun(`${data.totalBids} open solicitations`),
    ],
  }),

  // Closing
  new Paragraph({
    spacing: { before: 200, after: 150 },
    children: [
      new TextRun({
        text: 'This data is publicly available and can be independently verified at the LA County Bids Portal. Should you require additional analysis or have questions regarding specific solicitations, please do not hesitate to reach out.',
        size: 22,
      }),
    ],
  }),

  new Paragraph({
    spacing: { before: 300 },
    children: [new TextRun({ text: 'Respectfully submitted,', size: 22 })],
  }),

  // Disclaimer
  new Paragraph({ spacing: { before: 400 }, children: [] }),
  new Table({
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: 'F8F9F9', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                children: [
                  new TextRun({ text: 'DISCLAIMER: ', bold: true, size: 18 }),
                  new TextRun({
                    text:
                      'This report is generated from publicly available data published by the Los Angeles County Internal Services Department. All figures reflect the official records as of the retrieval date. Solicitation details are subject to change. Verify current information at camisvr.co.la.ca.us/lacobids.',
                    size: 18,
                    italics: true,
                  }),
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
        run: { size: 44, bold: true, color: '1a5276' },
        paragraph: { spacing: { after: 100 }, alignment: AlignmentType.CENTER },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, color: '1a5276' },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 0 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'LA County Open Solicitations - Confidential',
                  italics: true,
                  size: 18,
                  color: '666666',
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                new TextRun({ text: ' of ', size: 18 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

// Generate DOCX
Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, 'output/LA-County-Bids-Report.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Report saved: ${outPath}`);
  console.log(`Addressed to: David Gillotte, President IAFF Local 1014`);
  console.log(`Total solicitations: ${data.totalBids}`);
  console.log(`Fire Department bids: ${fireCount}`);
  console.log(`Source: ${data.source}`);
});
