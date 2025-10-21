import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonGroup } from './ui/button-group'
import { Button } from './ui/button'

export function YearSelector() {
  return (
    <ButtonGroup>
      <Button>
        <ChevronLeft />
      </Button>
      <Button>
        <ChevronRight />
      </Button>
    </ButtonGroup>
  )
}
