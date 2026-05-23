import {
  ComplaintSummaryPhotoItem,
  ComplaintSummarySection,
  ComplaintSummaryTextItem,
  buildComplaintSummarySections,
} from '../../../features/denuncia/utils/complaint-summary';
import { ComplaintDraft } from '../../../features/denuncia/types/denuncia';
import templateHtml from './complaint-pdf-template.html?raw';
import templateCss from './complaint-pdf-template.css?raw';

const TEMPLATE_VERSION = 'denuncia-html-v1';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderTextValue = (value: string): string =>
  escapeHtml(value).replace(/\r?\n/g, '<br />');

const renderTextRows = (items: ComplaintSummaryTextItem[]): string => {
  if (items.length === 0) return '';

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td>${renderTextValue(item.value)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <table class="complaint-table">
      <thead>
        <tr>
          <th>Pergunta</th>
          <th>Resposta</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const isInlineImageSource = (value: string): boolean => /^data:image\//.test(value);

const renderPhotoGroup = (item: ComplaintSummaryPhotoItem): string => {
  const content =
    item.photos.length === 0
      ? `<p class="complaint-photo-group__empty">${escapeHtml(item.emptyText)}</p>`
      : `
        <div class="complaint-photo-grid">
          ${item.photos
            .map(
              (photo) => `
                <figure class="complaint-photo-card">
                  <img src="${isInlineImageSource(photo.dataUrl) ? photo.dataUrl : ''}" alt="${escapeHtml(
                photo.name
              )}" />
                  <figcaption>${escapeHtml(photo.name)}</figcaption>
                </figure>
              `
            )
            .join('')}
        </div>
      `;

  return `
    <div class="complaint-photo-group">
      <p class="complaint-photo-group__label">${escapeHtml(item.label)}</p>
      ${content}
    </div>
  `;
};

const renderSection = (section: ComplaintSummarySection, index: number): string => {
  const textItems = section.items.filter(
    (item): item is ComplaintSummaryTextItem => item.type === 'text'
  );
  const photoItems = section.items.filter(
    (item): item is ComplaintSummaryPhotoItem => item.type === 'photos'
  );

  return `
    <section class="complaint-section">
      <h2 class="complaint-section__title">
        <span class="complaint-section__number">${index + 1}</span>
        <span>${escapeHtml(section.title)}</span>
      </h2>
      ${
        section.description
          ? `<p class="complaint-section__description">${renderTextValue(section.description)}</p>`
          : ''
      }
      ${renderTextRows(textItems)}
      ${photoItems.map(renderPhotoGroup).join('')}
    </section>
  `;
};

const fillTemplate = (tokens: Record<string, string>): string =>
  Object.entries(tokens).reduce(
    (html, [token, value]) => html.split(`{{${token}}}`).join(value),
    templateHtml
  );

export const buildComplaintPdfHtml = (complaint: ComplaintDraft): string => {
  const sections = buildComplaintSummarySections(complaint);
  const generatedAt = new Date().toLocaleDateString('pt-BR');
  const professionName = complaint.selectedProfession?.nome || 'Não informada';

  return fillTemplate({
    styles: templateCss,
    generatedAt: escapeHtml(generatedAt),
    professionName: escapeHtml(professionName),
    sections: sections.map(renderSection).join(''),
  });
};

export { TEMPLATE_VERSION as COMPLAINT_PDF_TEMPLATE_VERSION };
