import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link href="/" className="logo">YTM.</Link>
          <p>The most trusted marketplace to buy and sell established YouTube channels securely.</p>
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
            <li><Link href="#" className="footer-link">Help Center</Link></li>
            <li><Link href="#" className="footer-link">Safety Tips</Link></li>
            <li><Link href="#" className="footer-link">Contact Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Legal</h3>
          <ul className="footer-links">
            <li><Link href="#" className="footer-link">Terms of Service</Link></li>
            <li><Link href="#" className="footer-link">Privacy Policy</Link></li>
            <li><Link href="#" className="footer-link">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} YT Marketplace. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="#" className="footer-link">Twitter</Link>
          <Link href="#" className="footer-link">Facebook</Link>
          <Link href="#" className="footer-link">Instagram</Link>
        </div>
      </div>
    </footer>
  );
}
