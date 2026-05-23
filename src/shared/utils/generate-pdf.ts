import jsPDF from 'jspdf';
import { ComplaintDraft } from '../../features/denuncia/types/denuncia';
import { buildComplaintPdfHtml } from '../templates/complaint-pdf/complaint-pdf-template';

const A4_WIDTH_PT = 595.28;
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const MIN_SAFE_PAGE_SLICE_HEIGHT_PX = 160;
const PAGE_CONTINUATION_TOP_MARGIN_PX = 48;
const PAGE_CONTINUATION_BOTTOM_MARGIN_PX = 56;

interface PdfRenderTarget {
  container: HTMLDivElement;
  source: HTMLElement;
  style: HTMLStyleElement;
}

const waitForNextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const waitForImages = async (root: ParentNode): Promise<void> => {
  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    })
  );
};

const createPdfRenderTarget = async (html: string): Promise<PdfRenderTarget> => {
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
  const sourceTemplate = parsedDocument.querySelector<HTMLElement>('.complaint-report');
  const styleContent = Array.from(parsedDocument.querySelectorAll('style'))
    .map((style) => style.textContent || '')
    .join('\n');

  if (!sourceTemplate) {
    throw new Error('Template do PDF indisponível.');
  }

  const style = document.createElement('style');
  style.textContent = styleContent;
  style.setAttribute('data-complaint-pdf-template', 'true');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.minHeight = `${A4_HEIGHT_PX}px`;
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';
  container.style.background = '#ffffff';
  container.setAttribute('aria-hidden', 'true');

  const source = document.importNode(sourceTemplate, true);
  container.appendChild(source);
  document.head.appendChild(style);
  document.body.appendChild(container);

  await waitForImages(container);
  await waitForNextFrame();

  const bounds = source.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0) {
    container.remove();
    style.remove();
    throw new Error('Template do PDF foi carregado sem dimensões visíveis.');
  }

  return {
    container,
    source,
    style,
  };
};

const hasVisibleCanvasContent = (canvas: HTMLCanvasElement): boolean => {
  const context = canvas.getContext('2d');

  if (!context) return true;

  const step = 24;
  const { width, height } = canvas;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;
      const isVisible = alpha > 0;
      const isWhite = red > 248 && green > 248 && blue > 248;

      if (isVisible && !isWhite) {
        return true;
      }
    }
  }

  return false;
};

const getSafePageBreakPositions = (source: HTMLElement): number[] => {
  const sourceTop = source.getBoundingClientRect().top;
  const breakableElements = Array.from(
    source.querySelectorAll<HTMLElement>(
      [
        '.complaint-section',
        '.complaint-section__title',
        '.complaint-table thead tr',
        '.complaint-table tbody tr',
        '.complaint-photo-group',
        '.complaint-photo-card',
        '.complaint-report__footer',
      ].join(',')
    )
  );
  const positions = breakableElements.map((element) =>
    Math.max(0, Math.round(element.getBoundingClientRect().top - sourceTop))
  );

  return Array.from(new Set([0, ...positions, source.scrollHeight])).sort(
    (first, second) => first - second
  );
};

const getNextPageBreak = (
  currentPosition: number,
  idealPosition: number,
  totalHeight: number,
  safeBreakPositions: number[]
): number => {
  if (idealPosition >= totalHeight) {
    return totalHeight;
  }

  const minimumPosition = currentPosition + MIN_SAFE_PAGE_SLICE_HEIGHT_PX;
  const safePosition = [...safeBreakPositions]
    .reverse()
    .find((position) => position > minimumPosition && position <= idealPosition);

  return safePosition || idealPosition;
};

const createCanvasSlice = (
  canvas: HTMLCanvasElement,
  startY: number,
  height: number
): HTMLCanvasElement => {
  const slice = document.createElement('canvas');
  slice.width = canvas.width;
  slice.height = height;

  const context = slice.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível preparar uma página do PDF.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, slice.width, slice.height);
  context.drawImage(
    canvas,
    0,
    startY,
    canvas.width,
    height,
    0,
    0,
    canvas.width,
    height
  );

  return slice;
};

const renderHtmlToPdf = async (source: HTMLElement): Promise<Blob> => {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(source, {
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    logging: false,
    scale: 2,
    useCORS: true,
    windowWidth: A4_WIDTH_PX,
    windowHeight: Math.max(A4_HEIGHT_PX, source.scrollHeight),
  });

  if (!hasVisibleCanvasContent(canvas)) {
    throw new Error('O template do PDF foi renderizado em branco.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });
  const canvasScale = canvas.width / source.getBoundingClientRect().width;
  const pdfPointScale = A4_WIDTH_PT / A4_WIDTH_PX;
  const sourceHeight = source.scrollHeight;
  const safeBreakPositions = getSafePageBreakPositions(source);
  let currentPosition = 0;
  let pageIndex = 0;

  while (currentPosition < sourceHeight) {
    if (pageIndex > 0) {
      doc.addPage();
    }

    const topMarginPx = pageIndex === 0 ? 0 : PAGE_CONTINUATION_TOP_MARGIN_PX;
    const availablePageHeightPx =
      A4_HEIGHT_PX - topMarginPx - PAGE_CONTINUATION_BOTTOM_MARGIN_PX;
    const idealPosition = Math.min(
      currentPosition + availablePageHeightPx,
      sourceHeight
    );
    const nextPosition = getNextPageBreak(
      currentPosition,
      idealPosition,
      sourceHeight,
      safeBreakPositions
    );
    const sliceStartY = Math.round(currentPosition * canvasScale);
    const sliceHeight = Math.max(
      1,
      Math.min(canvas.height - sliceStartY, Math.round((nextPosition - currentPosition) * canvasScale))
    );
    const slice = createCanvasSlice(canvas, sliceStartY, sliceHeight);
    const imageHeightPt = (slice.height * A4_WIDTH_PT) / slice.width;

    doc.addImage(
      slice.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      topMarginPx * pdfPointScale,
      A4_WIDTH_PT,
      imageHeightPt
    );

    currentPosition = nextPosition;
    pageIndex += 1;
  }

  return doc.output('blob');
};

export const generatePDF = async (complaint: ComplaintDraft): Promise<Blob> => {
  const html = buildComplaintPdfHtml(complaint);
  const target = await createPdfRenderTarget(html);

  try {
    return await renderHtmlToPdf(target.source);
  } finally {
    target.container.remove();
    target.style.remove();
  }
};
