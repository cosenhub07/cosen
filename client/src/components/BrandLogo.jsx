import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * BrandLogo — logo image + animated "cosen" name
 *
 * Smart routing:
 *  - Not logged in  → /#how  (How It Works section)
 *  - Logged in      → /browse
 *
 * Props:
 *  size    — 'sm' | 'md' | 'lg'  (default: 'md')
 *  onClick — optional click handler (e.g. close mobile menu)
 */
const sizes = {
  sm: { img: 'h-7', text: 'text-lg' },
  md: { img: 'h-9', text: 'text-xl' },
  lg: { img: 'h-12', text: 'text-2xl' },
};

export default function BrandLogo({ size = 'md', onClick }) {
  const { user } = useAuthStore();
  const s = sizes[size] || sizes.md;

  // Logged-in → browse; Guest → How It Works section on the landing page
  const destination = user ? '/browse' : '/#how';

  return (
    <Link to={destination} className="brand-logo" onClick={onClick}>
      <img
        src="/logo.png"
        alt="Cosen logo"
        className={`${s.img} w-auto brand-logo-img`}
      />
      <span className={`brand-logo-name ${s.text}`}>
        cosen
      </span>
    </Link>
  );
}
