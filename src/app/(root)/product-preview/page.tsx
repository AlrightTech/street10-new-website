"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductPreview from "@/components/general/ProductPreview";
import { productApi } from "@/services/product.api";
import type { Product } from "@/services/product.api";

// Type for product with images array (required by ProductPreview component)
type ProductWithImages = Product & { images: string[] };

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Reset state when id changes
    setLoading(true);
    setProduct(null);

    const fetchData = async () => {
      if (!id) {
        if (isMountedRef.current) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMountedRef.current) {
          setLoading(true);
        }
        
        const response = await productApi.getById(id);
        const fetchedProduct: Product = response.data.product;

        if (isMountedRef.current) {
          // Transform product to include images array for ProductPreview component
          const productWithImages: ProductWithImages = {
            ...fetchedProduct,
            images: fetchedProduct.media?.map((m) => m.url) || ["/images/cars/car-1.jpg"],
          };
          setProduct(productWithImages);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        if (isMountedRef.current) {
          setProduct(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f4] pb-10">
      <ProductPreview product={product} />
    </div>
  );
}

function ProductPreviewPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <Page />
    </Suspense>
  );
}

export default ProductPreviewPage;
