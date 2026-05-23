# Plano de replicação do template HTML do PDF de denúncia no mobile

Este documento registra o template bruto usado na web e as instruções para replicar a geração do PDF no projeto Flutter mantendo o mesmo visual.

## Objetivo

Usar um único contrato visual baseado em HTML + CSS para que web e mobile gerem o PDF de denúncia com a mesma estrutura:

- cabeçalho do relatório;
- metadados de geração;
- resumo com profissão e versão do template;
- seções dinâmicas da denúncia;
- tabela de pergunta/resposta;
- galeria de fotos;
- rodapé.

Na web, os arquivos atuais ficam em:

- `src/shared/templates/complaint-pdf/complaint-pdf-template.html`
- `src/shared/templates/complaint-pdf/complaint-pdf-template.css`
- `src/shared/templates/complaint-pdf/complaint-pdf-template.ts`
- `src/shared/utils/generate-pdf.ts`

No Flutter, a recomendação é copiar o HTML e o CSS como assets e implementar apenas o preenchimento dos tokens em Dart.

## Tokens do template

O HTML usa estes tokens:

| Token | Origem |
| --- | --- |
| `{{styles}}` | Conteúdo bruto do arquivo CSS |
| `{{generatedAt}}` | Data de geração formatada em `pt-BR` |
| `{{professionName}}` | Nome da profissão selecionada |
| `{{templateVersion}}` | Versão fixa do template, hoje `denuncia-html-v1` |
| `{{sections}}` | HTML das seções da denúncia |

## HTML bruto

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Relatório de Denúncia</title>
    <style>
      {{styles}}
    </style>
  </head>
  <body>
    <article class="complaint-report" aria-label="Relatório de denúncia">
      <header class="complaint-report__header">
        <div>
          <p class="complaint-report__eyebrow">ProtegeSaúde</p>
          <h1>Relatório de Denúncia</h1>
        </div>
      </header>

      <section class="complaint-report__summary" aria-label="Resumo da denúncia">
        <div>
          <span>Profissão</span>
          <strong>{{professionName}}</strong>
        </div>
        <div>
          <span>Gerado em</span>
          <strong>{{generatedAt}}</strong>
        </div>
      </section>

      <div class="complaint-report__sections">
        {{sections}}
      </div>

      <footer class="complaint-report__footer">
        Powered by ProtegeSaúde
      </footer>
    </article>
  </body>
</html>
```

## CSS bruto

```css
:root {
  color: #1f2933;
  background: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: #ffffff;
}

body {
  color: #1f2933;
  line-height: 1.45;
}

.complaint-report {
  width: 794px;
  min-height: 1123px;
  padding: 48px 56px 40px;
  background: #ffffff;
}

.complaint-report__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 4px solid #fbc02d;
}

.complaint-report__eyebrow {
  margin: 0 0 6px;
  color: #7b5b00;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.complaint-report h1 {
  margin: 0;
  color: #17202a;
  font-size: 28px;
  line-height: 1.12;
}

.complaint-report__meta {
  min-width: 132px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: right;
}

.complaint-report__meta span,
.complaint-report__summary span {
  display: block;
  margin-bottom: 3px;
  color: #687584;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.complaint-report__meta strong,
.complaint-report__summary strong {
  color: #17202a;
  font-size: 12px;
}

.complaint-report__summary {
  display: grid;
  grid-template-columns: 1fr 170px;
  gap: 14px;
  margin: 18px 0 26px;
}

.complaint-report__summary > div {
  min-height: 58px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f8fafc;
}

.complaint-report__sections {
  display: grid;
  gap: 22px;
}

.complaint-section {
  break-inside: avoid;
  page-break-inside: avoid;
}

.complaint-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  color: #17202a;
  font-size: 17px;
  line-height: 1.25;
}

.complaint-section__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fbc02d;
  color: #17202a;
  font-size: 12px;
  font-weight: 700;
  flex: 0 0 auto;
}

.complaint-section__description {
  margin: 0 0 12px 38px;
  color: #52606d;
  font-size: 12px;
}

.complaint-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  overflow: hidden;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
}

.complaint-table th {
  padding: 10px 12px;
  background: #fbc02d;
  color: #17202a;
  font-size: 11px;
  text-align: left;
  text-transform: uppercase;
}

.complaint-table th:first-child,
.complaint-table td:first-child {
  width: 36%;
}

