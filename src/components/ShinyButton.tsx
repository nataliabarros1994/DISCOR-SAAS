import { cn } from "@/lib/utils"

export function ShinyButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative px-6 py-3 overflow-hidden font-medium text-white bg-indigo-600 rounded-lg shadow-md transition-all duration-300 ease-out hover:bg-indigo-700 hover:shadow-xl before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shine",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
