import React from 'react';
import './resumo-denuncia.css';
import 'jspdf-autotable';
import { ComplaintDraft } from '../../../types/denuncia';
import { buildComplaintSummarySections } from '../../../utils/complaint-summary';

interface ComplaintSummaryProps {
  complaint: ComplaintDraft;
  onValidationChange?: (isValid: boolean) => void;
}

export const ComplaintSummary: React.FC<ComplaintSummaryProps> = ({
  complaint,
  onValidationChange,
}) => {
  const sections = React.useMemo(
    () => buildComplaintSummarySections(complaint),
    [complaint]
  );

  React.useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  return (
    <div className="complaint-summary">
      <div className="summary-sections">
        {sections.map((section) => (
          <div key={section.title} className="summary-section">
            <h3>{section.title}</h3>
            {section.description && (
              <p className="summary-section-description">{section.description}</p>
            )}

            <div className="details-list">
              {section.items.map((item) => (
                item.type === 'text' ? (
                  <p key={`${section.title}-${item.label}`}>
                    <strong>{item.label}:</strong> {item.value}
                  </p>
                ) : (
                  <div key={`${section.title}-${item.label}`} className="summary-photos-block">
                    <p>
                      <strong>{item.label}:</strong>{' '}
                      {item.photos.length > 0
                        ? `${item.photos.length} foto${item.photos.length > 1 ? 's' : ''} selecionada${item.photos.length > 1 ? 's' : ''}`
                        : item.emptyText}
                    </p>

                    {item.photos.length > 0 && (
                      <div className="summary-photo-grid">
                        {item.photos.map((photo) => (
                          <figure key={photo.id} className="summary-photo-card">
                            <img src={photo.dataUrl} alt={photo.name} className="summary-photo-image" />
                            <figcaption>{photo.name}</figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      <br />
    </div>
  );
};
