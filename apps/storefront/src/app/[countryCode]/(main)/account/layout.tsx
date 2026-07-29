import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"
import PostHogIdentifier from "@modules/account/components/posthog-identifier"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer && (
        <PostHogIdentifier
          customerId={customer.id}
          email={customer.email}
          firstName={customer.first_name ?? undefined}
          lastName={customer.last_name ?? undefined}
        />
      )}
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
