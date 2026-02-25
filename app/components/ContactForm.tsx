"use client";

import { type FormEvent, useRef } from "react";

const EMAIL = "s.cajalvarela@gmail.com";

export function ContactForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    const message = messageRef.current?.value ?? "";
    const subject = encodeURIComponent("Contact from portfolio");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-sm font-medium text-zinc-300">
          Full Name
        </label>
        <input
          ref={nameRef}
          id="contact-name"
          type="text"
          name="name"
          autoComplete="name"
          className="rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-sm font-medium text-zinc-300">
          Email Address
        </label>
        <input
          ref={emailRef}
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-zinc-300">
          Your message
        </label>
        <textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          rows={4}
          className="resize-none rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Tell me about your project..."
        />
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-teal-600 px-5 py-3 font-medium text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98]"
      >
        Send
      </button>
    </form>
  );
}
