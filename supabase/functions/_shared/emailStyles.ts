// Shared Aderai email branding styles
export const ADERAI_LOGO_URL = 'https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png';
export const ADERAI_BRAND_COLOR = '#FF6B35';
export const ADERAI_BRAND_COLOR_LIGHT = '#FFF8F3';
export const ADERAI_BRAND_COLOR_BORDER = '#FFE8D9';

export const emailStyles = {
  main: {
    backgroundColor: '#f6f6f6',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '30px 20px',
    textAlign: 'center' as const,
    borderRadius: '10px 10px 0 0',
    borderBottom: `3px solid ${ADERAI_BRAND_COLOR}`,
  },
  logo: {
    width: '140px',
    height: 'auto',
    margin: '0 auto',
  },
  content: {
    backgroundColor: '#ffffff',
    padding: '40px 30px',
    borderRadius: '0 0 10px 10px',
  },
  h1: {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 20px',
    textAlign: 'center' as const,
  },
  text: {
    color: '#333333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  button: {
    backgroundColor: ADERAI_BRAND_COLOR,
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 40px',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    color: ADERAI_BRAND_COLOR,
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 30px',
    border: `2px solid ${ADERAI_BRAND_COLOR}`,
  },
  featureBox: {
    backgroundColor: ADERAI_BRAND_COLOR_LIGHT,
    border: `2px solid ${ADERAI_BRAND_COLOR_BORDER}`,
    borderRadius: '8px',
    padding: '20px',
    margin: '25px 0',
  },
  tipBox: {
    backgroundColor: '#E3F2FD',
    border: '2px solid #BBDEFB',
    borderRadius: '8px',
    padding: '20px',
    margin: '25px 0',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderLeft: '4px solid #FFC107',
    padding: '15px',
    margin: '20px 0',
    borderRadius: '4px',
  },
  hr: {
    borderColor: '#e5e5e5',
    margin: '30px 0',
  },
  link: {
    color: ADERAI_BRAND_COLOR,
    textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px',
  },
  footerText: {
    color: '#999999',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '5px 0',
  },
  footerSmallText: {
    color: '#bbbbbb',
    fontSize: '11px',
    lineHeight: '18px',
    margin: '5px 0',
  },
};
