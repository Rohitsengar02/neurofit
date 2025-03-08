import ProductDetail from './ProductDetail';
import LocationHeader from '../../components/LocationHeader';

interface ProductPageProps {
  params: {
    productId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
     
      <ProductDetail productId={params.productId} />
    </div>
  );
}
