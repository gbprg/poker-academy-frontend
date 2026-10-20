import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full border', {
  variants: {
    variant: {
      outline: 'border-current bg-transparent',
    },
  },
  defaultVariants: { variant: 'outline' },
})

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
