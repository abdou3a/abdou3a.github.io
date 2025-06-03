import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';

// Lazy loading des pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Portfolio = lazy(() => import('./pages/Portfolio'));

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0a0a0a 0%, #1e3c72 50%, #2a5298 100%);
    color: white;
    overflow-x: hidden;
    min-height: 100vh;
  }

  html {
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.7);
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  position: relative;
`;

// Theme
const theme = {
  colors: {
    primary: '#ffd700',
    secondary: '#00ff88',
    accent: '#ff4757',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1e3c72 50%, #2a5298 100%)',
    text: '#ffffff',
    textSecondary: '#b8b8b8'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

// Page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: '100vw',
    scale: 1.2
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.8
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ErrorBoundary>
        <Router>
          <AppContainer>
            <Navigation />
            <AnimatePresence mode="wait">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PageContainer
                      key="home"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <Home />
                      </Suspense>
                    </PageContainer>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PageContainer
                      key="about"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <About />
                      </Suspense>
                    </PageContainer>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <PageContainer
                      key="services"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <Services />
                      </Suspense>
                    </PageContainer>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <PageContainer
                      key="portfolio"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <Portfolio />
                      </Suspense>
                    </PageContainer>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PageContainer
                      key="contact"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <Contact />
                      </Suspense>
                    </PageContainer>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </AppContainer>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
