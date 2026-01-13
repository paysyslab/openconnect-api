// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenConnect',
  tagline: 'Enterprise Integration Middleware enabling secure, scalable, and real-time payment orchestration across banks, schemes, and digital channels',
  favicon: 'img/favicon.png',

  // GitHub Pages config (repo: paysys/openconnect-api)
  url: 'https://paysys.github.io',
  baseUrl: '/openconnect-api/',
  organizationName: 'paysys',
  projectName: 'openconnect-api',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',

          // Docs as homepage
          routeBasePath: '/', // Keep the homepage as the docs section
          editUrl: 'https://github.com/paysys/openconnect-api/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    [
      '@scalar/docusaurus',
      {
        id: 'openconnect',
        label: 'API Specifications',
        route: '/api-specifications',
        showNavLink: false,
        configuration: {
          // Make sure this file exists at: static/openapi/openconnect-api.yaml
          url: 'openapi/OC-api.yml',

          layout: 'modern',
          theme: 'default',
          darkMode: true,
          defaultOpenAllTags: false,

          hideModels: false,
          hideTestRequestButton: false,
          hideSearch: false,
          hideDarkModeToggle: false,

          // Branding
          hideLogo: false,
          branding: {
            title: 'OpenConnect API',
            logo: '/img/PaysysLogo.png',
            favicon: '/img/favicon.png',
          },
        },
      },
    ],
  ],

  themeConfig: {
    // Add/replace this image file under static/img/
    image: 'img/OpenConnect.png',

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      logo: {
        alt: 'Paysys Labs Logo',
        src: 'img/PaysysLogo.png',
        href: '/',
      },
      items: [
        { to: '/', label: 'Overview', position: 'left' },
        // { to: '/introduction', label: 'Introduction', position: 'left' },
        // { to: '/backoffice', label: 'Back Office', position: 'left' },
        { to: '/api-specifications', label: 'API Specification', position: 'left' },
        { to: '/backoffice', label: 'Back Office', position: 'left' },
        { href: 'https://github.com/paysys/openconnect-api', label: 'GitHub', position: 'right' },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Introduction', to: '/introduction' },
            { label: 'API Specification', to: '/api-specifications' },
            { label: 'Back Office', to: '/backoffice' },
          ],
        },
        {
          title: 'API',
          items: [
            { label: 'API Reference (OpenAPI)', to: '/api-specifications' },
          ],
        },
        {
          title: 'Legal',
          items: [
            { label: 'Privacy Policy', href: 'https://paysyslabs.com/privacy' },
            { label: 'Terms of Service', href: 'https://paysyslabs.com/terms' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Paysys Labs. All rights reserved.`,
    },

    prism: {
      theme: prismThemes.nightOwl,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
