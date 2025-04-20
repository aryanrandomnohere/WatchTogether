import { motion } from 'framer-motion';

export default function ShowSkeleton() {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center sm:min-w-[100px] bg-slate-200 dark:bg-slate-800/50 my-2 sm:min-h-[100px] max-h-[1000px] sm:max-h-[500px] sm:mx-0.5 max-w-[150px] min-w-[130px] sm:w-2/5 md:w-1/6 rounded-md overflow-hidden shadow-lg"
      animate={{
        opacity: [0.5, 0.8, 0.5],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative w-full aspect-[2/3]">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-300/50 to-slate-400/50 dark:from-slate-700/50 dark:to-slate-800/50 animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900/80 to-transparent">
        <div className="h-2 w-2/3 bg-slate-300/50 dark:bg-slate-600/50 rounded animate-pulse mb-1" />
        <div className="h-2 w-1/2 bg-slate-300/50 dark:bg-slate-600/50 rounded animate-pulse" />
      </div>
    </motion.div>
  );
} 