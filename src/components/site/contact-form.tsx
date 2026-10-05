"use client";

import { useState, type FormEvent } from "react";
import { contactInfo } from "@/data/site";
import { Button } from "@/components/ui";

export function ContactForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const messageBody = [
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Phone / WhatsApp: ${formData.get("phone") || "Not provided"}`,
      "",
      "Prayer request / message:",
      String(formData.get("message")),
    ].join("\n");
    const emailUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent("SOFAN prayer request or message")}&body=${encodeURIComponent(messageBody)}`;

    setStatus("Your email app will open with your message ready. Please send it from there.");
    window.location.href = emailUrl;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="contact-form__field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="contact-form__field">
        <label htmlFor="contact-phone">Phone / WhatsApp <span>(optional)</span></label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="contact-form__field">
        <label htmlFor="contact-message">Prayer request / message</label>
        <textarea id="contact-message" name="message" rows={5} required />
      </div>
      <Button type="submit">Send message</Button>
      <p className="contact-form__status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}