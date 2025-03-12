/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";

const EnglishTerms = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">TERMS OF USE</h1>
        <p className="italic text-gray-600">Last updated: 2025.03.07.</p>
      </div>

      <div className="mb-6">
        <p className="text-gray-700">
          This document contains the terms and conditions for using the{" "}
          <strong>heritagebuilder.eu</strong> website. By using the website,
          users accept the following terms.
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(1)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            1. General Provisions
          </h2>
          <span className="text-blue-500">
            {expandedSection === 1 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 1 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              1.1. <strong>heritagebuilder.eu</strong> is a community-based
              platform that collects information about buildings and their
              history.
            </p>
            <p className="mb-2">
              1.2. The website's purpose is to allow users to share and expand
              information, images, and data related to historical buildings.
            </p>
            <p className="mb-2">
              1.3. The website owner and operator reserve the right to review,
              edit, and remove uploaded content.
            </p>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(2)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            2. User Registration and Rights
          </h2>
          <span className="text-blue-500">
            {expandedSection === 2 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 2 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              2.1. Registration is required to use the website. Users must
              provide accurate and truthful information during registration.
            </p>
            <p className="mb-2">
              2.2. Only individuals aged 18 and above may use the website.
            </p>
            <p className="mb-2">
              2.3. Users upload content at their own responsibility and must
              ensure that it does not infringe on the copyright, personal
              rights, or other legal rights of others.
            </p>
            <p className="mb-2">
              2.4. The community editing function is only available to users
              approved by the website.
            </p>
          </div>
        )}
      </div>

      {/* Section 3 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(3)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            3. Content Upload and Editing
          </h2>
          <span className="text-blue-500">
            {expandedSection === 3 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 3 && (
          <div className="mt-3 pl-4 text-gray-700">
            <h3 className="mb-2 font-semibold">
              3.1. Uploading Images and Other Content
            </h3>
            <p className="mb-2 pl-2">
              3.1.1. Users can upload images, descriptions, and other
              information to existing building data pages.
            </p>
            <p className="mb-2 pl-2">
              3.1.2. Uploaded images and texts must comply with copyright
              regulations. Users may only upload content that:
            </p>
            <ul className="mb-2 list-disc pl-8">
              <li>
                They have created themselves and own as their intellectual
                property, or
              </li>
              <li>
                Comes from a source that permits such use (e.g., public domain,
                open license, properly licensed materials).
              </li>
            </ul>
            <p className="mb-4 pl-2">
              3.1.3. By uploading content, the user grants{" "}
              <strong>heritagebuilder.eu</strong> a non-exclusive but
              irrevocable usage right, allowing the website to edit, display,
              and distribute the content.
            </p>

            <h3 className="mb-2 font-semibold">
              3.2. Third-Party Rights and Handling of Copyright Complaints
            </h3>
            <p className="mb-2 pl-2">
              3.2.1.1. If a third party reports that an uploaded content (e.g.,
              a photograph) violates their copyright or other rights,{" "}
              <strong>heritagebuilder.eu</strong> reserves the right to:
            </p>
            <ul className="mb-4 list-disc pl-8">
              <li>
                Temporarily remove the content while investigating the
                complaint.
              </li>
              <li>
                Contact the involved parties and request the user to prove the
                content's legitimacy.
              </li>
              <li>
                Permanently remove the content from the website if the complaint
                is valid.
              </li>
            </ul>

            <h3 className="mb-2 font-semibold">
              3.3. User-Requested Deletion and Modification of Uploaded Content
            </h3>
            <p className="mb-2 pl-2">
              3.3.1.1. After uploading, users cannot independently delete their
              content, as it becomes part of the website's community database.
            </p>
            <p className="mb-2 pl-2">
              3.3.1.2. However, users may request content removal or
              modification if its publication becomes problematic (e.g.,
              accidental upload of personal data).
            </p>
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(4)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            4. Liability and Limitations
          </h2>
          <span className="text-blue-500">
            {expandedSection === 4 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 4 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              4.1. The website does not take responsibility for the accuracy or
              legality of user-uploaded content.
            </p>
            <p className="mb-2">
              4.2. The website is not liable for copyright violations reported
              by third parties but reserves the right to remove disputed
              content.
            </p>
            <p className="mb-2">
              4.3. The website does not guarantee continuous availability or the
              prevention of technical errors.
            </p>
          </div>
        )}
      </div>

      {/* Section 5 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(5)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            5. Copyright and Data Protection
          </h2>
          <span className="text-blue-500">
            {expandedSection === 5 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 5 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              5.1. The content on the website (excluding user uploads) is the
              property of{" "}
              <strong>
                Politikai Demográfia Közép-Európai Kutatóintézete Alapítvány
              </strong>{" "}
              and may only be used with prior permission.
            </p>

            <div className="mb-4 rounded bg-gray-100 p-3">
              <p className="font-semibold">Owner and Operator:</p>
              <p>
                📌 Politikai Demográfia Közép-Európai Kutatóintézete Alapítvány
              </p>
              <p>📍 Address: 1084 Budapest, Víg utca 20. 3rd floor/7a.</p>
              <p>🔢 Tax number: 19225201-1-42</p>
            </div>

            <p className="mb-2">
              5.2. Users grant the website operators a non-exclusive but
              unlimited usage right over their uploaded content. This means that
              uploaded content may be displayed, edited, and used by{" "}
              <strong>heritagebuilder.eu</strong> editors for the website's
              purposes.
            </p>
            <p className="mb-2">
              5.3. The website's <strong>Privacy Policy</strong> is outlined in
              a separate document, which governs the handling of personal data.
              Further information can be found in the website's{" "}
              <strong>Privacy Policy</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Section 6 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(6)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            6. Prohibited Activities
          </h2>
          <span className="text-blue-500">
            {expandedSection === 6 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 6 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              Users may not upload or publish content that:
            </p>
            <ul className="mb-2 list-disc pl-6">
              <li>Is illegal or violates the rights of others.</li>
              <li>Contains false or misleading information.</li>
              <li>
                Harasses, defames, or portrays others in an offensive manner.
              </li>
              <li>Promotes political or religious extremism.</li>
              <li>
                Includes advertisements, promotions, or commercial content
                (unless authorized by the website operators).
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 7 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(7)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            7. Jurisdiction and Dispute Resolution
          </h2>
          <span className="text-blue-500">
            {expandedSection === 7 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 7 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              7.1. These Terms of Use are subject to the applicable laws of{" "}
              <strong>Hungary, Romania, Serbia, and the European Union</strong>.
            </p>
            <p className="mb-2">
              7.2. In case of disputes, the parties will first attempt to
              resolve them amicably. If no resolution is reached, legal
              proceedings will be conducted in the court of the website
              operator's registered location.
            </p>
          </div>
        )}
      </div>

      {/* Section 8 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(8)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            8. Modifications and Validity
          </h2>
          <span className="text-blue-500">
            {expandedSection === 8 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 8 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              8.1. The operators reserve the right to modify the{" "}
              <strong>Terms of Use</strong> at any time.
            </p>
            <p className="mb-2">
              8.2. Changes take effect once published on the website.
            </p>
            <p className="mb-2">
              8.3. Continued use of the website signifies acceptance of the
              modified terms.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Contact</h2>
        <p className="text-gray-700">
          If you have any questions regarding the <strong>Terms of Use</strong>,
          contact the website operators at:
        </p>
        <p className="mt-2 font-medium">
          📧 Email:{" "}
          <a
            href="mailto:politikaidemografia.mail@gmail.com"
            className="text-blue-600 hover:underline"
          >
            politikaidemografia.mail@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default EnglishTerms;
