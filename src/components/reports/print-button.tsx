'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => window.print()}
      className="gap-1.5 text-xs font-semibold"
    >
      <Printer className="h-4 w-4" />
      Print / Download PDF
    </Button>
  )
}
