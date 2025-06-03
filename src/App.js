import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// Context
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/Navbar/Navbar';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import ParticleBackground from './components/ParticleBackground/ParticleBackground';

// Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Skills from './pages/Skills/Skills';
import Projects from './pages/Projects/Projects';
import NFTGallery from './pages/NFTGallery/NFTGallery';
import DeFiDashboard from './pages/DeFiDashboard/DeFiDashboard';
import Contact from './pages/Contact/Contact';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Blog from './pages/Blog/Blog';
import Analytics from './pages/Analytics/Analytics';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    overflow-x: hidden;
    transition: all 0.3s ease;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.scrollbarTrack};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.scrollbarThumb};
    border-radius: 4px;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const PageContainer = styled(motion.div)`
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  position: relative;
  z-index: 2;
`;

// Page transition variants
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <CustomThemeProvider>
      <Web3Provider>
        <ThemeProvider theme={{
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)',
          text: '#ffffff',
          primary: '#00d4ff',
          secondary: '#ff6b6b',
          accent: '#ffd93d',
          cardBg: 'rgba(255, 255, 255, 0.05)',
          scrollbarTrack: 'rgba(255, 255, 255, 0.1)',
          scrollbarThumb: 'rgba(0, 212, 255, 0.5)'
        }}>
          <GlobalStyle />
          <Router>
            <AppContainer>
              <ParticleBackground />
              <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
              
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
                        <Home />
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
                        <About />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/skills" 
                    element={
                      <PageContainer
                        key="skills"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Skills />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/projects" 
                    element={
                      <PageContainer
                        key="projects"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Projects />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/projects/:id" 
                    element={
                      <PageContainer
                        key="project-detail"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <ProjectDetail />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/nft" 
                    element={
                      <PageContainer
                        key="nft"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <NFTGallery />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/defi" 
                    element={
                      <PageContainer
                        key="defi"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <DeFiDashboard />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/blog" 
                    element={
                      <PageContainer
                        key="blog"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Blog />
                      </PageContainer>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <PageContainer
                        key="analytics"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Analytics />
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
                        <Contact />
                      </PageContainer>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </AppContainer>
          </Router>
        </ThemeProvider>
      </Web3Provider>
    </CustomThemeProvider>
  );
}

export default App;
