const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak, LevelFormat } = require('docx');
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/la-county-ncb-analysis.json'), 'utf8'));
const patterns = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/la-county-ncb-patterns.json'), 'utf8'));

const fmt = (n) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const topDepts = Object.entries(data.byDepartment)
  .filter(([k]) => k !== 'Requesting Organization')
  .sort((a,b) => b[1].amount - a[1].amount).slice(0, 15);
const topVendors = data.topVendors.slice(0, 20);
const criticalPatterns = patterns.filter(p => p.severity === 'critical');
const highPatterns = patterns.filter(p => p.severity === 'high').slice(0, 10);
const megaContracts = patterns.find(p => p.type === 'MEGA_CONTRACTS');
const correctionsAmt = topDepts.find(d => d[0].includes('Corrections'))?.[1]?.amount || 0;

function makeCell(text, opts = {}) {
  const { header, right, center, bold, color, size, fill } = opts;
  return new TableCell({
    borders,
    shading: { fill: fill || (header ? "2c5282" : "FFFFFF"), type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: right ? AlignmentType.RIGHT : center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), bold: bold || header, color: color || (header ? "FFFFFF" : "000000"), size: size || 20 })]
    })]
  });
}

const children = [
  // Title
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("California State No-Bid Contract Analysis")] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [
    new TextRun({ text: `Generated: ${new Date(data.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 20, color: "666666" })
  ]}),

  // Executive Summary
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
  new Paragraph({ spacing: { after: 150 }, children: [
    new TextRun(`This report analyzes `),
    new TextRun({ text: `${data.totalLACountyContracts.toLocaleString()} non-competitive bid contracts`, bold: true }),
    new TextRun(` awarded by California state agencies, totaling `),
    new TextRun({ text: fmt(data.totalAmount), bold: true, color: "c53030" }),
    new TextRun(`. The analysis identifies suspicious patterns including repeat vendors, threshold clustering, and vendor-department relationships.`)
  ]}),

  // Key Findings
  new Table({ columnWidths: [9360], rows: [
    new TableRow({ children: [
      new TableCell({ borders, shading: { fill: "FEF3C7", type: ShadingType.CLEAR }, children: [
        new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "KEY FINDINGS", bold: true, size: 24, color: "92400E" })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(`${criticalPatterns.length} critical risk patterns identified`)] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(`${megaContracts?.contracts?.length || 0} contracts exceed $10M without competition`)] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(`Top vendor received ${fmt(topVendors[0]?.totalAmount || 0)} across ${topVendors[0]?.contractCount || 0} no-bid contracts`)] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 }, children: [new TextRun(`Dept of Corrections accounts for ${(correctionsAmt / data.totalAmount * 100).toFixed(1)}% of total NCB spending`)] }),
      ]})
    ]})
  ]}),

  new Paragraph({ children: [new PageBreak()] }),

  // Department Analysis
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Spending by Department")] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Top 15 state agencies by non-competitive bid spending:")] }),
  new Table({ columnWidths: [5500, 1500, 2360], rows: [
    new TableRow({ tableHeader: true, children: [
      makeCell("Department", { header: true }),
      makeCell("Contracts", { header: true, center: true }),
      makeCell("Total Amount", { header: true, right: true }),
    ]}),
    ...topDepts.map(([dept, stats], i) => new TableRow({ children: [
      makeCell(dept.length > 50 ? dept.slice(0,47) + '...' : dept, { fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
      makeCell(stats.count, { center: true, fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
      makeCell(fmt(stats.amount), { right: true, bold: stats.amount > 1e9, fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
    ]}))
  ]}),

  new Paragraph({ children: [new PageBreak()] }),

  // Top Vendors
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Top Vendors by NCB Value")] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Vendors receiving the highest total value of no-bid contracts:")] }),
  new Table({ columnWidths: [5000, 1200, 1800, 1360], rows: [
    new TableRow({ tableHeader: true, children: [
      makeCell("Vendor", { header: true }),
      makeCell("Contracts", { header: true, center: true }),
      makeCell("Total", { header: true, right: true }),
      makeCell("Avg Size", { header: true, right: true }),
    ]}),
    ...topVendors.map((v, i) => new TableRow({ children: [
      makeCell(v.name.length > 45 ? v.name.slice(0,42) + '...' : v.name, { fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
      makeCell(v.contractCount, { center: true, fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
      makeCell(fmt(v.totalAmount), { right: true, bold: v.totalAmount > 500e6, fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
      makeCell(fmt(v.avgContractSize), { right: true, fill: i % 2 === 0 ? "F7FAFC" : "FFFFFF" }),
    ]}))
  ]}),

  new Paragraph({ children: [new PageBreak()] }),

  // Suspicious Patterns
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Suspicious Patterns Detected")] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The following patterns indicate potential areas of concern:")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "CRITICAL RISK", color: "c53030" })] }),
  ...criticalPatterns.flatMap(p => [
    new Table({ columnWidths: [9360], rows: [
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: "FED7D7", type: ShadingType.CLEAR }, children: [
          new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: p.type.replace(/_/g, ' '), bold: true, size: 22, color: "c53030" })] }),
          new Paragraph({ children: [new TextRun({ text: p.description, size: 20 })] }),
          new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `Total Amount: ${fmt(p.totalAmount)}`, bold: true, size: 20 })] }),
        ]})
      ]})
    ]}),
    new Paragraph({ spacing: { after: 150 }, children: [] }),
  ]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "HIGH RISK", color: "DD6B20" })] }),
  ...highPatterns.flatMap(p => [
    new Table({ columnWidths: [9360], rows: [
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: "FEEBC8", type: ShadingType.CLEAR }, children: [
          new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: p.type.replace(/_/g, ' '), bold: true, size: 20, color: "C05621" })] }),
          new Paragraph({ children: [new TextRun({ text: p.description, size: 18 })] }),
          new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `Total Amount: ${fmt(p.totalAmount)}`, size: 18 })] }),
        ]})
      ]})
    ]}),
    new Paragraph({ spacing: { after: 100 }, children: [] }),
  ]),

  new Paragraph({ children: [new PageBreak()] }),

  // Recommendations
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Recommendations")] }),
  new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Audit repeat vendor relationships", bold: true }), new TextRun(" - Vendors with 10+ NCB contracts warrant immediate review.")] }),
  new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Review threshold clustering", bold: true }), new TextRun(" - Contracts clustering just below $5M and $10M thresholds suggest potential bid-splitting.")] }),
  new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Investigate mega-contracts", bold: true }), new TextRun(" - All contracts over $100M without competition require documented justification review.")] }),
  new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Strengthen vendor-department oversight", bold: true }), new TextRun(" - Departments with exclusive vendor relationships need enhanced procurement controls.")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400 }, children: [new TextRun("Data Sources")] }),
  new Paragraph({ children: [new TextRun({ text: "Primary: ", bold: true }), new TextRun("California Department of General Services Non-Competitive Bid Database")] }),
  new Paragraph({ children: [new TextRun({ text: "URL: ", bold: true }), new TextRun("https://data.ca.gov/dataset/non-competitive-bids")] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Records: ", bold: true }), new TextRun(`${data.totalLACountyContracts.toLocaleString()} contracts analyzed`)] }),

  new Table({ columnWidths: [9360], rows: [
    new TableRow({ children: [
      new TableCell({ borders, shading: { fill: "EDF2F7", type: ShadingType.CLEAR }, children: [
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [
          new TextRun({ text: "DISCLAIMER: ", bold: true, size: 18 }),
          new TextRun({ text: "This analysis identifies patterns that may warrant investigation but does not constitute evidence of fraud. All findings should be verified through official audit procedures.", size: 18, italics: true })
        ]})
      ]})
    ]})
  ]}),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 48, bold: true, color: "1a365d" },
        paragraph: { spacing: { after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "2c5282" }, paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "2d3748" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
  ]},
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "California Non-Competitive Bid Analysis", italics: true, size: 18, color: "666666" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
        new TextRun({ text: " of ", size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = path.join(__dirname, 'output/CA-NCB-Analysis-Report.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Report saved: ${outPath}`);
});
