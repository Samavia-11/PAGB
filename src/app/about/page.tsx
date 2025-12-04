'use client';

import Link from 'next/link';
import { BookOpen, Target, Shield, Globe, Users, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#002300] via-[#002300] to-[#002300] text-white py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About PAGB</h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed opacity-95">
              Pakistan Army Green Book — A flagship annual publication dedicated to strategic thought, 
              national security discourse, and professional military writing.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* <div className="text-center">
                <div className="w-20 h-20 bg-green-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-[#002300]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To promote intellectual discourse on national security, strategic studies, 
                  and contemporary military challenges through rigorous research and scholarly contributions 
                  from serving and retired officers, academics, and strategic thinkers.
                </p>
              </div> */}
              {/* <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-orange-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To be Pakistan’s leading platform for professional military writing and strategic thought, 
                  fostering a culture of research and intellectual excellence within the armed forces and beyond.
                </p>
              </div> */}
            </div>
          </div>
        </section>

        {/* Scope & Aims */}
        <section className="pt-20 pb-32 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Scope */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Scope</h2>
                <div className="bg-gray-50 p-8 rounded-lg text-left h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Contribution Enhancement</h3>
                    <p className="text-gray-700 mb-6">
                      The PAGB aims to enhance the value of contributions by engaging a wide spectrum of military professionals, academicians, scholars, and thought leaders. We look forward to your forthcoming intellectual discourse aligned with the journal&apos;s scope.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Primary Focus Areas</h3>
                    <p className="text-gray-700 mb-4">
                      The PAGB primarily addresses <span className="font-semibold">HARD CORE MILITARY SUBJECTS</span> and <span className="font-semibold">NATIONAL SECURITY ISSUES</span>, with particular emphasis on:
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Military Focus</h4>
                        <ul className="space-y-2 text-gray-700 pl-1">
                          {[
                            'Military Strategy',
                            'Global Military Balance',
                            'Military Modernization',
                            'Asymmetric Warfare',
                            'Cyber Warfare',
                            'Artificial Intelligence in Warfare',
                            'Drone Technology',
                            'Space Technology',
                            'Defense Procurement',
                            'Art of Warfare'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">National Security</h4>
                        <ul className="space-y-2 text-gray-700 pl-1">
                          {[
                            'Threat Perceptions regarding National Defense',
                            'Terrorism',
                            'Extremism and Radicalization',
                            'Media and Information Management',
                            'Psychological/Social Media Issues',
                            'Regional Conflicts (South Asia, Middle East, Afghanistan, Southeast Asia, Central Asia)',
                            'Kashmir Dispute',
                            'Afghanistan Issue',
                            'Regional Water-Based Conflicts',
                            'Economic Security',
                            'Climate Change',
                            'Any other subject matter that bears implications for the National Security of Pakistan'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aims & Objectives */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-purple-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Aims & Objectives</h2>
                <div className="bg-gray-50 p-8 rounded-lg text-left h-full">
                  <ol className="space-y-6">
                    <li className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-4 mt-0.5">1</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Advancement of Research</h3>
                        <p className="text-gray-700 mt-1">
                          To enhance and advance research pertaining to Hard core Military Subjects and National Security to enhance the development and growth of Armed Forces Officers.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-4 mt-0.5">2</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Promotion of Scholarly Publishing</h3>
                        <p className="text-gray-700 mt-1">
                          To encourage the publication of high-quality exploratory, analytical and empirical research manuscripts that contribute to the field.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-4 mt-0.5">3</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Encouragement of Diverse Writing</h3>
                        <p className="text-gray-700 mt-1">
                          To promote a variety of genres in both creative and research writing, reflecting the multifaceted nature of national security issues and modern warfare.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-4 mt-0.5">4</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Publication of Contemporary Research</h3>
                        <p className="text-gray-700 mt-1">
                          To disseminate new research findings that address contemporary challenges in national security.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-4 mt-0.5">5</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Provision of a Research Platform</h3>
                        <p className="text-gray-700 mt-1">
                          To offer a dedicated platform for researchers to explore pressing national security issues and propose tangible, actionable solutions to the security challenges faced by Pakistan.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Why PAGB Stands Out</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition">
                <Globe className="w-14 h-14 text-green-600 mx-auto mb-5" />
                <h3 className="text-xl font-bold mb-3">Peer-Reviewed Excellence</h3>
                <p className="text-gray-600">All articles undergo rigorous blind peer review by distinguished scholars and practitioners.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition">
                <Users className="w-14 h-14 text-green-600 mx-auto mb-5" />
                <h3 className="text-xl font-bold mb-3">Diverse Contributors</h3>
                <p className="text-gray-600">Contributions from serving officers, retired generals, academics, and international experts.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition">
                <Award className="w-14 h-14 text-green-600 mx-auto mb-5" />
                <h3 className="text-xl font-bold mb-3">Annual Prestige Edition</h3>
                <p className="text-gray-600">Published annually under the patronage of senior military leadership and GHQ.</p>
              </div>
            </div>
          </div>
        </section>

        {/* History & Patronage */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Published Under Patronage Of</h2>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 inline-block">
                <p className="text-2xl font-bold text-green-800">Inspector General Training & Evaluation (IGT&E)</p>
                <p className="text-lg text-gray-700 mt-2">General Headquarters, Rawalpindi</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Journey</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Established as part of Pakistan Army’s commitment to professional military education, 
                  the Green Book has evolved into a respected annual publication that contributes significantly 
                  to national security discourse.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Each edition features in-depth research on contemporary strategic issues, 
                  emerging technologies, regional security dynamics, and professional military thought.
                </p>
              </div>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
                <img src="/images/icon1.JPG" alt="Military" className="w-full h-full object-cover object-center" />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-[#002300] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">Contribute to Strategic Thought</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              We welcome original research from officers, scholars, and strategic analysts on topics 
              related to national security, defense strategy, and military professional development.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              
              <Link href="/current-issue" className="bg-white text-[#002300] hover:bg-gray-100 px-10 py-5 rounded-lg text-xl font-bold transition">
                View Current Issue →
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}