import { Marquee } from "./marquee";
import Link from "next/link";
import { contactInfo } from "@/data/site";

const marqueeItems = ["WELCOME!", "SEED OF FAITH", "BLESSINGS ON YOU", "GOD LOVES YOU"];

export function LocationSection() {
  return (
    <section className="location-section" id="coming-in" aria-labelledby="location-heading">
      <Marquee items={marqueeItems} />

      <div className="container location-section__content">
        <p className="eyebrow eyebrow--terracotta">Time &amp; location</p>
        <h2 id="location-heading">WE&apos;RE EXCITED TO MEET YOU THIS SUNDAY.</h2>

        <div className="location-grid">
          <div className="location-card">
            <span className="label">Sunday service</span>
            <strong>{contactInfo.serviceTimes[0].time}</strong>
          </div>

          <div className="location-card">
            <span className="label">Location</span>
            <strong>{contactInfo.location}</strong>
          </div>
        </div>

        <Link href="/contact" className="map-button">Contact us</Link>
      </div>
    </section>
  );
}
