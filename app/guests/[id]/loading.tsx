"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-4" />
        </div>

        <div className="space-y-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}