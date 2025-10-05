import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-50 bg-white/80 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold text-green-600"
        >
          KhetSetGo
        </motion.div>
        <div className="hidden md:flex gap-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1 }}
      className="text-gray-600 hover:text-green-600 font-medium"
    >
      {children}
    </motion.a>
  );
}