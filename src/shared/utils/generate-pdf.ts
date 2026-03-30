import jsPDF from 'jspdf';
import { UserOptions } from 'jspdf-autotable';
import {
  ComplaintSummaryPhotoItem,
  buildComplaintSummarySections,
} from '../../features/denuncia/utils/complaint-summary';
import { ComplaintDraft, ComplaintPhoto } from '../../features/denuncia/types/denuncia';

type AutoTableDoc = jsPDF & {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: {
    finalY: number;
  };
};

type PdfImageFormat = 'JPEG' | 'PNG' | 'WEBP';

interface PreparedPdfPhoto {
  photo: ComplaintPhoto;
  width: number;
  height: number;
  format: PdfImageFormat;
}

interface FittedImageDimensions {
  width: number;
  height: number;
}

const PAGE_MARGIN_X = 20;
const PAGE_MARGIN_BOTTOM = 20;
const PAGE_START_Y = 20;
const CONTENT_WIDTH = 170;
const PHOTO_GALLERY_GAP = 10;
const PHOTO_CARD_PADDING = 4;
const PHOTO_FRAME_HEIGHT = 96;
const PHOTO_SINGLE_FRAME_HEIGHT = 130;

const fitImageWithinBox = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): FittedImageDimensions => {
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
};

const getPdfImageFormat = (type: string): PdfImageFormat => {
  if (type.includes('png')) return 'PNG';
  if (type.includes('webp')) return 'WEBP';
  return 'JPEG';
};

const loadPhotoForPdf = async (photo: ComplaintPhoto): Promise<PreparedPdfPhoto> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () =>
      resolve({
        photo,
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
        format: getPdfImageFormat(photo.type),
      });

    image.onerror = () =>
      reject(new Error(`Não foi possível carregar a imagem ${photo.name} para o PDF.`));

    image.src = photo.dataUrl;
  });

const ensurePageSpace = (doc: jsPDF, currentY: number, requiredHeight: number): number => {
  const pageHeight = doc.internal.pageSize.height;

  if (currentY + requiredHeight <= pageHeight - PAGE_MARGIN_BOTTOM) {
    return currentY;
  }

  doc.addPage();
  return PAGE_START_Y;
};

const addSectionTitle = (doc: jsPDF, title: string, startY: number): number => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE_MARGIN_X, startY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  return startY + 10;
};

const addPhotoGallery = async (
  doc: jsPDF,
  item: ComplaintSummaryPhotoItem,
  startY: number
): Promise<number> => {
  let yPos = ensurePageSpace(doc, startY, 12);

  doc.setFont('helvetica', 'bold');
  doc.text(item.label, PAGE_MARGIN_X, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;

  if (item.photos.length === 0) {
    yPos = ensurePageSpace(doc, yPos, 8);
    doc.text(item.emptyText, PAGE_MARGIN_X, yPos);
    return yPos + 8;
  }

  const preparedPhotos = await Promise.all(item.photos.map((photo) => loadPhotoForPdf(photo)));

  for (let index = 0; index < preparedPhotos.length; index += 2) {
    const rowPhotos = preparedPhotos.slice(index, index + 2);
    const columns = rowPhotos.length === 1 ? 1 : 2;
    const cardWidth =
      columns === 1
        ? CONTENT_WIDTH
        : (CONTENT_WIDTH - PHOTO_GALLERY_GAP) / 2;
    const frameWidth = cardWidth - PHOTO_CARD_PADDING * 2;
    const frameHeight =
      columns === 1 ? PHOTO_SINGLE_FRAME_HEIGHT : PHOTO_FRAME_HEIGHT;
    const rowMetrics = rowPhotos.map((entry) => {
      const fittedImage = fitImageWithinBox(
        entry.width,
        entry.height,
        frameWidth,
        frameHeight
      );
      const captionLines = doc.splitTextToSize(
        entry.photo.name,
        cardWidth - PHOTO_CARD_PADDING * 2
      );
      const cardHeight =
        frameHeight + captionLines.length * 5 + PHOTO_CARD_PADDING * 3 + 2;

      return {
        ...entry,
        fittedImage,
        captionLines,
        cardHeight,
      };
    });

    const rowHeight = Math.max(...rowMetrics.map((entry) => entry.cardHeight));
    yPos = ensurePageSpace(doc, yPos, rowHeight);

    rowMetrics.forEach((entry, rowIndex) => {
      const xPos = PAGE_MARGIN_X + rowIndex * (cardWidth + PHOTO_GALLERY_GAP);
      const frameX = xPos + PHOTO_CARD_PADDING;
      const frameY = yPos + PHOTO_CARD_PADDING;
      const imageX = frameX + (frameWidth - entry.fittedImage.width) / 2;
      const imageY = frameY + (frameHeight - entry.fittedImage.height) / 2;
      const captionY = frameY + frameHeight + 5;

      doc.roundedRect(xPos, yPos, cardWidth, rowHeight, 3, 3);
      doc.addImage(
        entry.photo.dataUrl,
        entry.format,
        imageX,
        imageY,
        entry.fittedImage.width,
        entry.fittedImage.height
      );
      doc.text(entry.captionLines, frameX, captionY);
    });

    yPos += rowHeight + 8;
  }

  return yPos;
};

export const generatePDF = async (complaint: ComplaintDraft): Promise<Blob> => {
  const doc = new jsPDF();
  const pdfDoc = doc as AutoTableDoc;
  const sections = buildComplaintSummarySections(complaint);

  doc.setFont('helvetica');

  doc.setFontSize(20);
  doc.text('Relatório de Denúncia', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(
    complaint.address.councilRegion?.nome ?? 'Conselho Tutelar não identificado',
    105,
    30,
    { align: 'center' }
  );
  doc.setFontSize(12);

  let yPos = 45;

  for (const [index, section] of sections.entries()) {
    yPos = ensurePageSpace(doc, yPos, 16);
    yPos = addSectionTitle(doc, `${index + 1}. ${section.title}`, yPos);

    if (section.description) {
      const descriptionLines = doc.splitTextToSize(section.description, CONTENT_WIDTH);
      yPos = ensurePageSpace(doc, yPos, descriptionLines.length * 6 + 4);
      doc.text(descriptionLines, PAGE_MARGIN_X, yPos);
      yPos += descriptionLines.length * 6 + 4;
    }

    const textItems = section.items.filter((item) => item.type === 'text');
    const photoItems = section.items.filter((item) => item.type === 'photos');

    if (textItems.length > 0) {
      pdfDoc.autoTable({
        startY: yPos,
        head: [['Pergunta', 'Resposta']],
        body: textItems.map((item) => [item.label, item.value]),
        theme: 'striped',
        headStyles: {
          fillColor: [251, 192, 45],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [66, 66, 66],
          fontSize: 10,
          valign: 'top',
        },
        columnStyles: {
          0: { cellWidth: 68 },
          1: { cellWidth: 'auto' },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
          textColor: [66, 66, 66],
          fontSize: 10,
        },
        margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },
      });

      yPos = pdfDoc.lastAutoTable.finalY + 10;
    }

    for (const item of photoItems) {
      yPos = await addPhotoGallery(doc, item, yPos);
    }

    yPos += 8;
  }

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    doc.setFontSize(10);
    doc.text(
      `Powered by ProtegeSaúde, ${new Date().toLocaleDateString('pt-BR')}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};
