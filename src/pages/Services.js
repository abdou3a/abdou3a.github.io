import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ServicesContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #00d4ff;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ServiceCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  cursor: pointer;

  h3 {
    color: #00d4ff;
    margin-bottom: 1rem;
  }

  p {
    color: #b8b8b8;
    line-height: 1.6;
  }
`;

const Services = () => {
  const services = [
    {
      title: 'Conseil juridique en cybersécurité',
      description: 'Protégez vos données et respectez les réglementations.'
    },
    {
      title: 'Solutions technologiques',
      description: 'Vente de logiciels et matériels pour sécuriser vos systèmes.'
    },
    {
      title: 'Formation en cybersécurité',
      description: 'Apprenez les meilleures pratiques pour protéger vos actifs numériques.'
    }
  ];

  return (
    <ServicesContainer>
      <Title>Mes Services</Title>
      <ServicesGrid>
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </ServiceCard>
        ))}
      </ServicesGrid>
    </ServicesContainer>
  );
};

export default Services;
