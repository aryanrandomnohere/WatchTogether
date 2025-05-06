import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function Applayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-200 dark:bg-slate-950 transition-colors duration-200">
      <div>
        <Navbar />
      </div>
      <div className="flex-1 bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </div>
    </div>
  );
}
