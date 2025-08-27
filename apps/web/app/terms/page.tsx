import styles from "./terms.module.css";

export const metadata = {
  title: "Terms of Service — <COMPANY_NAME>"
};

export default function TermsPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Terms of Service</h1>
        <p className={styles.meta}>
          Last updated: <strong>August 26, 2025</strong> • Version:{" "}
          <strong>2025-01-02</strong>
        </p>
      </header>

      <section className={styles.section}>
        <h2 id="definitions">1) Definitions</h2>
        <ul className={styles.list}>
          <li>
            <strong>Services</strong>: Company’s feature flagging platform,
            dashboard, APIs, SDKs, and related services.
          </li>
          <li>
            <strong>Customer Data</strong>: data you submit to the Services
            (flags, rules, segments, account info).
          </li>
          <li>
            <strong>Authorized Users</strong>: employees/contractors you permit
            to use the Services.
          </li>
          <li>
            <strong>Order</strong>: plan selection/checkout or signed order form
            stating plan, term, and fees.
          </li>
          <li>
            <strong>Documentation</strong>: usage guides, API docs, and policies
            we publish.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="eligibility">2) Eligibility & Account</h2>
        <p>
          You must be of legal age and capacity to accept these Terms. You are
          responsible for your Authorized Users and for keeping credentials
          secure. Provide accurate account information and keep it updated.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="use">3) Use of Services; Acceptable Use</h2>
        <p>
          Subject to these Terms and your Order, Company grants you a
          non-exclusive, non-transferable right for Authorized Users to access
          and use the Services during the Subscription Term for your internal
          business purposes.
        </p>
        <p>
          <strong>You will not:</strong>
        </p>
        <ul className={styles.list}>
          <li>
            reverse engineer or attempt to derive source of non-open components;
          </li>
          <li>circumvent security, usage limits, or rate limits;</li>
          <li>use the Services to violate law or build a competing product;</li>
          <li>expose server-side SDK keys in public code;</li>
          <li>probe/scan systems except through authorized channels.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="customer-data">4) Customer Data & Privacy</h2>
        <p>
          You retain all rights to Customer Data. You grant Company a license to
          host, process, and transmit Customer Data to provide and improve the
          Services. We process personal data per our{" "}
          <a className={styles.link} href="/legal/privacy">
            Privacy Policy
          </a>
          . You are responsible for obtaining rights and consents to submit
          Customer Data and for its accuracy.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="security">5) Security</h2>
        <p>
          We maintain safeguards designed to protect Customer Data. You are
          responsible for securing your accounts/devices and rotating SDK keys
          as appropriate. If credentials are compromised, notify us at{" "}
          <a className={styles.link} href="mailto:&lt;SECURITY_EMAIL&gt;">
            &lt;SECURITY_EMAIL&gt;
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="subscription">6) Subscription, Fees & Taxes</h2>
        <p>
          Access is subscription-based per your Order. Fees are due in advance
          and non-refundable except as stated. You authorize charges to your
          payment method and agree to applicable taxes (excluding our income
          taxes).
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="trials">7) Free Trials & Beta</h2>
        <p>
          Trials and beta features are provided “as-is,” may change or end
          without notice, and are excluded from any SLA.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="sla">8) Availability, Support & Changes</h2>
        <p>
          Unless an SLA is in your Order/Docs, Services are provided without
          uptime guarantees. We may modify features/APIs provided core
          functionality is not materially reduced during your paid term. Support
          per plan.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="ip">9) Intellectual Property; Feedback</h2>
        <p>
          Company retains all rights in the Services and Documentation. If you
          provide feedback, you grant Company a perpetual, irrevocable,
          royalty-free license to use it without restriction.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="third-party">10) Third-Party Services</h2>
        <p>
          The Services may interoperate with third-party products/services.
          Their terms govern your use of them. Enabling an integration
          authorizes us to exchange relevant data with that provider.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="compliance">11) Compliance; Export; Anti-Corruption</h2>
        <p>
          You will comply with applicable laws (including export control and
          sanctions) and will not offer or accept bribes in connection with the
          Services.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="publicity">12) Publicity</h2>
        <p>
          We may use your name/logo to identify you as a customer (site and
          marketing) per your brand guidelines. Opt-out anytime at{" "}
          <a className={styles.link} href="mailto:&lt;LEGAL_EMAIL&gt;">
            &lt;LEGAL_EMAIL&gt;
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="term">13) Term, Suspension & Termination</h2>
        <p>
          These Terms start upon acceptance and continue while you use the
          Services and/or a Subscription is active. We may suspend/terminate for
          material breach, unlawful use, or security risk. On termination, stop
          using the Services; data will be handled per our retention policy and
          law.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="warranty">14) Warranties & Disclaimers</h2>
        <p>
          We warrant professional provision of Services. OTHERWISE, SERVICES,
          SDKs, AND DOCS ARE PROVIDED “AS IS” WITHOUT WARRANTIES (INCLUDING
          MERCHANTABILITY, FITNESS, NON-INFRINGEMENT).
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="liability">15) Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY IS LIABLE FOR
          INDIRECT/SPECIAL/CONSEQUENTIAL DAMAGES OR LOST PROFITS/REVENUE/DATA.
          EXCEPT FOR YOUR PAYMENT OBLIGATIONS OR INDEMNITY, EACH PARTY’S TOTAL
          LIABILITY WILL NOT EXCEED THE AMOUNTS PAID BY YOU IN THE{" "}
          <strong>12 MONTHS</strong> BEFORE THE EVENT.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="indemnity">16) Indemnification</h2>
        <p>
          You will defend and indemnify Company against third-party claims
          arising from your unlawful use, Customer Data, or combinations of the
          Services with non-Company products to the extent caused by such
          combinations.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="changes">17) Changes to Terms</h2>
        <p>
          We may update these Terms. Material changes will be notified (email or
          in-app). Continued use after the effective date means acceptance;
          otherwise, stop using the Services.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="law">18) Governing Law & Disputes</h2>
        <p>
          Governed by <strong>&lt;GOVERNING_LAW&gt;</strong>. Courts in{" "}
          <strong>&lt;JURISDICTION/VENUE&gt;</strong> have exclusive
          jurisdiction.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="notices">19) Notices</h2>
        <p>
          Send legal notices to{" "}
          <a className={styles.link} href="mailto:&lt;LEGAL_EMAIL&gt;">
            &lt;LEGAL_EMAIL&gt;
          </a>{" "}
          and <strong>&lt;COMPANY_ADDRESS&gt;</strong>. We may send notices to
          your account email/admin contact.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="misc">20) Miscellaneous</h2>
        <ul className={styles.list}>
          <li>
            <strong>Assignment:</strong> You may not assign without our consent;
            we may assign to an affiliate or in a merger/sale.
          </li>
          <li>
            <strong>Force Majeure:</strong> No liability for delays/failures
            beyond reasonable control.
          </li>
          <li>
            <strong>Entire Agreement:</strong> These Terms + Privacy + your
            Order constitute the entire agreement.
          </li>
          <li>
            <strong>Severability/No Waiver:</strong> Unenforceable terms don’t
            affect the rest; failure to enforce isn’t a waiver.
          </li>
          <li>
            <strong>Precedence:</strong> Order → Terms → Documentation.
          </li>
        </ul>
      </section>

      <hr className={styles.divider} />

      <p className={styles.footer}>
        Questions? Contact{" "}
        <a className={styles.link} href="mailto:&lt;SUPPORT_EMAIL&gt;">
          &lt;SUPPORT_EMAIL&gt;
        </a>
        .
      </p>
    </main>
  );
}
