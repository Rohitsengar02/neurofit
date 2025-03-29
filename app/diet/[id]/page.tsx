import { Suspense } from 'react';
import RecipeDetail from '@/app/components/Diet/RecipeDetail';

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RecipeDetail id={id} />
    </Suspense>
  );
}
