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
                <p key={`${section.title}-${item.label}`}>
                  <strong>{item.label}:</strong> {item.value}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <br />
    </div>
  );
};
