import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.futuristicHeader}>
      {/* Background animation layer */}
      <div className={styles.backgroundAnimation} />

      <div className={styles.headerContent}>
        <img
          src={useBaseUrl('/img/OpenConnect.png')}
          alt="OpenConnect"
          className={styles.headerImage}
        />

        <Heading as="h1" className={styles.mainTitle}>
          OpenConnect
        </Heading>

        <p className={styles.subtitle}>
          Enterprise Integration Middleware for Real-Time Payments
        </p>

        <div className={styles.ctaContainer}>
          <Link className={styles.ctaButton} to="/introduction">
            Get Started
          </Link>

          <Link
            className={styles.ctaButtonSecondary}
            to="/api-specifications"
          >
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Enterprise-grade middleware for P2P, P2M, IBFT, Billing, and Title Fetch integrations"
    >
      <HomepageHeader />
    </Layout>
  );
}
