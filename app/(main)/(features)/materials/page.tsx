"use client";

import { useEffect, useState } from 'react';
import { ScanFace } from 'lucide-react';

export default function MaterialsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // You can customize the URL based on the id
  const externalUrl = `https://dev.chen.tl/paper-data-extraction/v02-tapj3ft1bglc3gjv/materials/fig.html`;

  return (
    <div className="min-h-screen bg-white">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-900 text-base leading-relaxed">
              <strong>Research Landscape Explorer</strong><br/>
              An interactive map that visualizes how research attention on different materials has shifted over time, helping users uncover historical trends, emerging materials, and research gaps.
            </div>

            <iframe
              src={externalUrl}
              className="w-full min-h-screen border-0"
              title="Materials Clustering"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}