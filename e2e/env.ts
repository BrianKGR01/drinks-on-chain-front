/**
 * Stand-in for the public URL of the Marketplace (`NEXT_PUBLIC_URL_APP`) in the builds that link
 * to it (playwright.config.ts). Never requested: the tests only read the `href` of the links.
 */
export const E2E_MARKETPLACE = "https://marketplace.e2e.test";
