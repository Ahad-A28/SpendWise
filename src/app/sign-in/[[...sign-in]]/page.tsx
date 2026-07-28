import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto">
        {/* Background glow effects */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-3xl blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-cyan-400/20 to-emerald-400/20 dark:from-cyan-400/10 dark:to-emerald-400/10 rounded-3xl blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        
        <SignIn 
          appearance={{
            elements: {
              card: "shadow-2xl border border-white/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl w-full",
              headerTitle: "text-2xl font-bold text-slate-900 dark:text-white",
              headerSubtitle: "text-slate-500 dark:text-slate-400",
              socialButtonsBlockButton: "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors backdrop-blur-sm",
              socialButtonsBlockButtonText: "text-slate-600 dark:text-slate-300 font-medium",
              dividerLine: "bg-slate-200 dark:bg-slate-700/60",
              dividerText: "text-slate-500",
              formFieldLabel: "text-slate-700 dark:text-slate-300 font-medium",
              formFieldInput: "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition-colors shadow-lg shadow-indigo-500/30",
              footerActionText: "text-slate-600 dark:text-slate-400",
              footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors",
              identityPreviewText: "text-slate-900 dark:text-white",
              identityPreviewEditButton: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
            }
          }}
        />
      </div>
    </div>
  );
}