.complaint-table td {
  padding: 10px 12px;
  border-top: 1px solid #d9e2ec;
  color: #344054;
  font-size: 12px;
  vertical-align: top;
  word-break: break-word;
}

.complaint-table tr:nth-child(even) td {
  background: #f8fafc;
}

.complaint-photo-group {
  margin-top: 14px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.complaint-photo-group__label {
  margin: 0 0 8px;
  color: #17202a;
  font-size: 13px;
  font-weight: 700;
}

.complaint-photo-group__empty {
  margin: 0;
  padding: 12px 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  color: #687584;
  background: #f8fafc;
}

.complaint-photo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.complaint-photo-card {
  min-height: 170px;
  padding: 8px;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  background: #ffffff;
  break-inside: avoid;
  page-break-inside: avoid;
}

.complaint-photo-card img {
  display: block;
  width: 100%;
  height: 132px;
  object-fit: contain;
  background: #f8fafc;
  border-radius: 4px;
}

.complaint-photo-card figcaption {
  margin-top: 7px;
  color: #52606d;
  font-size: 10px;
  word-break: break-word;
}

.complaint-report__footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  color: #687584;
  font-size: 10px;
  text-align: center;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  .complaint-report {
    width: 794px;
    min-height: 1123px;
  }
}
```

## Estrutura esperada das seções

No mobile, gere um modelo intermediário equivalente ao resumo da web:

```dart
class ComplaintSummarySection {
  ComplaintSummarySection({
    required this.title,
    required this.items,
    this.description,
  });

  final String title;
  final String? description;
  final List<ComplaintSummaryItem> items;
}

sealed class ComplaintSummaryItem {}

