// app/faq/page.tsx

export const metadata = {
  title: 'Frequently Asked Questions | Pakistan Army Green Book',
  description: 'Find answers to common questions about the Pakistan Army Green Book, submissions, and more.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is the Pakistan Army Green Book?',
      answer: 'The Pakistan Army Green Book is an annual professional military publication that serves as a platform for strategic thought, research, and intellectual discourse on matters related to national security, defense, and military affairs.'
    },
    {
      question: 'Who can submit articles to the Green Book?',
      answer: 'We welcome submissions from serving and retired military officers, defense analysts, researchers, and subject matter experts in the field of national security and strategic studies.'
    },
    {
      question: 'What are the focus areas for submissions?',
      answer: 'We accept articles on a wide range of topics including military strategy, national security, defense policy, counter-terrorism, regional security dynamics, military history, and professional military education.'
    },
    {
      question: 'How long does the review process take?',
      answer: 'The review process typically takes 6-8 weeks. Authors will be notified of the decision via email once the review is complete.'
    },
    {
      question: 'Are there any publication fees?',
      answer: 'No, there are no submission or publication fees for authors. The Pakistan Army Green Book is a non-profit professional publication.'
    },
    {
      question: 'Can I submit previously published work?',
      answer: 'We only accept original, unpublished work. Submissions should not be under consideration by any other publication.'
    },
    {
      question: 'How can I access previous issues?',
      answer: 'Previous issues are available in the Archives section of our website. Some older issues may be available in digital format upon request.'
    },
    {
      question: 'How can I contact the editorial team?',
      answer: 'For any queries, please email us at greenbook@pakarmy.gov.pk. We aim to respond to all inquiries within 3-5 working days.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#002300] to-[#002300] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Find answers to common questions about the Pakistan Army Green Book</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
