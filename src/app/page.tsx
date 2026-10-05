import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LocationSection } from "@/components/site/location-section";
import { MinistryCard } from "@/components/site/ministry-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SermonCard } from "@/components/site/sermon-card";
import { EventCard } from "@/components/site/event-card";
import { Button } from "@/components/ui";
import { events, ministries, sermons } from "@/data/site";

export default function Home() {
  return (
    <>
      <Header />

      <main className="page-shell" id="main-content">
        <div className="brand-strip">
          <div className="container">SOFAN MINISTRIES</div>
        </div>
        <section className="hero-section">
          <div className="hero-section__background" aria-hidden="true">
            <Image
              src="/sofan%20hero%20bg.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-section__image"
            />
            <div className="hero-section__overlay" />
          </div>
          <div className="hero-section__shape" aria-hidden="true" />
          <div className="container hero-section__layout">
            <div className="hero-copy-block hero-copy-block--overlay">
              <p className="eyebrow eyebrow--terracotta">Seeds of Faith for All Nations</p>
              <h1>
                A place to worship.
                <span>A place to grow.</span>
                <span>A place to serve.</span>
              </h1>
              <p className="hero-subtitle">
                SOFAN is a welcoming church family where faith is nurtured, communities are restored,
                and lives are shaped by the love of Jesus Christ.
              </p>

              <div className="hero-actions" aria-label="Call to action buttons">
                <Button href="#coming-in" variant="primary">
                  Join us
                </Button>
                <Button href="#sermons" variant="secondary">
                  Watch sermon
                </Button>
              </div>
            </div>

          </div>
        </section>

        <section className="apostle-message" aria-labelledby="apostle-message-heading">
          <div className="container apostle-message__grid">
            <div className="apostle-message__portrait">
              <Image
                src="/happy%20pastor%20mj%20ministries.jpg"
                alt="Apostle MJ smiling as he speaks into a microphone."
                width={526}
                height={701}
                className="apostle-message__image"
              />
            </div>

            <div className="apostle-message__copy">
              <p className="eyebrow eyebrow--terracotta">A Message from Apostle MJ</p>
              <h2 id="apostle-message-heading"></h2>
              <p>
                Greetings in the name of our Lord and Saviour Jesus Christ! I am so glad you found
                your way here. This ministry exists to carry the fire of God&apos;s love to every
                corner of the earth.
              </p>
              <p>
                Whether you need prayer, seek spiritual growth, or want to partner with us to impact
                lives — you have come to the right place. Together, we are making a difference in
                our communities through the power of the Holy Spirit.
              </p>
              <blockquote className="apostle-message__scripture">
                <p>
                  &ldquo;The Spirit of the Lord is upon me, because He has anointed me to preach good
                  news to the poor.&rdquo;
                </p>
                <cite>Luke 4:18</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="community-moments" aria-labelledby="community-moments-heading">
          <div className="container community-moments__grid">
            <div className="community-moments__copy">
              <p className="eyebrow eyebrow--terracotta">Life at SOFAN</p>
              <h2 id="community-moments-heading">Faith shared. Hope grows.</h2>
              <p>
                Worship, prayer, service, and everyday fellowship bring our church family together.
              </p>
            </div>

            <div className="hero-visual" aria-label="SOFAN community moments">
              <div className="hero-photo-collage hero-photo-collage--community">
                <div className="hero-photo-shape hero-photo-shape--one">
                  <Image
                    src="/faith1.jpg"
                    alt="SOFAN children and adults sharing a community meal."
                    width={2048}
                    height={1153}
                    className="hero-photo-collage__image hero-photo-collage__image--one"
                  />
                </div>
                <div className="hero-photo-shape hero-photo-shape--two">
                  <Image
                    src="/faith2.jpg"
                    alt="A SOFAN preacher praying with a community member."
                    width={720}
                    height={540}
                    className="hero-photo-collage__image hero-photo-collage__image--two"
                  />
                </div>
                <div className="hero-photo-shape hero-photo-shape--three">
                  <Image
                    src="/faith3.jpg"
                    alt="A SOFAN woman leading worship in prayer."
                    width={1536}
                    height={2048}
                    className="hero-photo-collage__image hero-photo-collage__image--three"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <LocationSection />

        <section className="welcome-section" id="welcome">
          <div className="container welcome-grid">
            <div className="welcome-visual">
              <div className="welcome-visual__frame">
                <Image src="/pastor.jpeg" alt="SOFAN church leader" width={960} height={1100} />
              </div>
            </div>

            <div className="welcome-copy-block">
              <SectionHeading
                eyebrow="Welcome"
                title={
                  <>
                    Faith that takes root.
                    <span>Love that reaches everyone.</span>
                  </>
                }
              />

              <p>
                SOFAN is a Christ-centered community where faith is nurtured, hope is shared,
                and people are encouraged to grow in purpose and service. We believe every person
                has a place in God&apos;s story and a calling to bring the love of Christ to the nations.
              </p>

              <Link href="/about" className="inline-link">
                Learn more about SOFAN <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="ministries-section" id="ministries">
          <div className="container">
            <SectionHeading
              eyebrow="Ministries"
              title="A place for every season of faith"
              align="center"
            />

            <div className="ministries-grid">
              {ministries.map((ministry, index) => (
                <MinistryCard
                  key={ministry.title}
                  title={ministry.title}
                  description={ministry.description}
                  image={ministry.image}
                  eyebrow={index + 1 < 10 ? `0${index + 1}` : `${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="scripture-section" aria-labelledby="scripture-heading">
          <div className="container scripture-shell">
            <div className="scripture-cross" aria-hidden="true" />
            <p id="scripture-heading" className="scripture-quote">
              &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            </p>
            <p className="scripture-reference">Psalm 119:105</p>
          </div>
        </section>

        <section className="sermons-section" id="sermons">
          <div className="container">
            <SectionHeading
              eyebrow="Sermons"
              title="Words that grow us."
            />

            <div className="sermons-layout">
              <SermonCard
                title={sermons[0].title}
                speaker={sermons[0].speaker}
                date={sermons[0].date}
                image={sermons[0].image}
                href={sermons[0].href}
                featured
              />

              <div className="sermon-list">
                {sermons.slice(1).map((sermon) => (
                  <SermonCard
                    key={sermon.title}
                    title={sermon.title}
                    speaker={sermon.speaker}
                    date={sermon.date}
                    image={sermon.image}
                    href={sermon.href}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="events-section section-surface" id="events">
          <div className="container">
            <SectionHeading
              eyebrow="Upcoming events"
              title="There&apos;s always room for you."
            />

            <div className="events-grid">
              {events.map((event) => (
                <EventCard
                  key={event.title}
                  date={event.date}
                  title={event.title}
                  time={event.time}
                  description={event.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="giving-section" id="giving">
          <div className="container giving-panel">
            <div>
              <p className="eyebrow eyebrow--light">Giving</p>
              <h2>
                Your generosity
                <span>helps faith grow.</span>
              </h2>
            </div>

            <div className="giving-copy">
              <p>
                Thank you for partnering with SOFAN to nurture faith, serve communities, and make
                Christ&apos;s love visible across every nation.
              </p>
              <a href="#" className="give-button giving-button">
                Give online <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
