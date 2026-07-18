import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const logoImage = '/Max%20Bearings%20White%20and%20yellow%20Logo.png';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    // If it's a route path (starts with /), navigate
    // Otherwise it might be a page indentifier for onNavigate
    if (path.startsWith('/')) {
      navigate(path);
      window.scrollTo(0, 0);
    } else {
      onNavigate(path);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-[#003366] border-t-4 border-[#FF9900] text-gray-100 pt-32 pb-16">
      {/* Main Footer Content */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 pt-16">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div 
              onClick={() => handleLinkClick('/')}
              className="cursor-pointer hover:opacity-80 transition-opacity inline-block mb-2"
            >
              <img 
                src={logoImage} 
                alt="Max Bearings" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Your industrial bearing supply partner. <br>
              </br>Rolling bearings, mounted units and motion components delivered with dependable service.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/jarenegades/" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleLinkClick('/')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('about')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('blog')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Bearing Guides
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('contact')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('cart')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  My Cart
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleLinkClick('account')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  My Account
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('orders')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/returns')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/privacy')} className="hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF9900]" />
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#FF9900] shrink-0" />
                <span>Ocho Rios,<br />St. Ann,<br />Jamaica</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#FF9900] shrink-0" />
                <span>(689) 680-1264</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#FF9900] shrink-0" />
                <a href="mailto:info@maxbearingsja.com" className="hover:text-white transition-colors">info@maxbearingsja.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Max Bearings. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => handleLinkClick('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => handleLinkClick('/terms')} className="hover:text-white transition-colors">Terms & Conditions</button>
            <button onClick={() => handleLinkClick('/blog')} className="hover:text-white transition-colors">Bearing Guides</button>
            <button onClick={() => handleLinkClick('contact')} className="hover:text-white transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
