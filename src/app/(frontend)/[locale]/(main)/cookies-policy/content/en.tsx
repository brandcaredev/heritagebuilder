/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";

const EnglishCookiePolicy = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-brown-100 p-6 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-brown-900">
          COOKIE POLICY
        </h1>
        <p className="italic text-brown-700">Last updated: 2024.06.12</p>
      </div>

      <div className="mb-6">
        <p className="text-brown-900">
          This Cookie Policy explains how <strong>heritagebuilder.eu</strong>{" "}
          uses cookies and similar technologies to recognize you when you visit
          our website. It explains what these technologies are and why we use
          them, as well as your rights to control our use of them.
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(1)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            1. What are Cookies?
          </h2>
          <span className="text-green">
            {expandedSection === 1 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 1 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. Cookies are widely used by
              website owners to make their websites work efficiently and provide
              a better browsing experience.
            </p>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(2)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            2. How We Use Cookies
          </h2>
          <span className="text-green">
            {expandedSection === 2 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 2 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Our website uses cookies for the following purposes:
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Authentication</h3>
            <p className="mb-2">
              We use cookies to identify you when you visit our website and as
              you navigate from page to page. These cookies help maintain your
              login session and allow you to access restricted areas of the
              website.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Language Preferences</h3>
            <p className="mb-2">
              Cookies are used to remember your preferred language settings
              (English or Hungarian) between visits to our website.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Session Management</h3>
            <p className="mb-2">
              We use session cookies to maintain your session state while you
              navigate through our website. These temporary cookies expire when
              you close your browser.
            </p>
          </div>
        )}
      </div>

      {/* Section 3 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(3)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            3. Cookie Duration
          </h2>
          <span className="text-green">
            {expandedSection === 3 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 3 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              The length of time a cookie will remain on your device depends on
              whether it is a "persistent" or "session" cookie:
            </p>
            <ul className="mb-2 list-disc pl-6">
              <li>
                <strong>Session Cookies</strong>: These cookies will only stay
                on your device until you close your browser.
              </li>
              <li>
                <strong>Persistent Cookies</strong>: Authentication and
                preference cookies may remain on your device for up to several
                months to remember your login status and preferences.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(4)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            4. Cookie Management
          </h2>
          <span className="text-green">
            {expandedSection === 4 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 4 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Most web browsers allow you to control cookies through their
              settings preferences. However, if you limit the ability of
              websites to set cookies, you may worsen your overall user
              experience and may not be able to use certain functions of our
              website, such as logging in or accessing personalized content.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">
              How to Delete Cookies in Common Browsers:
            </h3>
            <ul className="mb-2 list-disc pl-6">
              <li>
                <strong>Chrome</strong>: Settings → Privacy and security →
                Cookies and other site data
              </li>
              <li>
                <strong>Firefox</strong>: Options → Privacy & Security → Cookies
                and Site Data
              </li>
              <li>
                <strong>Safari</strong>: Preferences → Privacy → Manage Website
                Data
              </li>
              <li>
                <strong>Edge</strong>: Settings → Privacy, search, and services
                → Clear browsing data
              </li>
            </ul>

            <p className="mb-2 mt-4">
              Please note that disabling cookies will impact the functionality
              of our website. Disabling cookies may result in disabling certain
              functions and features of this site, particularly
              authentication-related features.
            </p>
          </div>
        )}
      </div>

      {/* Section 5 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(5)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            5. Your Consent
          </h2>
          <span className="text-green">
            {expandedSection === 5 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 5 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              By continuing to use our website, you are agreeing to our placing
              necessary cookies on your device. These cookies are essential for
              the basic functionalities of the website.
            </p>
            <p className="mb-2">
              If you do not wish to accept cookies from our website, please
              close your browser or discontinue using the site.
            </p>
          </div>
        )}
      </div>

      {/* Section 6 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(6)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            6. Changes to This Cookie Policy
          </h2>
          <span className="text-green">
            {expandedSection === 6 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 6 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, regulation, or our business practices. Any
              changes will become effective when we post the revised Cookie
              Policy on our website.
            </p>
            <p className="mb-2">
              We encourage you to periodically review this page to stay informed
              about our use of cookies.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mt-6 border-t border-brown-200 pt-6">
        <h2 className="mb-3 text-xl font-semibold text-brown-900">Contact</h2>
        <p className="text-brown-900">
          If you have any questions regarding this Cookie Policy, contact the
          website operators at:
        </p>
        <p className="mt-2 font-medium">
          📧 Email:{" "}
          <a
            href="mailto:politikaidemografia.mail@gmail.com"
            className="text-green hover:underline"
          >
            politikaidemografia.mail@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default EnglishCookiePolicy;
