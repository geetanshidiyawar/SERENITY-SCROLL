import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: ActiveTab; label: string; emoji: string; ariaLabel: string }[] = [
    { id: 'mood', label: 'Mood', emoji: '🙂', ariaLabel: 'View Mood Check-in and 7-day history' },
    { id: 'water', label: 'Water', emoji: '🥛', ariaLabel: 'View Daily Water Hydration' },
    { id: 'helpline', label: 'Helpline', emoji: '☎', ariaLabel: 'View Helpline' },
  ];

  return (
    <>
      {/* Desktop / Tablet Vertical Sidebar */}
      <aside
        id="serenity-sidebar"
        aria-label="Sidebar navigation"
        className="hidden md:flex flex-col justify-center items-center w-24 lg:w-28 py-8 border-r border-[#E0E7E1]/80 bg-[#F7F5EF]/60 backdrop-blur-md shrink-0 h-screen sticky top-0 select-none z-20"
      >
        <div className="flex flex-col items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => onSelectTab(isActive ? 'home' : item.id)}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex flex-col items-center justify-center w-16 h-18 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6B56] ${
                  isActive
                    ? 'bg-[#E3ECE5] text-[#24352A] shadow-xs'
                    : 'text-[#5C6E62] hover:bg-[#EEF3EF] hover:text-[#233529]'
                }`}
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                  {item.emoji}
                </span>
                <span className={`text-xs mt-1.5 font-medium tracking-wide ${isActive ? 'text-[#233529] font-semibold' : 'text-[#64766A]'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 mt-1 rounded-full bg-[#4E6B56]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Gentle return to home button if subpanel is open */}
        {activeTab !== 'home' && (
          <div className="absolute bottom-8 flex flex-col items-center">
            <button
              id="sidebar-back-to-serenity"
              onClick={() => onSelectTab('home')}
              className="text-[11px] text-[#6A7E71] hover:text-[#2E4234] underline underline-offset-4 decoration-[#B8C8BC] transition-colors py-1 px-2 whitespace-nowrap"
              title="Return to Serenity"
            >
              ← Back to Serenity
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="serenity-mobile-nav"
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F7F5EF]/95 backdrop-blur-lg border-t border-[#DFE7E0] py-2 px-6 flex justify-around items-center"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => onSelectTab(isActive ? 'home' : item.id)}
              aria-label={item.ariaLabel}
              className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-[#233529] font-semibold bg-[#E4ECE6]'
                  : 'text-[#627468] hover:text-[#233529]'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[11px] mt-0.5 tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
