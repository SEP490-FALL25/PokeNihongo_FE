import * as React from "react"

import { cn } from "@utils/CN"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
  & {
    error?: string
  }
>(({ className, error, ...props }, ref) => {
  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
          error ? "border-error focus-visible:ring-error" : "focus-visible:ring-ring"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? "textarea-error" : undefined}
        ref={ref}
        {...props}
      />
      {error && <p id="textarea-error" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>

  )
})
Textarea.displayName = "Textarea"

export { Textarea } 