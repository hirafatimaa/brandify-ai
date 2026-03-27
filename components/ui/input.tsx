import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={
        "flex h-12 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:ring-blue-400/30 dark:focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 " +
        (className || "")
      }
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
