import jsPDF from 'jspdf';

export interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  instructorName?: string;
  organizationName?: string;
  certificateDescription?: string;
  signBelowText?: string;
  instructorSignature?: string;
  deanSignature?: string;
  courseLogo?: string;
  creatorLogo?: string;
  applicationLogo?: string; // Add separate application logo field
  applicationLogoEnabled?: boolean;
  sealImage?: string; // Add seal image data URL
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  hasWatermark: boolean;
  hasBorder: boolean;
  hasSeal: boolean;
}

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: '1',
    name: 'Classic Academic',
    backgroundColor: '#FFFFFF',
    borderColor: '#1E3A8A',
    textColor: '#1F2937',
    accentColor: '#D4AF37',
    fontFamily: 'serif',
    hasWatermark: true,
    hasBorder: true,
    hasSeal: true
  },
  {
    id: '2',
    name: 'Modern Corporate',
    backgroundColor: '#F8FAFC',
    borderColor: '#2563EB',
    textColor: '#1F2937',
    accentColor: '#3B82F6',
    fontFamily: 'sans-serif',
    hasWatermark: false,
    hasBorder: true,
    hasSeal: true
  },
  {
    id: '3',
    name: 'Premium Gold',
    backgroundColor: '#FEF7E0',
    borderColor: '#D4AF37',
    textColor: '#92400E',
    accentColor: '#B8860B',
    fontFamily: 'serif',
    hasWatermark: true,
    hasBorder: true,
    hasSeal: true
  },
  {
    id: '4',
    name: 'Minimalist Clean',
    backgroundColor: '#FFFFFF',
    borderColor: '#6B7280',
    textColor: '#374151',
    accentColor: '#9CA3AF',
    fontFamily: 'sans-serif',
    hasWatermark: false,
    hasBorder: false,
    hasSeal: false
  }
];

/** Return jsPDF image format from a data URL; use when drawing so JPEG-compressed images render correctly. */
function getImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  return 'PNG';
}

export class PDFCertificateGenerator {
  private doc: jsPDF;
  private template: CertificateTemplate;
  private data: CertificateData;

  constructor(template: CertificateTemplate, data: CertificateData) {
    this.doc = new jsPDF('landscape', 'mm', 'a4');
    this.template = template;
    this.data = data;
  }

  generate(): jsPDF {
    this.setupPage();
    this.drawBorder();
    this.drawHeader();
    this.drawContent();
    this.drawSignatures();
    this.drawSeal();
    this.drawLogos();
    
    return this.doc;
  }

  private setupPage(): void {
    this.doc.setFillColor(this.template.backgroundColor);
    this.doc.rect(0, 0, 297, 210, 'F');
  }

  private drawBorder(): void {
    if (!this.template.hasBorder) return;

    this.doc.setDrawColor(this.template.borderColor);
    this.doc.setLineWidth(2);
    this.doc.rect(10, 10, 277, 190);
    
    // Inner border
    this.doc.setLineWidth(0.5);
    this.doc.rect(15, 15, 267, 180);
  }

