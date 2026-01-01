import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },
  {
    title: 'Powered by React',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

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

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Enterprise-grade middleware for P2P, P2M, IBFT, Billing, and Title Fetch integrations"
    >
      <HomepageHeader />
      <HomepageFeatures />
    </Layout>
  );
}
