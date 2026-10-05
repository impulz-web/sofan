import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { contactInfo } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Connect with SOFAN in Juba, South Sudan. Reach us for prayer, church information, or to join the community.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="container contact-hero__grid">
            <div className="contact-hero__copy">
              <p className="eyebrow eyebrow--terracotta">Get in touch</p>
              <h1>
                We&apos;d love to
                <span>hear from you.</span>
              </h1>
              <p>
                Whether you have a prayer request, a question about our church, or simply want to
                connect with us, we&apos;d love to hear from you.
              </p>
            </div>
            <figure className="contact-hero__image">
              <Image
                src="/WhatsApp%20Image%202026-10-03%20at%208.51.34%20PM.jpeg"
                alt="Members of the SOFAN community gathered together."
                fill
                priority
                sizes="(max-width: 760px) 100vw, 52vw"
              />
              <figcaption>SOFAN community, Juba</figcaption>
            </figure>
          </div>
        </section>

        <section className="contact-main" aria-labelledby="visit-heading">
          <div className="container contact-main__grid">
            <div className="contact-main__intro">
              <p className="eyebrow eyebrow--terracotta">Visit or connect</p>
              <h2 id="visit-heading">Come and see us.</h2>
              <p>
                SOFAN — Seeds of Faith for All Nations is a church community based in Juba, South
                Sudan. Join us for worship, prayer, Bible study, and fellowship.
              </p>
              <div className="contact-location-summary">
                <span className="label">Church location</span>
                <strong>{contactInfo.location}</strong>
              </div>
            </div>

            <div className="contact-methods">
              <article className="contact-method contact-method--whatsapp">
                <p className="eyebrow eyebrow--light">WhatsApp / Prayer Hotline</p>
                <h3>{contactInfo.whatsappNumber}</h3>
                <p>Available for prayer requests and general inquiries.</p>
                <a href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer">
                  Chat with us on WhatsApp <span aria-hidden="true">→</span>
                </a>
              </article>
              <article className="contact-method contact-method--email">
                <p className="eyebrow eyebrow--terracotta">Email</p>
                <a className="contact-method__email" href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
                <p>For church questions, prayer, and getting connected.</p>
                <a href={`mailto:${contactInfo.email}`}>
                  Send us an email <span aria-hidden="true">→</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="contact-services section-surface" aria-labelledby="services-heading">
          <div className="container contact-services__grid">
            <div>
              <p className="eyebrow eyebrow--terracotta">Worship, word, and prayer</p>
              <h2 id="services-heading">Join us this week.</h2>
              <p>There is a place for you in the life of our church.</p>
            </div>
            <dl className="service-times">
              {contactInfo.serviceTimes.map((service) => (
                <div className="service-time" key={service.name}>
                  <dt>{service.name}</dt>
                  <dd>{service.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="contact-prayer" aria-labelledby="prayer-heading">
          <div className="container contact-prayer__grid">
            <div className="contact-prayer__copy">
              <p className="eyebrow eyebrow--terracotta">We&apos;re here to listen</p>
              <h2 id="prayer-heading">How can we pray with you?</h2>
              <p>
                Have a prayer request or need to speak with someone from our church? Send us a
                message and our team will be glad to hear from you.
              </p>
              <p className="contact-prayer__note">
                Your message opens in your email app so you can review and send it directly.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="contact-social section-surface" aria-labelledby="social-heading">
          <div className="container contact-social__inner">
            <div>
              <p className="eyebrow eyebrow--terracotta">Stay connected</p>
              <h2 id="social-heading">Follow the journey.</h2>
            </div>
            <div className="contact-social__copy">
              <p>
                Stay connected with SOFAN through our social channels for sermons, church updates,
                prayer, events, and ministry activities.
              </p>
              <p className="contact-social__notice">
                Official social links are not yet listed here. Reach us by WhatsApp or email in the
                meantime.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-location" aria-labelledby="location-heading">
          <div className="container contact-location__grid">
            <div>
              <p className="eyebrow eyebrow--terracotta">Our church home</p>
              <h2 id="location-heading">Find us in Juba.</h2>
              <p>We look forward to welcoming you into our church community.</p>
            </div>
            <div className="contact-location__panel">
              <span className="label">SOFAN — Seeds of Faith for All Nations</span>
              <strong>{contactInfo.location}</strong>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <div className="container contact-cta__inner">
            <div>
              <p className="eyebrow eyebrow--light">A church family in Juba</p>
              <h2>You have a place here.</h2>
              <p>
                Whether you&apos;re looking for a church family, need prayer, want to grow in God&apos;s
                Word, or simply want to connect, we&apos;d love to welcome you to SOFAN.
              </p>
            </div>
            <div className="contact-cta__actions">
              <Link href="/#coming-in" className="give-button">Join us</Link>
              <Link href="/#sermons" className="button button-secondary">Watch sermon</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}