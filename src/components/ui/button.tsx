import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--gold)] px-4 py-2 text-[#080b0a] hover:opacity-90',
        ghost: 'border border-[var(--line)] px-4 py-2 text-[var(--text)] hover:bg-white/5',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

export function Button({
  className,
  variant,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
}
