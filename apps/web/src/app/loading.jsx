export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20 min-h-[50vh]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">One moment&hellip;</p>
      </div>
    </div>
  );
}
