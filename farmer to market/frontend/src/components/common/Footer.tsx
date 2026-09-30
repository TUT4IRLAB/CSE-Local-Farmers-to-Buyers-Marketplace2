import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-secondary-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-6">
            <div className="bg-primary-600 text-white p-1 rounded-lg">
              <span className="text-xs">FM</span>
            </div>
            <span>Farmer Market</span>
          </div>
          <p className="text-sm leading-relaxed opacity-80 mb-6">
            Connecting local farmers directly with the community. Fresh, organic, and sustainable produce for a healthier tomorrow.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href="#" className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors"><Instagram size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="/" className="hover:text-primary-400 transition-colors">Home</a></li>
            <li><a href="/products" className="hover:text-primary-400 transition-colors">Shop All</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Our Farmers</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Customer Support</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-primary-400 transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm flex items-start gap-3">
            <li className="flex gap-3">
              <MapPin size={18} className="text-primary-500 shrink-0" />
              <span>123 Farm Lane, Green Valley, AG 12345</span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-primary-500 shrink-0" />
              <span>+1 (234) 567-8901</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="text-primary-500 shrink-0" />
              <span>hello@farmmarket.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-secondary-800 text-center text-xs opacity-60">
        <p>© {new Date().getFullYear()} Farmer to Market. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
