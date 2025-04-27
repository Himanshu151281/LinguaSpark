import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Avatar from './Avatar';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage = 'dashboard' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setIsMenuOpen(false);
  };
  
  const isActive = (page: string) => activePage === page;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <button onClick={() => handleClick('dashboard')} className="flex items-center">
                <span className="h-8 w-8 bg-linguaspark-primary rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.22l.23.23.23-.23H16a1 1 0 110 2h-5.13l-.55.55-1.35-1.35L11.41 6H14a1 1 0 110 2h-4l.51.51a1.5 1.5 0 11-2.12 2.12L6.25 8.5a1 1 0 01-.9-.9l-1.31-1.31a1.5 1.5 0 012.12-2.12L7 5v-2a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2 text-xl font-heading font-bold text-linguaspark-dark">LinguaSpark</span>
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => handleClick('dashboard')} 
              className={`${isActive('dashboard') ? 'text-linguaspark-primary' : 'text-gray-700'} hover:text-linguaspark-primary px-3 py-2 rounded-md text-sm font-medium`}
            >
              Dashboard
            </button>
            
            <button 
              onClick={() => handleClick('lessons')} 
              className={`${isActive('lessons') ? 'text-linguaspark-primary' : 'text-gray-700'} hover:text-linguaspark-primary px-3 py-2 rounded-md text-sm font-medium`}
            >
              Lessons
            </button>
            
            <button 
              onClick={() => handleClick('practice')} 
              className={`${isActive('practice') ? 'text-linguaspark-primary' : 'text-gray-700'} hover:text-linguaspark-primary px-3 py-2 rounded-md text-sm font-medium`}
            >
              Practice
            </button>
            
            <button 
              onClick={() => {
              window.open('/games', '_blank');
              // handleClick('games'); // Still update active state and close mobile menu
              }} 
              // className={`${isActive('games') ? 'text-linguaspark-primary' : 'text-gray-700'} hover:text-linguaspark-primary px-3 py-2 rounded-md text-sm font-medium`}
            >
              Games
            </button>
            
            <button 
              onClick={() => handleClick('progress')} 
              className={`${isActive('progress') ? 'text-linguaspark-primary' : 'text-gray-700'} hover:text-linguaspark-primary px-3 py-2 rounded-md text-sm font-medium`}
            >
              Progress
            </button>
            
            {/* <div className="ml-4">
              <Avatar name="Guest User" size="sm" />
            </div> */}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-linguaspark-primary focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button 
            onClick={() => handleClick('dashboard')} 
            className={`block w-full text-left ${isActive('dashboard') ? 'text-linguaspark-primary bg-gray-50' : 'text-gray-700'} hover:text-linguaspark-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => handleClick('lessons')} 
            className={`block w-full text-left ${isActive('lessons') ? 'text-linguaspark-primary bg-gray-50' : 'text-gray-700'} hover:text-linguaspark-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium`}
          >
            Lessons
          </button>
          
          <button 
            onClick={() => handleClick('practice')} 
            className={`block w-full text-left ${isActive('practice') ? 'text-linguaspark-primary bg-gray-50' : 'text-gray-700'} hover:text-linguaspark-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium`}
          >
            Practice
          </button>
          
          <button 
            onClick={() => handleClick('games')} 
            className={`block w-full text-left ${isActive('games') ? 'text-linguaspark-primary bg-gray-50' : 'text-gray-700'} hover:text-linguaspark-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium`}
          >
            Games
          </button>
          
          <button 
            onClick={() => handleClick('progress')} 
            className={`block w-full text-left ${isActive('progress') ? 'text-linguaspark-primary bg-gray-50' : 'text-gray-700'} hover:text-linguaspark-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium`}
          >
            Progress
          </button>
          
          <div className="px-3 py-2">
            <Avatar name="Guest User" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
