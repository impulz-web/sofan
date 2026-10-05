import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Pastor MJ, the founder of SOFAN — Seeds of Faith for All Nations.",
};

const foundationCards = [
  {
    title: "Our Vision",
    body: "To lead people to Jesus Christ and establish them in His Kingdom.",
    verse: "John 14:6",
  },
  {
    title: "Our Mission",
    body: "To preach repentance, faith in Jesus Christ, and the love of God to all people and nations.",
    verse: "Mark 1:15",
  },
  {
    title: "Core Message",
    body: "REPENT. BELIEVE. LOVE.",
    verse: "Luke 24:47",
  },
];

const beliefs = [
  {
    title: "The Holy Trinity",
    body: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit.",
  },
  {
    title: "The Bible",
    body: "We believe the Holy Bible is the inspired, infallible, authoritative Word of God and the final rule for faith and practice.",
  },
  {
    title: "Salvation",
    body: "We believe salvation comes through faith in Jesus Christ alone — His death, burial, and resurrection — and is a free gift of God's grace.",
  },
  {
    title: "The Holy Spirit",
    body: "We believe in the present-day ministry of the Holy Spirit, including the gifts of the Spirit as described in 1 Corinthians 12.",
  },
  {
    title: "Water Baptism",
    body: "We believe in water baptism by immersion as an outward declaration of an inward faith in Jesus Christ.",
  },
  {
    title: "Divine Healing",
    body: "We believe in healing for the body as provided for in the atonement of Jesus Christ.",
  },
  {
    title: "The Second Coming",
    body: "We believe in the personal, visible, and imminent return of our Lord Jesus Christ.",
  },
  {
    title: "Eternal Life",
    body: "We believe in the resurrection of the dead — eternal life for the saved and eternal separation for the lost.",
  },
];

const journey = [
  {
    phase: "01 — The Beginning",
    title: "Called by God",
    text: "Pastor MJ received the divine call to ministry. He began preaching in small gatherings and home churches, with a handful of believers who caught the vision.",
  },
  {
    phase: "02 — Early Days",
    title: "First Church Established",
    text: "The ministry officially established its first church congregation. Bible study groups were formed and the prayer ministry was launched.",
  },
  {
    phase: "03 — Growing",
    title: "Charity Work Begins",
    text: "A heart for the community led to the launch of feeding programs, orphan support, and widow care ministries.",
  },
  {
    phase: "04 — Expansion",
    title: "Media Ministry Launched",
    text: "The ministry expanded online through Facebook Live services, YouTube, and TikTok outreach.",
  },
  {
    phase: "05 — Today",
    title: "Growing Stronger",
    text: "The ministry continues to grow through its local congregation, online community, and charitable work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="about-page">
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div className="about-hero__copy">
            <Link href="/" className="button button-secondary">
              Back to Home
            </Link>
            <p className="eyebrow eyebrow--terracotta">About SOFAN</p>
            <h1>A faith that started with a call.</h1>
            <p>
              Seeds of Faith for All Nations was born from a calling to preach Christ, disciple
              people, serve communities, and carry the Gospel to all nations.
            </p>
            <p className="about-hero__label">Founded by Pastor MJ</p>
          </div>
        </div>
      </section>

      <section className="about-founder section-surface">
        <div className="container about-founder__grid">
          <div className="about-founder__visual">
            <Image src="/pastor.jpeg" alt="Pastor MJ portrait" width={809} height={1080} className="about-founder__image" />
          </div>

          <div className="about-founder__content">
            <p className="eyebrow eyebrow--terracotta">Meet the founder</p>
            <h2>Pastor MJ</h2>
            <p className="about-founder__role">Founder of SOFAN</p>
            <p>
              Pastor MJ is a Spirit-filled servant of God who has dedicated his life to the Great
              Commission — preaching the Gospel of Jesus Christ, healing the sick, setting the
              captives free, and discipling nations.
            </p>
            <p>
              Called into ministry by the grace of God, Pastor MJ has served communities with passion
              and humility. His ministry is marked by signs and wonders, transformed lives, and a deep
              love for God&apos;s people.
            </p>
            <p>
              With a heart for the poor and the lost, Pastor MJ has established charitable programs
              that support orphans, widows, and vulnerable families — bringing tangible evidence of
              God&apos;s love to those who need it most.
            </p>
          </div>
        </div>
      </section>

      <section className="about-foundation">
        <div className="container">
          <p className="eyebrow eyebrow--terracotta">Our foundation</p>
          <h2>What we stand on.</h2>

          <div className="foundation-grid">
            {foundationCards.map((card) => (
              <article key={card.title} className="foundation-card">
                <p className="foundation-card__title">{card.title}</p>
                <h3>{card.body}</h3>
                <span>{card.verse}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-journey section-surface">
        <div className="container">
          <p className="eyebrow eyebrow--terracotta">Our journey</p>
          <h2>Our story in motion.</h2>

          <div className="timeline">
            {journey.map((item) => (
              <article key={item.phase} className="timeline-card">
                <span className="timeline-card__phase">{item.phase}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="beliefs-section">
        <div className="container">
          <p className="eyebrow eyebrow--terracotta">What we believe</p>
          <h2>Foundations of faith.</h2>

          <div className="beliefs-grid">
            {beliefs.map((belief) => (
              <article key={belief.title} className="belief-card">
                <h3>{belief.title}</h3>
                <p>{belief.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta__panel">
          <div>
            <p className="eyebrow eyebrow--light">Come grow with us</p>
            <h2>Come grow with us.</h2>
          </div>

          <div className="about-cta__content">
            <p>
              Whether you&apos;re discovering faith, returning to church, or looking for a community to
              call home, there is a place for you at SOFAN.
            </p>

            <div className="about-cta__actions">
              <Link href="/#coming-in" className="give-button">
                Join us
              </Link>
              <Link href="/#sermons" className="button button-secondary">
                Watch sermon
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