  private drawHeader(): void {
    // Top accent bar
    this.doc.setFillColor(this.template.borderColor);
    this.doc.rect(20, 20, 257, 8, 'F');

    // Main title
    this.doc.setTextColor(this.template.textColor);
    this.doc.setFontSize(24);
    this.doc.setFont(this.template.fontFamily, 'bold');
    this.doc.text('Certificate of Completion', 148.5, 45, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text(this.template.name, 148.5, 55, { align: 'center' });

    // Decorative line
    this.doc.setDrawColor(this.template.accentColor);
    this.doc.setLineWidth(1);
    this.doc.line(80, 60, 217, 60);
  }

  private drawContent(): void {
    const centerX = 148.5;
    const startY = 80;

    // Certificate description (custom text from preview)
    this.doc.setTextColor(this.template.textColor);
    this.doc.setFontSize(12);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.text(this.data.certificateDescription || 'This is to certify that', centerX, startY, { align: 'center' });

    // Student name
    this.doc.setFontSize(18);
    this.doc.setFont(this.template.fontFamily, 'bold');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text(this.data.studentName, centerX, startY + 20, { align: 'center' });

    // Sign below text (custom text from preview)
    this.doc.setFontSize(12);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.setTextColor(this.template.textColor);
    this.doc.text(this.data.signBelowText || 'has successfully completed the course', centerX, startY + 35, { align: 'center' });

    // Course name
    this.doc.setFontSize(14);
    this.doc.setFont(this.template.fontFamily, 'bold');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text(this.data.courseName, centerX, startY + 50, { align: 'center' });

    // Completion date (keep clear of seal below)
    this.doc.setFontSize(10);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.setTextColor(this.template.textColor);
    this.doc.text(`Completed on: ${this.data.completionDate}`, centerX, startY + 62, { align: 'center' });
  }

  private drawSignatures(): void {
    const startY = 140;
    const leftX = 60;
    const rightX = 237;

    // Left signature (Instructor)
    this.doc.setDrawColor(this.template.textColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(leftX - 20, startY, leftX + 20, startY);

    // Add signature image if available (format must match data URL: PNG or JPEG)
    if (this.data.instructorSignature) {
      try {
        const fmt = getImageFormat(this.data.instructorSignature);
        this.doc.addImage(this.data.instructorSignature, fmt, leftX - 15, startY - 8, 30, 12);
      } catch {
        // Optional image; skip if invalid
      }
    }

    this.doc.setFontSize(10);
    this.doc.setFont(this.template.fontFamily, 'bold');
    this.doc.setTextColor(this.template.textColor);
    this.doc.text(this.data.instructorName || 'Course Instructor', leftX, startY + 10, { align: 'center' });

    this.doc.setFontSize(8);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text('Creator', leftX, startY + 15, { align: 'center' });

    // Right signature (Dean)
    this.doc.line(rightX - 20, startY, rightX + 20, startY);
    
    // Add signature image if available (format must match data URL: PNG or JPEG)
    if (this.data.deanSignature) {
      try {
        const fmt = getImageFormat(this.data.deanSignature);
        this.doc.addImage(this.data.deanSignature, fmt, rightX - 15, startY - 8, 30, 12);
      } catch {
        // Optional image; skip if invalid
      }
    }

    this.doc.setFontSize(10);
    this.doc.setFont(this.template.fontFamily, 'bold');
    this.doc.setTextColor(this.template.textColor);
    this.doc.text(this.data.organizationName || 'Academic Dean', rightX, startY + 10, { align: 'center' });

    this.doc.setFontSize(8);
    this.doc.setFont(this.template.fontFamily, 'normal');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text('CEO, Content Creator App', rightX, startY + 15, { align: 'center' });
  }

  private drawSeal(): void {
    if (!this.template.hasSeal) return;

    const centerX = 148.5;
    const centerY = 172; // Below completion date with clear gap so they don't merge

    // Add the actual seal image to the PDF; format must match data URL
    if (this.data.sealImage) {
      try {
        this.doc.addImage(this.data.sealImage, getImageFormat(this.data.sealImage), centerX - 18, centerY - 18, 36, 36);
      } catch {
        // Fallback to simple circle if image fails
        this.doc.setFillColor(this.template.accentColor);
        this.doc.circle(centerX, centerY, 18, 'F');
      }
    } else {
      // Fallback to simple circle if no seal image provided
      this.doc.setFillColor(this.template.accentColor);
      this.doc.circle(centerX, centerY, 18, 'F');
    }
  }

  private drawCertificateNumber(): void {
    this.doc.setFontSize(8);
    this.doc.setFont('monospace', 'normal');
    this.doc.setTextColor(this.template.accentColor);
    this.doc.text(`Certificate #: ${this.data.certificateNumber}`, 148.5, 190, { align: 'center' });
  }

  private drawLogos(): void {
    const centerX = 148.5;
    const logoY = 25;
    const logoSize = 15;

    // Draw application logo (left side - top-left corner); format must match data URL
    if (this.data.applicationLogo) {
      try {
        this.doc.addImage(this.data.applicationLogo, getImageFormat(this.data.applicationLogo), 30, logoY, logoSize, logoSize);
      } catch {
        // Optional image; skip if invalid
      }
    }

    // Draw creator logo (center top - above title area)
    if (this.data.creatorLogo) {
      try {
        this.doc.addImage(this.data.creatorLogo, getImageFormat(this.data.creatorLogo), centerX - logoSize/2, logoY - 8, logoSize, logoSize);
      } catch {
        // Optional image; skip if invalid
      }
    }

    // Draw course logo (right side - top-right corner)
    if (this.data.courseLogo) {
      try {
        this.doc.addImage(this.data.courseLogo, getImageFormat(this.data.courseLogo), 252, logoY, logoSize, logoSize);
      } catch {
        // Optional image; skip if invalid
      }
    }
  }

  download(filename?: string): void {
    const defaultFilename = `certificate_${this.data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    this.doc.save(filename || defaultFilename);
  }
}

export const generateCertificate = (templateId: string, data: CertificateData): jsPDF => {
  const template = certificateTemplates.find(t => t.id === templateId) || certificateTemplates[0];
  const generator = new PDFCertificateGenerator(template, data);
  return generator.generate();
};

/** Returns the certificate PDF as a Blob for upload (e.g. to backend). */
export const generateCertificateBlob = (templateId: string, data: CertificateData): Blob => {
  const doc = generateCertificate(templateId, data);
  return doc.output('blob') as Blob;
};

/**
 * Fetches the course's certificate template PDF from URL, overlays learner data (name, date, course, cert number),
 * and returns the filled PDF as a Blob. Used when the course has certificateTemplatePdfUrl set.
 */
export async function fillCertificateTemplateFromUrl(
  templatePdfUrl: string,
  data: CertificateData
): Promise<Blob> {
  const pdfLib = await import('pdf-lib');
  const { PDFDocument, StandardFonts, rgb } = pdfLib;
  const response = await fetch(templatePdfUrl, { mode: 'cors' });
  if (!response.ok) throw new Error('Failed to fetch certificate template');
  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  if (pages.length === 0) throw new Error('Certificate template has no pages');
  const page = pages[0];
  const { width, height } = page.getSize();
  const centerX = width / 2;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0.2, 0.2, 0.2);

  // Approximate positions (pdf-lib origin is bottom-left; y increases upward)
  const yCourse = height - 80;
  const yDesc = height - 120;
  const yName = height - 160;
  const ySignBelow = height - 200;
  const yDate = height - 240;
  const yCertNo = 60;
  const fontSizeTitle = 20;
  const fontSizeName = 18;
  const fontSizeBody = 12;
  const fontSizeSmall = 10;

  const drawCentered = (text: string, y: number, size: number, useBold = false) => {
    const f = useBold ? fontBold : font;
    const textWidth = f.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size,
      font: f,
      color: textColor
    });
  };

  drawCentered(data.courseName || 'Course', yCourse, fontSizeTitle, true);
  if (data.certificateDescription) {
    drawCentered(data.certificateDescription, yDesc, fontSizeBody);
  }
  drawCentered(data.studentName, yName, fontSizeName, true);
  if (data.signBelowText) {
    drawCentered(data.signBelowText, ySignBelow, fontSizeBody);
  }
  drawCentered(`Completion date: ${data.completionDate}`, yDate, fontSizeSmall);
  drawCentered(`Certificate #: ${data.certificateNumber}`, yCertNo, fontSizeSmall);

  const bytes = await pdfDoc.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

export const downloadCertificate = (templateId: string, data: CertificateData, filename?: string): void => {
  // Create a new PDF document
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Set up the page
  doc.setFillColor('#F5F5DC'); // Light beige background
  doc.rect(0, 0, 297, 210, 'F');
  
  // Draw border (brown border like in preview)
  doc.setDrawColor('#8B4513');
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);
  
  const centerX = 148.5;
  let currentY = 40;
  
  // Main title
  doc.setTextColor('#8B4513');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.courseName || 'Certificate of Achievement', centerX, currentY, { align: 'center' });
  currentY += 20;
  
  // Decorative line
  doc.setDrawColor('#CD7F32');
  doc.setLineWidth(1);
  doc.line(centerX - 40, currentY, centerX + 40, currentY);
  currentY += 30;
  
  // Certificate description
  doc.setTextColor('#8B4513');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.certificateDescription || 'This is to certify that', centerX, currentY, { align: 'center' });
  currentY += 20;
  
  // Student name
  doc.setTextColor('#CD7F32');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.studentName, centerX, currentY, { align: 'center' });
  currentY += 20;
  
