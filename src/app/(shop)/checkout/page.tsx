import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";
import { readDb } from "@/lib/store";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/login?next=/checkout");
  const { settings } = readDb();

  return (
    <CheckoutForm
      customer={{ name: customer.name, phone: customer.phone, type: customer.type, gstin: customer.gstin ?? "" }}
      settings={{
        storeName: settings.storeName,
        deliveryMinOrder: settings.deliveryMinOrder,
        deliveryBaseFee: settings.deliveryBaseFee,
        deliveryPerKm: settings.deliveryPerKm,
        deliveryMaxKm: settings.deliveryMaxKm,
      }}
    />
  );
}
