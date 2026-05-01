import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link href="/" className="logo">YTM.</Link>
          <p>
            Professional ecosystem for channel sourcing, buyer onboarding, and secure operational delivery.
            Built for scalable and policy-aligned growth.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">Verified Workflow</span>
            <span className="footer-badge">Hybrid Operations</span>
            <span className="footer-badge">Support Ready</span>
          </div>
        </div>
        
        <div className="footer-column">
          <h3>Marketplace</h3>
          <ul className="footer-links">
            <li><Link href="/" className="footer-link">Browse Channels</Link></li>
            <li><Link href="/admin" className="footer-link">Admin Dashboard</Link></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Support</h3>
          <ul className="footer-links">
            <li><Link href="/help-center" className="footer-link">Help Center</Link></li>
            <li><Link href="/safety-tips" className="footer-link">Safety Tips</Link></li>
            <li><Link href="/contact-us" className="footer-link">Contact Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Legal</h3>
          <ul className="footer-links">
            <li><Link href="/legal" className="footer-link">Legal</Link></li>
            <li><Link href="/terms-of-service" className="footer-link">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="footer-link">Refund Policy</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Contact</h3>
          <ul className="footer-links">
            <li><a href="mailto:ytmarketbd2020@gmail.com" className="footer-link">ytmarketbd2020@gmail.com</a></li>
            <li><a href="tel:+8801601315176" className="footer-link">+8801601315176</a></li>
            <li><Link href="/jobs" className="footer-link">Job Circular</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} YT Marketplace. All rights reserved.</p>
        <div className="footer-socials">
          <a href="https://wa.me/8801601315176" target="_blank" rel="noreferrer" className="footer-link">WhatsApp</a>
          <Link href="/contact-us" className="footer-link">Support</Link>
          <Link href="/legal" className="footer-link">Legal</Link>
        </div>
      </div>
    </footer>
  );
}
