// app/pacientes/novo/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="h-7 w-48 rounded-md bg-default-200 animate-pulse" />

      {/* Step header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-28 rounded-full bg-default-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-default-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-default-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-default-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-default-200 animate-pulse" />
      </div>

      {/* Card skeletons */}
      <div className="rounded-2xl border border-default-200 p-5 space-y-4">
        <div className="h-5 w-56 rounded-md bg-default-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
        </div>
      </div>

      <div className="rounded-2xl border border-default-200 p-5 space-y-4">
        <div className="h-5 w-40 rounded-md bg-default-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse" />
          <div className="h-12 rounded-xl bg-default-200 animate-pulse md:col-span-3" />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3">
        <div className="h-10 w-28 rounded-xl bg-default-200 animate-pulse" />
        <div className="h-10 w-36 rounded-xl bg-default-200 animate-pulse" />
      </div>
    </div>
  );
}
