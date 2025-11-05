'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReviewerArticleRedirect() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  useEffect(() => {
    // Redirect to the view page
    router.replace(`/reviewer/articles/${articleId}/view`);
  }, [router, articleId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[forestgreen] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
