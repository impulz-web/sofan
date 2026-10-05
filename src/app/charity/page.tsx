import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { contactInfo } from "@/data/site";
import { loadPublishedCharityProjects } from "@/lib/public-ministry-content";

export const metadata: Metadata = {
  title: "Charity & Outreach",
  description:
    "Discover how SOFAN puts faith into action through practical care for children, families, widows, and communities.",
};

const programs = [
  {
    number: "05",
    title: "Helping Vulnerable Families",
    description: "Ask SOFAN about current support for vulnerable families and their needs.",
    detail:
      "Specific services and current support needs should be confirmed with the ministry before contributing.",
    action: "Ask about family support",
    subject: "Vulnerable Family Support",
    image: "/service%20to%20community.jpg",
    alt: "SOFAN community members serving together.",
  },
  {
    number: "01",
    title: "Feeding Program",
    description: "Ask SOFAN whether food assistance is currently active and what support is needed.",
    detail:
      "Current schedule, eligibility, and needs should be confirmed directly with the ministry.",
    action: "Support this program",
    subject: "Feeding Program support",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.34%20PM.jpeg",
    alt: "Community members gathered at a SOFAN outreach meeting.",
  },
  {
    number: "02",
    title: "Orphan Support",
    description: "Ask SOFAN about current support for orphaned and vulnerable children.",
    detail:
      "Specific services and support needs should be confirmed directly with the ministry.",
    action: "Sponsor a child",
    subject: "Orphan Support sponsorship",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.33%20PM%20(1).jpeg",
    alt: "Children wearing SOFAN shirts at a community gathering.",
  },
  {
    number: "03",
    title: "Widow Support",
    description: "Ask SOFAN about current support for widows and their families.",
    detail:
      "Specific services and support needs should be confirmed directly with the ministry.",
    action: "Support widow care",
    subject: "Widow Support",
    image: "/WhatsApp%20Image%202026-10-03%20at%208.51.33%20PM.jpeg",
    alt: "Women taking part in a SOFAN community gathering.",
  },
  {
    number: "04",
    title: "Mission Outreach",
    description: "Learn about SOFAN's current mission outreach and how to get involved.",
    detail:
      "Contact SOFAN for details of current activities and support needs.",
    action: "Support mission outreach",
    subject: "Mission Outreach support",
    image: "/WhatsApp%20Image%202026-10-03%20at%209.01.24%20PM.jpeg",
    alt: "A SOFAN ministry leader sharing a message during an outreach gathering.",
  },
  {
    number: "06",
    title: "Community Projects",
    description: "Ask SOFAN about current community projects and ways to support them.",
    detail:
      "Specific project details and designated support needs can be confirmed directly with the ministry.",
    action: "Ask about community projects",
    subject: "Community Projects",
    image: "/service%20to%20community.jpg",
    alt: "SOFAN community members serving together.",
  },
];

function supportHref(subject: string) {
  return `mailto:${contactInfo.email}?subject=${encodeURIComponent(`SOFAN ${subject}`)}`;
}

function safeSupportHref(value: string | null, subject: string) {
  if (!value) return supportHref(subject);
  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return `mailto:${value}`;
  if (/^\+?[0-9().\s-]{7,20}$/.test(value)) return `tel:${value.replace(/[^\d+]/g, "")}`;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : supportHref(subject);
  } catch {
    return supportHref(subject);
  }
}

function safeImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function CharityPage() {
  await connection();
  const projects = await loadPublishedCharityProjects();

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
                This page outlines ways to ask about food assistance, child and widow support,
                mission outreach, community projects, and wider family support. Contact SOFAN to
                confirm which programs are currently active and what is needed.
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
                These areas describe ways visitors may be able to support the ministry. Please
                contact SOFAN to confirm current activities, designated needs, and giving details.
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

        {(projects.status === "unavailable" || (projects.status === "ready" && projects.rows.length > 0)) && (
          <section className="outreach-programs" aria-labelledby="published-projects-heading">
            <div className="container">
              <div className="outreach-programs__heading">
                <div>
                  <p className="eyebrow eyebrow--terracotta">Published by SOFAN</p>
                  <h2 id="published-projects-heading">Community projects.</h2>
                </div>
                <p>These project details are managed and published by the SOFAN ministry team.</p>
              </div>
              {projects.status === "unavailable" ? (
                <p role="status">Published project details are temporarily unavailable. Please contact SOFAN for current information.</p>
              ) : (
                <div className="outreach-programs__grid">
                  {projects.rows.map((project) => {
                    const imageUrl = safeImageUrl(project.imageUrl);
                    const supportLink = safeSupportHref(project.supportContact, project.title);
                    const externalSupportLink = /^https?:\/\//i.test(supportLink);
                    return (
                      <article className="outreach-program" key={project.id}>
                        <div className="outreach-program__image">
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt=""
                              fill
                              unoptimized
                              sizes="(max-width: 760px) 100vw, 50vw"
                            />
                          )}
                          <span className="outreach-program__number">{project.category}</span>
                        </div>
                        <div className="outreach-program__body">
                          <h3>{project.title}</h3>
                          <p className="outreach-program__description">{project.description}</p>
                          <a
                            className="outreach-program__link"
                            href={supportLink}
                            target={externalSupportLink ? "_blank" : undefined}
                            rel={externalSupportLink ? "noreferrer" : undefined}
                          >
                            {project.supportCta || "Ask about this project"} <span aria-hidden="true">→</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="outreach-giving">
          <div className="container outreach-giving__inner">
            <div>
              <p className="eyebrow eyebrow--light">Stand with SOFAN</p>
              <h2>Help love reach further.</h2>
            </div>
            <div className="outreach-giving__copy">
              <p>
                Before giving, contact SOFAN to confirm the active program, intended use, and
                approved way to contribute.
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