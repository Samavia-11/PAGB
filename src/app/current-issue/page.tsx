// app/current-issue/page.tsx

'use client';

import { useState } from 'react';
import { FileText, Users, BookOpen, ScrollText } from 'lucide-react';

export default function CurrentIssue() {
  const [activeTab, setActiveTab] = useState('volume');

  const tabs = [
    { id: 'volume', label: 'Volume', icon: BookOpen },
    { id: 'issue', label: 'Issue', icon: ScrollText },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'editorial', label: 'Editorial Board', icon: Users },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-gradient-to-r from-green-800 to-green-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Current Issue</h1>
            <p className="text-xl opacity-90">Pakistan Army Green Book</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-8 py-6 text-sm font-medium tracking-wider whitespace-nowrap transition-all border-b-4 ${
                      activeTab === tab.id
                        ? 'border-green-600 text-green-700 bg-green-50'
                        : 'border-transparent text-gray-600 hover:text-green-700 hover:border-green-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">

            {/* Volume Tab */}
            {activeTab === 'volume' && (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-6xl font-black text-green-700 mb-4">Volume 15</h2>
                <p className="text-2xl text-gray-700">2025</p>
                <div className="mt-8 text-gray-600">
                  <p className="text-lg">Pakistan Army Green Book</p>
                  <p className="text-sm mt-2">Annual Publication • ISSN: XXXX-XXXX</p>
                </div>
              </div>
            )}

            {/* Issue Tab */}
            {activeTab === 'issue' && (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-6xl font-black text-green-700 mb-4">Issue 01</h2>
                <p className="text-2xl text-gray-700">January 2025</p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-600">
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Published</p>
                    <p className="text-xl font-bold">Jan 2025</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Articles</p>
                    <p className="text-xl font-bold">18</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Pages</p>
                    <p className="text-xl font-bold">245</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-gray-500">Downloads</p>
                    <p className="text-xl font-bold">12.4k</p>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-gray-800">Featured Articles</h2>
                  <p className="text-gray-600 mt-3">Volume 15 • Issue 01 • January 2025</p>
                </div>

                {[
                  "Strategic Realignment in South Asia",
                  "Cyber Warfare: Emerging Threats",
                  "Climate Change & National Security",
                  "Future of Hybrid Warfare",
                  "CPEC Security Challenges",
                  "AI in Modern Warfare",
                  "Nuclear Deterrence in 21st Century",
                  "Counter-Terrorism Strategies"
                ].map((title, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all border">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-orange-600">Article {i + 1}</span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{title}</h3>
                        <p className="text-gray-600 mt-2">Lt Col Ahmed Raza, Dr. Maria Khan</p>
                      </div>
                      <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition">
                        <FileText className="w-5 h-5" />
                        View PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Editorial Board Tab */}
            {activeTab === 'editorial' && (
              <div className="bg-white rounded-2xl shadow-lg p-10">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Editorial Board</h2>

                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-600 uppercase">Editor-in-Chief</p>
                    <h3 className="text-2xl font-bold mt-2">Maj Gen Muhammad Ali</h3>
                    <p className="text-gray-600">Director HRD, GHQ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-600 uppercase">Managing Editor</p>
                    <h3 className="text-2xl font-bold mt-2">Col Dr. Ahmed Khan</h3>
                    <p className="text-gray-600">HRD Directorate</p>
                  </div>
                </div>

                <div className="mt-12">
                  <p className="text-sm font-semibold text-orange-600 uppercase text-center mb-6">Associate Editors</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {["Brig Dr. Salman", "Lt Col Usman", "Maj Dr. Fatima", "Dr. Ayesha Khan"].map((name) => (
                      <div key={name} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
    </>
  );
}