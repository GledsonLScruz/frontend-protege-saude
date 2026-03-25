import jsPDF from "jspdf";
import { ComplaintDraft } from "../../features/denuncia/types/denuncia";
import { buildComplaintSummarySections } from "../../features/denuncia/utils/complaint-summary";
import { UserOptions } from "jspdf-autotable";

export const generatePDF = (complaint: ComplaintDraft) => {
  const doc = new jsPDF();
  doc.setFont("helvetica");
  const sections = buildComplaintSummarySections(complaint);

  doc.setFontSize(20);
  doc.text(`Relatório de Denúncia`, 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text(`${complaint.address.councilRegion?.nome ?? 'Conselho Tutelar não identificado'}`, 105, 30, { align: "center"});
  doc.setFontSize(12);

  const addSection = (title: string, startY: number): number => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    return startY + 10;
  };

  let yPos = 45;

  sections.forEach((section, index) => {
    yPos = addSection(`${index + 1}. ${section.title}`, yPos);

    if (section.description) {
      const descriptionLines = doc.splitTextToSize(section.description, 170);
      doc.text(descriptionLines, 20, yPos);
      yPos += descriptionLines.length * 6 + 4;
    }

    (doc as unknown as { autoTable: (options: UserOptions) => void }).autoTable({
      startY: yPos,
      head: [['Pergunta', 'Resposta']],
      body: section.items.map((item) => [item.label, item.value]),
      theme: 'striped',
      headStyles: {
        fillColor: [251, 192, 45],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [66, 66, 66],
        fontSize: 10,
        valign: 'top',
      },
      columnStyles: {
        0: { cellWidth: 68 },
        1: { cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
        textColor: [66, 66, 66],
        fontSize: 10,
      },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 16;
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);

    doc.text(
      `Powered by OdontoGuardião, ${new Date().toLocaleDateString('pt-BR')}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc.output('blob');
};
