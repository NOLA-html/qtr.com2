import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CartProvider } from './context/CartContext.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { RepairsPage } from './pages/RepairsPage.tsx';
import { UpgradesPage } from './pages/UpgradesPage.tsx';
import { DesktopPcsPage } from './pages/DesktopPcsPage.tsx';
import { BuilderPage } from './pages/BuilderPage.tsx';
import { ComponentsPage } from './pages/ComponentsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { HowItWorksPage } from './pages/HowItWorksPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { TrackPage } from './pages/TrackPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { ComputerServicePage } from './pages/ComputerServicePage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';

const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  'prebuilt-pcs': '/prebuilt-pcs',
  builder: '/builder',
  components: '/components',
  repairs: '/repairs',
  track: '/track',
  reviews: '/reviews',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  cart: '/cart',
  checkout: '/cart',
  admin: '/admin',
  calendar: '/calendar',
  upgrades: '/upgrades',
  'how-it-works': '/how-it-works',
  'computer-service': '/repairs#request'
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');

      // Support hash-based legacy routes unless hash is an in-page section anchor
      const inPageAnchorIds = [
        'request',
        'diagnostics',
        'hardware-repair',
        'upgrades',
        'os-install',
        'windows-troubleshooting',
        'migration',
        'data-recovery-assessment',
        'assembly',
        'gaming-troubleshooting',
        'reviews'
      ];

      const effectiveRoute =
        hash && !inPageAnchorIds.includes(hash) ? hash : pathname;

      if (!effectiveRoute || effectiveRoute === 'home') {
        setCurrentPage('home');
        setPageParams({});
      } else if (effectiveRoute.startsWith('prebuilt-pcs/')) {
        const slug = effectiveRoute.replace('prebuilt-pcs/', '').trim();
        setCurrentPage('prebuilt-detail');
        setPageParams({ slug });
      } else if (effectiveRoute === 'prebuilt-pcs' || effectiveRoute === 'desktop-pcs' || effectiveRoute === 'custom-pc') {
        setCurrentPage('prebuilt-pcs');
        setPageParams({});
      } else if (effectiveRoute === 'builder' || effectiveRoute === 'pc-builder') {
        setCurrentPage('builder');
        setPageParams({});
      } else if (effectiveRoute.startsWith('components/')) {
        const id = effectiveRoute.replace('components/', '').trim();
        setCurrentPage('component-detail');
        setPageParams({ id });
      } else if (effectiveRoute === 'components') {
        setCurrentPage('components');
        setPageParams({});
      } else if (effectiveRoute === 'repairs' || effectiveRoute === 'services' || effectiveRoute === 'computer-service' || effectiveRoute === 'request') {
        setCurrentPage('repairs');
        if (hash && inPageAnchorIds.includes(hash)) {
          setPageParams({ scrollTo: hash });
        } else {
          setPageParams({});
        }
      } else if (effectiveRoute === 'cart' || effectiveRoute === 'checkout') {
        setCurrentPage('cart');
        setPageParams({});
      } else if (effectiveRoute === 'calendar' || effectiveRoute === 'bookings' || effectiveRoute === 'schedule') {
        setCurrentPage('calendar');
        setPageParams({});
      } else if (effectiveRoute === 'upgrades') {
        setCurrentPage('upgrades');
        setPageParams({});
      } else if (effectiveRoute === 'how-it-works') {
        setCurrentPage('how-it-works');
        setPageParams({});
      } else if (effectiveRoute === 'reviews') {
        setCurrentPage('reviews');
        setPageParams({});
      } else if (effectiveRoute === 'about') {
        setCurrentPage('about');
        setPageParams({});
      } else if (effectiveRoute === 'privacy') {
        setCurrentPage('privacy');
        setPageParams({});
      } else if (effectiveRoute === 'contact') {
        setCurrentPage('contact');
        setPageParams({});
      } else if (effectiveRoute === 'track') {
        setCurrentPage('track');
        setPageParams({});
      } else if (effectiveRoute === 'admin') {
        setCurrentPage('admin');
        setPageParams({});
      } else {
        setCurrentPage('home');
        setPageParams({});
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (page: string, params: Record<string, string> = {}) => {
    let targetPage = page;
    let url = PAGE_TO_PATH[page] || '/';

    if (page === 'prebuilt-detail' && params.slug) {
      url = `/prebuilt-pcs/${params.slug}`;
    } else if (page === 'component-detail' && params.id) {
      url = `/components/${params.id}`;
    } else if (page === 'desktop-pcs') {
      if (params.tab === 'builder') {
        targetPage = 'builder';
        url = '/builder';
      } else {
        targetPage = 'prebuilt-pcs';
        url = '/prebuilt-pcs';
      }
    } else if (page === 'checkout') {
      targetPage = 'cart';
      url = '/cart';
    } else if (page === 'computer-service') {
      targetPage = 'repairs';
      url = '/repairs#request';
    } else if (params.scrollTo) {
      url = `${url}#${params.scrollTo}`;
    }

    setCurrentPage(targetPage);
    setPageParams(params);
    window.history.pushState(null, '', url);

    if (params.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(params.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white text-navy">
        <Navbar currentPage={currentPage} onNavigate={navigate} />

        <CartDrawer
          onNavigateToCheckout={() => navigate('cart')}
          onNavigateToCatalogue={() => navigate('prebuilt-pcs')}
        />

        <main className="flex-1">
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}

          {(currentPage === 'prebuilt-pcs' || currentPage === 'prebuilt-detail') && (
            <DesktopPcsPage
              selectedSlug={currentPage === 'prebuilt-detail' ? pageParams.slug : undefined}
              onNavigate={navigate}
              onNavigateToCheckout={() => navigate('cart')}
            />
          )}

          {currentPage === 'builder' && (
            <BuilderPage
              onNavigate={navigate}
              onNavigateToCheckout={() => navigate('cart')}
            />
          )}

          {(currentPage === 'components' || currentPage === 'component-detail') && (
            <ComponentsPage
              selectedId={currentPage === 'component-detail' ? pageParams.id : undefined}
              onNavigate={navigate}
            />
          )}

          {currentPage === 'repairs' && (
            <RepairsPage
              scrollToId={pageParams.scrollTo}
              initialCategory={pageParams.category}
              onNavigate={navigate}
              onNavigateToTrack={(code) => navigate('track', { code })}
            />
          )}

          {currentPage === 'upgrades' && (
            <UpgradesPage
              onStartUpgradeEnquiry={() => navigate('repairs', { scrollTo: 'request', category: 'RAM and SSD upgrades' })}
              onNavigateToRepairs={() => navigate('repairs')}
            />
          )}

          {currentPage === 'cart' && (
            <CheckoutPage
              onNavigate={navigate}
              onNavigateToCatalogue={() => navigate('prebuilt-pcs')}
              onNavigateToTrack={(code) => navigate('track', { code })}
            />
          )}

          {currentPage === 'how-it-works' && (
            <HowItWorksPage onNavigateToRequest={() => navigate('repairs', { scrollTo: 'request' })} />
          )}

          {currentPage === 'reviews' && <ReviewsPage />}

          {currentPage === 'about' && <AboutPage onNavigate={navigate} />}

          {currentPage === 'privacy' && <PrivacyPage onNavigate={navigate} />}

          {currentPage === 'calendar' && (
            <CalendarPage
              onNavigateToServices={() => navigate('repairs', { scrollTo: 'request' })}
              onNavigateToCustomPcs={() => navigate('prebuilt-pcs')}
            />
          )}

          {currentPage === 'track' && (
            <TrackPage initialCode={pageParams.code || ''} onNavigate={navigate} />
          )}

          {currentPage === 'contact' && <ContactPage onNavigate={navigate} />}

          {currentPage === 'computer-service' && (
            <ComputerServicePage
              initialTab={pageParams.tab === 'upgrade' ? 'upgrade' : 'repair'}
              initialCategory={pageParams.category}
              initialDeviceType={pageParams.deviceType}
              initialSpeed={(pageParams.speed as 'Regular' | 'Express') || 'Regular'}
              onNavigateToTrack={(code) => navigate('track', { code })}
            />
          )}

          {currentPage === 'admin' && <AdminPage />}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </CartProvider>
  );
}
