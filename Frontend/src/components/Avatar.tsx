export default function Avatar({ name, r }: { name: string; r: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center mr-1 ${r === 'user' ? 'min-w-14 min-h-14' : 'min-w-10 max-h-10 min-h-10'} border border-slate-300 dark:border-slate-600 overflow-hidden rounded-xl ${r === 'user' ? 'bg-slate-300 dark:bg-slate-700' : r === 'req' ? 'bg-red-800' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span
        className={`font-medium ${r !== 'user' ? 'text-lg' : 'text-2xl'} text-slate-700 dark:text-slate-200`}
      >
        {name[0]?.toUpperCase()}
        {name[1]}
      </span>
    </div>
  );
}