class ComplaintSummaryTextItem extends ComplaintSummaryItem {
  ComplaintSummaryTextItem({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;
}

class ComplaintSummaryPhotoItem extends ComplaintSummaryItem {
  ComplaintSummaryPhotoItem({
    required this.label,
    required this.photos,
    required this.emptyText,
  });

  final String label;
  final List<ComplaintPhoto> photos;
  final String emptyText;
}

class ComplaintPhoto {
  ComplaintPhoto({
    required this.name,
    required this.dataUrl,
  });

  final String name;
  final String dataUrl;
}
```

O campo `dataUrl` precisa chegar no formato aceito por HTML:

```text
data:image/jpeg;base64,...
data:image/png;base64,...
data:image/webp;base64,...
```

## Renderer equivalente em Dart

```dart
const complaintPdfTemplateVersion = 'denuncia-html-v1';

String escapeHtml(String value) {
  return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
}

String renderTextValue(String value) {
  return escapeHtml(value).replaceAll(RegExp(r'\r?\n'), '<br />');
}

String renderTextRows(List<ComplaintSummaryTextItem> items) {
  if (items.isEmpty) return '';

  final rows = items.map((item) {
    return '''
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td>${renderTextValue(item.value)}</td>
        </tr>
      ''';
  }).join('');

  return '''
    <table class="complaint-table">
      <thead>
        <tr>
          <th>Pergunta</th>
          <th>Resposta</th>
        </tr>
      </thead>
      <tbody>$rows</tbody>
    </table>
  ''';
}

bool isInlineImageSource(String value) {
  return value.startsWith('data:image/');
}

String renderPhotoGroup(ComplaintSummaryPhotoItem item) {
  final content = item.photos.isEmpty
      ? '<p class="complaint-photo-group__empty">${escapeHtml(item.emptyText)}</p>'
      : '''
        <div class="complaint-photo-grid">
          ${item.photos.map((photo) {
            final source = isInlineImageSource(photo.dataUrl) ? photo.dataUrl : '';

            return '''
                <figure class="complaint-photo-card">
                  <img src="$source" alt="${escapeHtml(photo.name)}" />
                  <figcaption>${escapeHtml(photo.name)}</figcaption>
                </figure>
              ''';
          }).join('')}
        </div>
      ''';

  return '''
    <div class="complaint-photo-group">
      <p class="complaint-photo-group__label">${escapeHtml(item.label)}</p>
      $content
    </div>
  ''';
}

String renderSection(ComplaintSummarySection section, int index) {
  final textItems = section.items.whereType<ComplaintSummaryTextItem>().toList();
  final photoItems = section.items.whereType<ComplaintSummaryPhotoItem>().toList();
  final description = section.description;

  return '''
    <section class="complaint-section">
      <h2 class="complaint-section__title">
        <span class="complaint-section__number">${index + 1}</span>
        <span>${escapeHtml(section.title)}</span>
      </h2>
      ${description == null || description.isEmpty ? '' : '<p class="complaint-section__description">${renderTextValue(description)}</p>'}
      ${renderTextRows(textItems)}
      ${photoItems.map(renderPhotoGroup).join('')}
    </section>
  ''';
}

String fillTemplate(String templateHtml, Map<String, String> tokens) {
  return tokens.entries.fold(templateHtml, (html, entry) {
    return html.replaceAll('{{${entry.key}}}', entry.value);
  });
}

String buildComplaintPdfHtml({
  required String templateHtml,
  required String templateCss,
  required String generatedAt,
  required String professionName,
  required List<ComplaintSummarySection> sections,
}) {
  return fillTemplate(templateHtml, {
    'styles': templateCss,
    'generatedAt': escapeHtml(generatedAt),
    'professionName': escapeHtml(professionName),
    'templateVersion': complaintPdfTemplateVersion,
    'sections': sections.asMap().entries.map((entry) {
      return renderSection(entry.value, entry.key);
    }).join(''),
  });
}
```

## Passos para implementar no Flutter

1. Copiar os arquivos para assets do app mobile:

```text
assets/templates/complaint_pdf/complaint-pdf-template.html
assets/templates/complaint_pdf/complaint-pdf-template.css
```

2. Declarar os assets no `pubspec.yaml`:

```yaml
flutter:
  assets:
    - assets/templates/complaint_pdf/complaint-pdf-template.html
    - assets/templates/complaint_pdf/complaint-pdf-template.css
```

3. Carregar os assets antes de gerar o PDF:

```dart
import 'package:flutter/services.dart' show rootBundle;

Future<({String html, String css})> loadComplaintPdfTemplate() async {
  final html = await rootBundle.loadString(
    'assets/templates/complaint_pdf/complaint-pdf-template.html',
  );
  final css = await rootBundle.loadString(
    'assets/templates/complaint_pdf/complaint-pdf-template.css',
  );

  return (html: html, css: css);
}
```

4. Montar as seções com os mesmos dados usados no resumo antes do envio:

```dart
final template = await loadComplaintPdfTemplate();
final html = buildComplaintPdfHtml(
  templateHtml: template.html,
  templateCss: template.css,
  generatedAt: DateFormat('dd/MM/yyyy', 'pt_BR').format(DateTime.now()),
  professionName: selectedProfession?.nome ?? 'Não informada',
  sections: buildComplaintSummarySections(complaintDraft),
);
```

5. Converter o HTML final em PDF usando a biblioteca escolhida no app mobile.

Opções comuns:

- `flutter_html_to_pdf`: gera PDF a partir de HTML/CSS em arquivo temporário.
- `printing` + `pdf`: bom para PDFs nativos, mas exigiria reimplementar o layout em widgets PDF, então não é a primeira opção para manter HTML/CSS idêntico.
- WebView headless + print/conversão nativa: útil quando o app já usa WebView e precisa fidelidade maior ao CSS.

6. Enviar o PDF gerado no mesmo ponto do fluxo que hoje envia a denúncia.

## Cuidados para manter web e mobile iguais

- Não altere classes CSS no mobile. A estrutura HTML depende desses nomes.
- Ao atualizar o visual na web, copie novamente o HTML e o CSS para o Flutter.
- Mantenha `complaintPdfTemplateVersion` igual nas duas plataformas.
- Use sempre `escapeHtml` em valores vindos do usuário ou da API.
- Fotos devem ser embutidas como `data:image/...;base64,...` para evitar diferenças de caminho local entre plataformas.
- Gere a data com locale `pt_BR` para manter `dd/MM/yyyy`.
- O template usa tamanho A4 em pixels: `794px x 1123px`. Não redimensione o container principal no mobile.

## Critérios de aceite

- O PDF web e o PDF mobile usam a mesma versão `denuncia-html-v1`.
- A primeira página tem cabeçalho, resumo e seções com o mesmo espaçamento.
- Perguntas e respostas aparecem em tabela com as mesmas cores.
- Fotos aparecem em grade de duas colunas com `object-fit: contain`.
- Campos vazios de foto exibem o texto padrão.
- Caracteres especiais e quebras de linha aparecem corretamente.
- Um caso com dados mínimos e outro com fotos são comparados visualmente entre web e mobile antes de liberar.
