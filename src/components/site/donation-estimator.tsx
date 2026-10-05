"use client";

import { useState } from "react";
import styles from "./donation-estimator.module.css";

function formatKes(amount: number) {
  return `KES ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function DonationEstimator() {
  const [amount, setAmount] = useState("10000");
  const numericAmount = Number(amount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const processorFee = validAmount ? numericAmount * 0.03 : 0;
  const platformFee = validAmount ? numericAmount * 0.06 : 0;
  const netAmount = validAmount ? numericAmount - processorFee - platformFee : 0;

  return (
    <section className={styles.estimator} aria-labelledby="donation-estimate-heading">
      <div>
        <p className="eyebrow eyebrow--terracotta">HWS Paystack fee illustration</p>
        <h2 id="donation-estimate-heading">See the proposed fee breakdown.</h2>
        <p>
          This is an estimate of the fee arrangement supplied for the HWS agency option only.
          It is not a live payment quote or an active payment form.
        </p>
      </div>
      <label className={styles.amountField} htmlFor="donation-estimate-amount">
        Donation amount (KES)
        <input
          id="donation-estimate-amount"
          type="number"
          min="1"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <dl className={styles.breakdown}>
        <div><dt>Donation amount</dt><dd>{validAmount ? formatKes(numericAmount) : "—"}</dd></div>
        <div><dt>Paystack transaction fee (3%)</dt><dd>{validAmount ? formatKes(processorFee) : "—"}</dd></div>
        <div><dt>HWS platform/service fee (6%)</dt><dd>{validAmount ? formatKes(platformFee) : "—"}</dd></div>
        <div className={styles.net}><dt>Estimated net settlement (91%)</dt><dd>{validAmount ? formatKes(netAmount) : "—"}</dd></div>
      </dl>
    </section>
  );
}
