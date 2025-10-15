import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { decryptSSN } from '@/lib/decrypt_ssn'
import { useRouteContext } from '@tanstack/react-router'
import parsePhoneNumber from 'libphonenumber-js'
import { useState } from 'react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { employeeInfoQueryOptions } from '@/queries/employees/query-options'
import { Spinner } from '@/components/ui/spinner'

type Field = {
  label: string
  value?: string | null
}

export function PersonalInfo() {
  const { auth } = useRouteContext({ from: '/employee-portal' })
  const { data } = useSuspenseQuery(employeeInfoQueryOptions(auth.userId))

  const personalFields: Field[] = [
    { label: 'First Name', value: data.first_name },
    { label: 'Middle Name', value: data.middle_name },
    { label: 'Last Name', value: data.last_name },
    {
      label: 'Date of Birth',
      value: new Date(data.birth_date).toLocaleDateString('en-US', {
        timeZone: 'UTC',
      }),
    },
  ]

  const contactInfoFields: Field[] = [
    { label: 'Home Address', value: data.home_address },
    {
      label: 'Mailing Address',
      value:
        data.home_address || data.home_address === data.mailing_address
          ? '(same as home address)'
          : data.mailing_address,
    },
    {
      label: 'Home Phone',
      value: data.home_phone
        ? parsePhoneNumber(data.home_phone, 'US')?.formatNational()
        : null,
    },
    {
      label: 'Cell Phone',
      value: data.cell_phone
        ? parsePhoneNumber(data.cell_phone, 'US')?.formatNational()
        : null,
    },
    { label: 'Email', value: data.email_address },
  ]

  const persFields: Field[] = [
    { label: 'PERS Number', value: data.pers_membership_number },
    { label: 'PERS Tier', value: data.pers_tier },
  ]

  return (
    <div className="w-full justify-between grid grid-flow-col gap-4 overflow-x-auto">
      <PersonalInfoCard profileId={data.id} fields={personalFields} />
      <ContactInfoCard fields={contactInfoFields} />
      <PERSInfoCard fields={persFields} />
    </div>
  )
}

function PERSInfoCard({ fields }: { fields?: Field[] }) {
  return (
    <GenericCard title="Pension Information">
      {fields?.map(
        (field, index) =>
          field.value && (
            <ContentField key={index} label={field.label} value={field.value} />
          ),
      )}
    </GenericCard>
  )
}

function PersonalInfoCard({ fields }: { profileId: string; fields?: Field[] }) {
  return (
    <GenericCard title="Personal Information">
      {fields?.map(
        (field, index) =>
          field.value && (
            <ContentField key={index} label={field.label} value={field.value} />
          ),
      )}
      <SSNField />
    </GenericCard>
  )
}

function ContactInfoCard({ fields }: { fields?: Field[] }) {
  return (
    <GenericCard title="Contact Information">
      {fields?.map(
        (field, index) =>
          field.value && (
            <ContentField key={index} label={field.label} value={field.value} />
          ),
      )}
    </GenericCard>
  )
}

interface ContentFieldProps {
  label: string
  value?: string | null
}

function ContentField({ label, value }: ContentFieldProps) {
  return (
    <div className="grid gap-1">
      <Label className="underline underline-offset-4">{label}</Label>
      <p>{value}</p>
    </div>
  )
}

interface GenericCardProps {
  title: string
  className?: string
  children?: React.ReactNode
}

function GenericCard({ title, children, className }: GenericCardProps) {
  return (
    <Card className={cn('shadow-md w-md', className)}>
      <CardHeader className="border-b">
        <CardTitle className="flex w-full justify-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  )
}

function SSNField() {
  const { auth } = useRouteContext({ from: '/employee-portal' })
  const [showSSN, setShowSSN] = useState<boolean>(false)

  const {
    data: ssn,
    error,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['ssn', auth.employeeId],
    queryFn: async () => decryptSSN(auth.employeeId),
    staleTime: Infinity,
    gcTime: 1000 * 60, // 5 minutes
    enabled: showSSN && !!auth.employeeId,
  })

  return (
    <div className="w-fit grid gap-2">
      <Label className="underline underline-offset-4">
        Social Security Number
      </Label>
      <Button onClick={() => setShowSSN(!showSSN)}>
        {showSSN ? 'Hide' : 'Show'}
      </Button>
      {isFetching && <Spinner />}
      {showSSN && !isFetching && !isError && (
        <Badge className="w-full" variant="destructive">
          {ssn}
        </Badge>
      )}
      {error && showSSN && (
        <Badge className="w-full" variant="destructive">
          An error occured
        </Badge>
      )}
    </div>
  )
}
