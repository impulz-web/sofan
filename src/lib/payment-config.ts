import "server-only";

export type DonationProvider = "sofan_gateway" | "hws_paystack";

export function getDonationPaymentConfiguration() {
  const selected = process.env.SOFAN_PAYMENT_PROVIDER;
  const provider: DonationProvider | null =
    selected === "sofan_gateway" || selected === "hws_paystack" ? selected : null;

  const required = provider === "sofan_gateway"
    ? [
        ["SOFAN_GATEWAY_MERCHANT_ID", "SOFAN gateway merchant account"],
        ["SOFAN_GATEWAY_PUBLIC_KEY", "SOFAN gateway public key"],
        ["SOFAN_GATEWAY_SECRET_KEY", "SOFAN gateway secret key"],
        ["SOFAN_GATEWAY_CALLBACK_URL", "SOFAN gateway callback URL"],
      ] as const
    : provider === "hws_paystack"
      ? [
          ["PAYSTACK_PUBLIC_KEY", "Paystack public key"],
          ["PAYSTACK_SECRET_KEY", "Paystack secret key"],
          ["PAYSTACK_CALLBACK_URL", "Paystack callback URL"],
        ] as const
      : [];

  return {
    provider,
    missing: required.filter(([key]) => !process.env[key]?.trim()).map(([, label]) => label),
  };
}
