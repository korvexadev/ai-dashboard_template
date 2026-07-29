import { Suspense } from "react";

import { CategoryManagement } from "@/features/categories/components/category-management";

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={<div className="module-loading">Loading categories…</div>}
    >
      <CategoryManagement />
    </Suspense>
  );
}
