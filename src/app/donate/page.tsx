import type { Metadata } from "next";
import { connection } from "next/server";
import { MinistryResource } from "@/components/site/ministry-resource";
import { DonationEstimator } from "@/components/site/donation-estimator";
import { contactInfo } from "@/data/site";
import { getDonationPaymentConfiguration } from "@/lib/payment-config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Donate",
  description: "Learn how to support SOFAN and review payment configuration and fee information.",
};

const supportAreas = [
  "Ministry work",
  "Helping vulnerable families",
  "Supporting children",
  "Food assistance",
  "Gospel outreach",
  "Community projects",
];

export default async function DonatePage() {
  await connection();
  const payment = getDonationPaymentConfiguration();
  const selectedProvider = payment.provider === "sofan_gateway"
    ? "SOFAN's own gateway"
    : payment.provider === "hws_paystack"
      ? "HWS Agency Paystack"
      : null;

  return (
    <MinistryResource
      eyebrow="Giving"
      title="Support the work of SOFAN"
      introduction="Giving is a way to partner with the ministry. Contact SOFAN to confirm the current needs, the purpose for your gift, and how it will be received before making a contribution."
    >
      <section className={`container ${styles.section}`} aria-labelledby="giving-use-heading">
        <div className={styles.sectionHeading}>
          <p className="eyebrow eyebrow--terracotta">Where support may be directed</p>
          <h2 id="giving-use-heading">Ask about the purpose of your gift.</h2>
          <p>Discuss the current allocation and any restrictions directly with SOFAN before donating.</p>
        </div>
        <ul className={styles.areaList}>
          {supportAreas.map((area) => <li key={area}>{area}</li>)}
        </ul>
      </section>

      <section className={`container ${styles.methods}`} aria-labelledby="payment-options-heading">
        <div className={styles.sectionHeading}>
          <p className="eyebrow eyebrow--terracotta">Payment options</p>
          <h2 id="payment-options-heading">Payment configuration pending</h2>
          <p>No online payments are being collected on this website yet. Do not enter card or banking details here.</p>
          {selectedProvider && (
            <p>
              Selected provider: {selectedProvider}.
              {payment.missing.length > 0
                ? ` Still needed: ${payment.missing.join(", ")}.`
                : " Credentials are present, but payment processing is not yet implemented or activated."}
            </p>
          )}
        </div>
        <article className={styles.methodCard}>
          <h3>SOFAN’s own payment gateway</h3>
          <p>Awaiting confirmed provider, merchant account, credentials, and callback details from SOFAN.</p>
        </article>
        <article className={styles.methodCard}>
          <h3>HWS Agency Paystack</h3>
          <p>
            The proposed fee schedule is 3% Paystack plus 6% HWS service fee. This option is not active
            until the agreement and live configuration are confirmed.
          </p>
        </article>
      </section>
      <div className={styles.estimatorWrap}><DonationEstimator /></div>

      <section className={`container ${styles.contact}`} aria-labelledby="giving-contact-heading">
        <h2 id="giving-contact-heading">Confirm giving details with SOFAN.</h2>
        <a href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("SOFAN donation enquiry")}`}>
          Ask about supporting the ministry <span aria-hidden="true">→</span>
        </a>
      </section>
    </MinistryResource>
  );
}
