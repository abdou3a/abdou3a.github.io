import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #00d4ff;
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: #b8b8b8;
  line-height: 1.6;
`;

const About = () => {
  return (
    <AboutContainer>
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        À propos de moi
      </Title>
      <Description
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Je suis un avocat spécialisé en cybersécurité, aidant les entreprises à protéger leurs données et à respecter les réglementations. En parallèle, je suis vendeur de solutions technologiques avancées pour sécuriser vos systèmes.
      </Description>
    </AboutContainer>
  );
};

export default About;
