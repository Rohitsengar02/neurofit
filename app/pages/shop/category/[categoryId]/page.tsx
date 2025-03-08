'use client';
import { Suspense, use } from 'react';
import ProductList from './ProductList';


interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <Suspense fallback={<div>Loading...</div>}>
        <ProductList categoryId={resolvedParams.categoryId} />
      </Suspense>
    </div>
  );
}