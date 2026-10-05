import type { Metadata } from "next";
import { MinistryResource } from "@/components/site/ministry-resource";
import { contactInfo } from "@/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Donate",
  description: "Learn how to support SOFAN and contact the church for giving information.",
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

      <section className={`container ${styles.contact}`} aria-labelledby="giving-contact-heading">
        <div className={styles.sectionHeading}>
          <p className="eyebrow eyebrow--terracotta">Giving enquiries</p>
          <h2 id="giving-contact-heading">Contact SOFAN for giving information.</h2>
          <p>Reach out to the church for current giving details and to discuss how your contribution can support the ministry.</p>
        </div>
        <a href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("SOFAN donation enquiry")}`}>
          Ask about supporting the ministry <span aria-hidden="true">→</span>
        </a>
      </section>
    </MinistryResource>
  );
}
