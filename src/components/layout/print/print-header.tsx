import { Typography } from '@/components/typography'
import { company } from '@/data/company-data'

export function PrintLayoutHeader() {
  return (
    <div className="grid grid-cols-[auto_auto_auto] items-center">
      <img
        src="/logo512.png"
        alt="Company Logo"
        className="w-18 h-18 object-contain"
      />
      <div className="flex flex-col items-center">
        <Typography tag="h3">{company.name}</Typography>
        <Typography tag="h4">{company.address}</Typography>
      </div>
      <img
        src="/logo512.png"
        alt="Company Logo"
        className="w-18 h-18 object-contain"
      />
    </div>
  )
}
