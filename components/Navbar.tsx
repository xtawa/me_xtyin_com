import React from 'react';
import { Github, Rss, Moon } from 'lucide-react';
import logo from '../logo.svg';

const NavItem = ({ 
  children, 
  href, 
  hideOnMobile = false, 
  onClick 
}: { 
  children?: React.ReactNode, 
  href: string, 
  hideOnMobile?: boolean,
  onClick?: (e: React.MouseEvent) => void 
}) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`
      text-neutral-400 hover:text-white transition-colors duration-200
      ${hideOnMobile ? 'hidden sm:block' : 'block'}
    `}
  >
    {children}
  </a>
);

interface NavbarProps {
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const handleNavClick = (view: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(view);
  };

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center bg-gradient-to-b from-[#050505] to-transparent pointer-events-none">
      {/* Logo Area */}
      <div className="pointer-events-auto">
        <a 
          href="#" 
          onClick={handleNavClick('home')}
          className="block w-8 h-8 opacity-90 hover:opacity-100 transition-opacity"
        >
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-5 md:gap-6 text-sm font-medium pointer-events-auto">
        <NavItem href="#blog" onClick={handleNavClick('blog')}>Blog</NavItem>
        <NavItem href="#photos" hideOnMobile onClick={handleNavClick('photos')}>Photos</NavItem>

        <div className="w-[1px] h-4 bg-neutral-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-4 text-neutral-400">
           <a href="https://github.com/xtawa" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github size={18} />
           </a>
           <a href="#" className="hover:text-white transition-colors hidden sm:block">
              <Rss size={18} />
           </a>
           <button className="hover:text-white transition-colors">
              <Moon size={18} />
           </button>
        </div>
      </nav>
    </header>
  );
};