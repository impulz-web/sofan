import Image from "next/image";
import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { contactInfo } from "@/data/site";

export const metadata: Metadata = {
  title: "Charity & Outreach",
  description:
    "Discover how SOFAN puts faith into action through practical care for children, families, widows, and communities.",
};

const programs = [
  {
    number: "01",
    title: "Feeding Program",
    description: "Providing nutritious meals to hungry families in our community every week.",
    detail:
      "Every Saturday, our team prepares and distributes food packages to vulnerable families. No one should go hungry while we can help.",
    action: "Support this program",
    subject: "Feeding Program support",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.34%20PM.jpeg",
    alt: "Community members gathered at a SOFAN outreach meeting.",
  },
  {
    number: "02",
    title: "Orphan Support",
    description: "Providing care, education, and love to orphaned and vulnerable children in our community.",
    detail:
      "We partner with families to provide a loving home, school fees, uniforms, and emotional support to orphaned and vulnerable children.",
    action: "Sponsor a child",
    subject: "Orphan Support sponsorship",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.33%20PM%20(1).jpeg",
    alt: "Children wearing SOFAN shirts at a community gathering.",
  },
  {
    number: "03",
    title: "Widow Support",
    description: "Standing with widows through practical care, encouragement, and a community that shows up.",
    detail:
      "We seek to walk alongside widows and their families with compassion and dignity, reminding each person that they are seen, valued, and not alone.",
    action: "Support widow care",
    subject: "Widow Support",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.33%20PM.jpeg",
    alt: "Women taking part in a SOFAN community gathering.",
  },
  {
    number: "04",
    title: "Mission Outreach",
    description: "Taking the Gospel beyond church walls and serving communities with compassion.",
    detail:
      "Through prayer, encouragement, and practical care, we meet people where they are and share the hope of Jesus with communities near and far.",
    action: "Support mission outreach",
    subject: "Mission Outreach support",
    image: "/WhatsApp%20Image%202026-10-03%20at%209.01.24%20PM.jpeg",
    alt: "A SOFAN ministry leader sharing a message during an outreach gathering.",
  },
];

function supportHref(subject: string) {
  return `mailto:${contactInfo.email}?subject=${encodeURIComponent(`SOFAN ${subject}`)}`;
}

export default function CharityPage() {
  return (
    <>
      <Header />
      <main className="outreach-page">
        <section className="outreach-hero">
          <div className="container outreach-hero__grid">
            <div className="outreach-hero__copy">
              <p className="eyebrow eyebrow--terracotta">Charity &amp; Outreach</p>
              <h1>
                Faith that
                <span>serves.</span>
              </h1>
              <p className="outreach-hero__intro">
                At SOFAN, we believe the love of God should be seen not only in what we preach, but
                in how we serve people. Through practical support, compassion, and Gospel outreach,
                we stand with vulnerable families and communities in need.
              </p>
              <div className="outreach-hero__actions">
                <a href="#programs" className="give-button">
                  Support our work
                </a>
                <a href="#impact" className="button button-secondary">
                  See our impact
                </a>
              </div>
            </div>

            <figure className="outreach-hero__image">
              <Image
                src="/WhatsApp%20Image%202026-10-03%20at%208.51.34%20PM.jpeg"
                alt="Families and community members gathered at a SOFAN outreach meeting."
                fill
                priority
                sizes="(max-width: 760px) 100vw, 52vw"
              />
              <figcaption>Faith lived out, together.</figcaption>
            </figure>
          </div>
        </section>

        <section className="outreach-intro" id="impact">
          <div className="container outreach-intro__grid">
            <div>
              <p className="eyebrow eyebrow--terracotta">Faith in action</p>
              <h2>Love in action.</h2>
            </div>
            <div className="outreach-intro__copy">
              <p>
                Every act of kindness is an opportunity to demonstrate God&apos;s love. From feeding
                families and supporting children to standing with widows and taking the Gospel to
                communities, SOFAN seeks to serve people with dignity, compassion, and faith.
              </p>
              <p className="outreach-intro__note">Practical care. Shared hope. A faith that serves.</p>
            </div>
          </div>
        </section>

        <section className="outreach-programs" id="programs">
          <div className="container">
            <div className="outreach-programs__heading">
              <div>
                <p className="eyebrow eyebrow--terracotta">Where care takes shape</p>
                <h2>Standing with our community.</h2>
              </div>
              <p>Every program is an invitation to share God&apos;s love through practical service.</p>
            </div>

            <div className="outreach-programs__grid">
              {programs.map((program) => (
                <article className="outreach-program" key={program.number}>
                  <div className="outreach-program__image">
                    <Image src={program.image} alt={program.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
                    <span className="outreach-program__number">{program.number}</span>
                  </div>
                  <div className="outreach-program__body">
                    <h3>{program.title}</h3>
                    <p className="outreach-program__description">{program.description}</p>
                    <p className="outreach-program__detail">{program.detail}</p>
                    <a className="outreach-program__link" href={supportHref(program.subject)}>
                      {program.action} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="outreach-giving">
          <div className="container outreach-giving__inner">
            <div>
              <p className="eyebrow eyebrow--light">Stand with SOFAN</p>
              <h2>Help love reach further.</h2>
            </div>
            <div className="outreach-giving__copy">
              <p>
                Your generosity helps us care for vulnerable people and strengthen the work already
                happening in our communities. Get in touch to support a program or make a general
                contribution.
              </p>
              <a className="give-button" href={supportHref("General Charity Support")}>
                Give to our work <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}