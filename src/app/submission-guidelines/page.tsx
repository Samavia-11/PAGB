// app/submission-guidelines/page.tsx

export const metadata = {
  title: 'Submission Guidelines | Pakistan Army Green Book',
  description: 'Guidelines for submitting articles and research papers to the Pakistan Army Green Book.',
};

export default function SubmissionGuidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Submission Guidelines</h1>
          <p className="text-xl opacity-90">How to contribute to the Pakistan Army Green Book</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>Article Submission Guidelines</h2>
            <p>We welcome original, well-researched articles on topics related to national security, defense, and strategic studies.</p>
            
            <h3>General Guidelines</h3>
            <ul>
              <li>Articles should be between 3,000-5,000 words</li>
              <li>Include an abstract of 150-200 words</li>
              <li>Use Times New Roman, 12pt font, 1.5 line spacing</li>
              <li>Submit in .doc or .docx format</li>
              <li>Include a brief author bio (50 words max)</li>
            </ul>

            <h3>Referencing Style</h3>
            <p>Please use the Chicago Manual of Style (17th edition) for citations and references.</p>

            <h3>Review Process</h3>
            <p>All submissions undergo a double-blind peer review process. Authors can expect to hear back within 6-8 weeks of submission.</p>

            <h3>Copyright</h3>
            <p>By submitting your article, you agree to transfer copyright to the Pakistan Army Green Book if your submission is accepted for publication.</p>

            <div className="mt-10">
              <a 
                href="/submit-article" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Submit Your Article
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
