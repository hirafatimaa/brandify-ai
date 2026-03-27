import * as React from "react"

const buttonVariants = ({
  variant = "default",
  size = "md",
}: {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
} = {}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";

  const variants = {
    default:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] btn-glow",
    secondary:
      "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 hover:scale-[1.02] active:scale-[0.98]",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  return `${baseStyles} ${variants[variant]} ${sizes[size]}`;
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, size }) + (className ? ` ${className}` : "")}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