  // Sign below text
  doc.setTextColor('#8B4513');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.signBelowText || 'has successfully completed the course', centerX, currentY, { align: 'center' });
  currentY += 40;
  
  // Signatures section
  const leftX = 60;
  const rightX = 237;
  const signatureY = 140;
  
  // Left signature
  doc.setDrawColor('#8B4513');
  doc.setLineWidth(1);
  doc.line(leftX - 20, signatureY, leftX + 20, signatureY);
  
  // Add instructor signature image if available
  if (data.instructorSignature) {
    try {
      doc.addImage(data.instructorSignature, 'PNG', leftX - 15, signatureY - 8, 30, 12);
    } catch {
      // Optional image; skip if invalid
    }
  }
  
  doc.setTextColor('#8B4513');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.instructorName || 'Course Instructor', leftX, signatureY + 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#CD7F32');
  doc.text('Creator', leftX, signatureY + 15, { align: 'center' });
  
  // Right signature
  doc.line(rightX - 20, signatureY, rightX + 20, signatureY);
  
  // Add dean signature image if available
  if (data.deanSignature) {
    try {
      doc.addImage(data.deanSignature, 'PNG', rightX - 15, signatureY - 8, 30, 12);
    } catch {
      // Optional image; skip if invalid
    }
  }
  
  doc.setTextColor('#8B4513');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organizationName || 'Academic Dean', rightX, signatureY + 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#CD7F32');
  doc.text('CEO, Content Creator App', rightX, signatureY + 15, { align: 'center' });
  
  // Certificate number
  doc.setFontSize(8);
  doc.setFont('monospace', 'normal');
  doc.setTextColor('#CD7F32');
  doc.text(`Certificate #: ${data.certificateNumber}`, centerX, 190, { align: 'center' });
  
  // Add the actual seal image to the PDF
  const sealCenterX = 148.5;
  const sealCenterY = 160; // Positioned above the certificate number area
  
  if (data.sealImage) {
    try {
      // Add seal with larger size
      doc.addImage(data.sealImage, 'PNG', sealCenterX - 18, sealCenterY - 18, 36, 36);
    } catch {
      // Fallback to simple circle if image fails
      doc.setFillColor('#CD7F32');
      doc.circle(sealCenterX, sealCenterY, 18, 'F');
    }
  } else {
    // Fallback to simple circle if no seal image provided
    doc.setFillColor('#CD7F32');
    doc.circle(sealCenterX, sealCenterY, 18, 'F');
  }
  
  // Draw logos
  const logoY = 25;
  const logoSize = 15;
  
  // Draw application logo (left side - top-left corner)
  if (data.applicationLogo) {
    try {
      doc.addImage(data.applicationLogo, 'PNG', 30, logoY, logoSize, logoSize);
    } catch {
      // Optional image; skip if invalid
    }
  }
  
  // Draw course logo (right side - top-right corner)
  if (data.courseLogo) {
    try {
      doc.addImage(data.courseLogo, 'PNG', 252, logoY, logoSize, logoSize);
    } catch {
      // Optional image; skip if invalid
    }
  }
  
  // Draw creator logo (center top - above title area)
  if (data.creatorLogo) {
    try {
      doc.addImage(data.creatorLogo, 'PNG', 148.5 - logoSize/2, logoY - 8, logoSize, logoSize);
    } catch {
      // Optional image; skip if invalid
    }
  }
  
  // Download the PDF
  const defaultFilename = `certificate_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename || defaultFilename);
}; 