import styles from "./styles.module.css";

const SUPPORT_MAILTO =
  "mailto:support@wholesale.suneuron.com?subject=WholesaleNeuron%20Store%20Setup%20Question";

export function SupportCallout() {
  return (
    <aside className={styles.supportCard} aria-labelledby="support-heading">
      <div className={styles.supportIcon} aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </div>

      <div className={styles.supportContent}>
        <span className={styles.supportBadge}>Merchant Support &amp; Questions</span>
        <h2 id="support-heading" className={styles.supportTitle}>
          Have Questions About Your Store Setup?
        </h2>
        <p className={styles.supportBody}>
          Every B2B catalog has unique requirements. Whether you&apos;re curious
          about complex customer tag rules, multiple wholesale tiers, or
          verifying that your retail checkout stays completely isolated,
          we&apos;re here to help you verify your setup before you install.
        </p>
        <p className={styles.supportNote}>
          You can also reach out here to claim your spot in our Founding
          Merchant Cohort for lifetime free access.
        </p>
        <a className={styles.supportLink} href={SUPPORT_MAILTO}>
          Email support@wholesale.suneuron.com
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
