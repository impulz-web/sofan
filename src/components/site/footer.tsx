import Image from "next/image";
import Link from "next/link";
import { contactInfo } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Image src="/logo.jpeg" alt="SOFAN logo" width={170} height={80} />
          <p>Seeds of Faith for All Nations</p>
        </div>

        <div className="site-footer__group">
          <h3>Explore</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/charity">Charity</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/prayer-request">Prayer Request</Link></li>
            <li><Link href="/#ministries">Ministries</Link></li>
            <li><Link href="/#sermons">Sermons</Link></li>
          </ul>
        </div>

        <div className="site-footer__group">
          <h3>Contact</h3>
          <ul>
            <li>{contactInfo.church}</li>
            <li>{contactInfo.location}</li>
            <li><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>
            <li><a href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer">{contactInfo.whatsappNumber}</a></li>
          </ul>
        </div>

        <div className="site-footer__group">
          <h3>Service times</h3>
          <ul>
            {contactInfo.serviceTimes.map((service) => (
              <li key={service.name}>{service.name}: {service.time}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom container">
        <p>© 2026 SOFAN. All rights reserved.</p>
        <Link href="/#giving" className="footer-give">Give online</Link>
      </div>
    </footer>
  );
}
