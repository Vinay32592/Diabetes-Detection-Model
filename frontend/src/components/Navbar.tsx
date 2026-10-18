import { Activity } from 'lucide-react'
import type { PageId } from '../types'

interface NavItem { id: PageId; label: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'home',         label: 'Home' },
  { id: 'predict',      label: 'Predict' },
  { id: 'models',       label: 'ML Insights' },
  { id: 'history',      label: 'History' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'about',        label: 'About' },
]

interface NavbarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button
          type="button"
          className="brand"
          onClick={() => onNavigate('home')}
          aria-label="Go to home"
        >
          <Activity size={22} aria-hidden="true" />
          <span>Diabetes Risk Check</span>
        </button>

        <nav aria-label="Main navigation">
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={currentPage === item.id ? 'nav-link active' : 'nav-link'}
                  onClick={() => onNavigate(item.id)}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
