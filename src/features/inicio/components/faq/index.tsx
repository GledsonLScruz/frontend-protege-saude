import { useState } from 'react';
import './style.css';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Como faço para registrar uma denúncia?",
      answer: 'Para registrar uma denúncia, clique no botão "Realizar Denúncia" no topo da página, selecione sua profissão e prossiga com a denúncia. Não se preocupe, todas as denúncias são anônimas e tratadas com total sigilo.'
    },
    {
      question: "Minha identidade será mantida em sigilo?",
      answer: "Sim, nós garantimos total sigilo da sua identidade. Sua privacidade é nossa prioridade, e todas as informações fornecidas são tratadas com absoluta confidencialidade."
    },
    {
      question: "Que tipos de casos posso denunciar?",
      answer: "Você pode denunciar qualquer suspeita ou caso confirmado de violência ou maus-tratos contra crianças e adolescentes identificado durante o atendimento, incluindo violência física, psicológica, negligência, violência doméstica e demais formas de agressão."
    },
    {
      question: "Como identificar sinais de violência?",
      answer: "Fique atento a sinais como: lesões inexplicadas, marcas recorrentes, comportamento extremamente ansioso ou temeroso do paciente, inconsistências nas explicações sobre lesões, e relutância em responder a perguntas sobre machucados."
    },
    {
      question: "O que acontece após realizar uma denúncia?",
      answer: "Nós forneceremos o protocolo da sua denúncia - que servirá para futuras consultas do andamento do caso, se for da vontade do denunciante. A denúncia terá sido enviada ao Conselho Tutelar responsável pelo endereço fornecido na denúncia, o qual tomará as providências necessárias para investigar e proteger a possível vítima."
    },
    {
      question: "Preciso ter certeza absoluta para fazer uma denúncia?",
      answer: "Não é necessário ter certeza absoluta. Se houver suspeita fundamentada, é importante realizar a denúncia. Os órgãos competentes são responsáveis por investigar e confirmar as suspeitas."
    },
    {
      question: 'Por que não há mais detalhamento nas perguntas do formulário de denúncia?',
      answer: "Porque este canal de denúncia trata-se de um meio para denunciar casos de violência infantojuvenil, e não um recurso para a realização de perícia das lesões observadas."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Perguntas Frequentes</h2>

      {faqItems.map((item, index) => (
        <div
          key={index}
          className={`faq-item ${activeIndex === index ? 'active' : ''}`}
        >
          <div
            className="faq-question"
            onClick={() => toggleFAQ(index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleFAQ(index);
              }
            }}
          >
            {item.question}
          </div>
          <div className="faq-answer">
            <div className="faq-answer-content">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
