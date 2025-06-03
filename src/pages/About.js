import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation, useInView } from 'framer-motion';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0a0a 0%, #1e3c72 50%, #2a5298 100%);
  position: relative;
  overflow: hidden;
`;

const BackgroundElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  color: ${props => props.color || '#ffd700'};
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled(motion.section)`
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffd700, #00ff88, #ff4757);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: #b8b8b8;
  margin-bottom: 2rem;
  font-weight: 300;
`;

const Description = styled(motion.div)`
  font-size: 1.2rem;
  color: #e0e0e0;
  line-height: 1.8;
  text-align: left;
  max-width: 800px;
  margin: 0 auto 3rem;
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const ExpertiseGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const ExpertiseCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${props => props.accentColor || '#ffd700'};
    transform: translateY(-5px);
  }
  
  .icon {
    font-size: 3rem;
    color: ${props => props.accentColor || '#ffd700'};
    margin-bottom: 1rem;
    display: block;
  }
  
  h3 {
    color: ${props => props.accentColor || '#ffd700'};
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    color: #b8b8b8;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  ul {
    color: #d0d0d0;
    padding-left: 1rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const StatsSection = styled(motion.section)`
  margin: 4rem 0;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .number {
    font-size: 3rem;
    font-weight: 800;
    color: ${props => props.color || '#ffd700'};
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: #b8b8b8;
    font-size: 1rem;
  }
`;

const CertificationsSection = styled(motion.section)`
  margin: 4rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #ffd700;
`;

const CertificationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const CertificationItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid ${props => props.color || '#ffd700'};
  
  .cert-name {
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  
  .cert-org {
    color: ${props => props.color || '#ffd700'};
    font-size: 0.9rem;
  }
`;

const About = () => {
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setMounted(true);
    controls.start('visible');
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const expertiseAreas = [
    {
      icon: '⚖️',
      title: 'Droit de la Cybersécurité',
      accentColor: '#ffd700',
      description: 'Expertise juridique complète en matière de protection des données et conformité réglementaire.',
      skills: [
        'RGPD et protection des données',
        'Contrats technologiques',
        'Conformité cybersécurité',
        'Audit juridique digital'
      ]
    },
    {
      icon: '🔒',
      title: 'Solutions Technologiques',
      accentColor: '#00ff88',
      description: 'Vente et conseil en solutions de sécurité informatique pour entreprises.',
      skills: [
        'Firewalls et protection réseau',
        'Solutions antivirus entreprise',
        'Authentification multi-facteurs',
        'Monitoring de sécurité'
      ]
    },
    {
      icon: '🛡️',
      title: 'Conseil en Sécurité',
      accentColor: '#ff4757',
      description: 'Accompagnement stratégique pour renforcer la posture de sécurité.',
      skills: [
        'Analyse de risques',
        'Plans de réponse aux incidents',
        'Formation sensibilisation',
        'Gouvernance sécurité'
      ]
    }
  ];

  const stats = [
    { number: '200+', label: 'Clients Accompagnés', color: '#ffd700' },
    { number: '15+', label: 'Années d\'Expérience', color: '#00ff88' },
    { number: '99%', label: 'Taux de Satisfaction', color: '#ff4757' },
    { number: '50+', label: 'Certifications Délivrées', color: '#00d4ff' }
  ];

  const certifications = [
    { name: 'Maîtrise en Droit Numérique', org: 'Université Paris-Saclay', color: '#ffd700' },
    { name: 'CISSP - Certified Information Systems Security Professional', org: 'ISC²', color: '#00ff88' },
    { name: 'CISA - Certified Information Systems Auditor', org: 'ISACA', color: '#ff4757' },
    { name: 'DPO Certifié RGPD', org: 'AFCDP', color: '#00d4ff' }
  ];

  const floatingIcons = [
    { icon: '⚖️', top: '10%', left: '5%', color: '#ffd700' },
    { icon: '🔒', top: '20%', right: '10%', color: '#00ff88' },
    { icon: '🛡️', bottom: '30%', left: '8%', color: '#ff4757' },
    { icon: '🔐', top: '60%', right: '5%', color: '#00d4ff' },
    { icon: '📊', bottom: '10%', right: '15%', color: '#ffd700' }
  ];

  if (!mounted) {
    return <div>Chargement...</div>;
  }

  return (
    <AboutContainer>
      <BackgroundElements>
        {floatingIcons.map((item, index) => (
          <FloatingIcon
            key={index}
            color={item.color}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-5, 5, -5]
            }}
            transition={{
              duration: 6 + index,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {item.icon}
          </FloatingIcon>
        ))}
      </BackgroundElements>

      <ContentWrapper>
        <HeroSection
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <Title variants={itemVariants}>
            À propos de moi
          </Title>
          <Subtitle variants={itemVariants}>
            Avocat en Cybersécurité • Expert en Solutions Technologiques
          </Subtitle>
          <Description variants={itemVariants}>
            <p>
              Fort de plus de 15 années d'expérience, je suis un avocat spécialisé en droit de la cybersécurité 
              et un expert en solutions technologiques. Ma double compétence juridique et technique me permet 
              d'accompagner les entreprises dans leur transformation numérique sécurisée.
            </p>
            <p>
              Mon expertise couvre l'ensemble des enjeux de la cybersécurité : conformité RGPD, contrats 
              technologiques, audit de sécurité, et mise en place de solutions de protection avancées. 
              Je conseille aussi bien les startups que les grandes entreprises dans leurs projets digitaux.
            </p>
            <p>
              En parallèle de mon activité juridique, je développe des partenariats avec les meilleurs 
              éditeurs de solutions de cybersécurité pour proposer des technologies de pointe adaptées 
              aux besoins spécifiques de chaque organisation.
            </p>
          </Description>
        </HeroSection>

        <ExpertiseGrid variants={containerVariants} initial="hidden" animate="visible">
          {expertiseAreas.map((area, index) => (
            <ExpertiseCard
              key={index}
              variants={itemVariants}
              accentColor={area.accentColor}
              whileHover={{ scale: 1.02 }}
            >
              <span className="icon">{area.icon}</span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <ul>
                {area.skills.map((skill, skillIndex) => (
                  <li key={skillIndex}>{skill}</li>
                ))}
              </ul>
            </ExpertiseCard>
          ))}
        </ExpertiseGrid>

        <StatsSection variants={containerVariants} initial="hidden" animate="visible">
          <SectionTitle>Quelques Chiffres</SectionTitle>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                variants={itemVariants}
                color={stat.color}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span 
                  className="number"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  {stat.number}
                </motion.span>
                <span className="label">{stat.label}</span>
              </StatCard>
            ))}
          </StatsGrid>
        </StatsSection>

        <CertificationsSection variants={containerVariants} initial="hidden" animate="visible">
          <SectionTitle>Formations & Certifications</SectionTitle>
          <CertificationsList>
            {certifications.map((cert, index) => (
              <CertificationItem
                key={index}
                variants={itemVariants}
                color={cert.color}
                whileHover={{ x: 10 }}
              >
                <div className="cert-name">{cert.name}</div>
                <div className="cert-org">{cert.org}</div>
              </CertificationItem>
            ))}
          </CertificationsList>
        </CertificationsSection>
      </ContentWrapper>
    </AboutContainer>
  );
};

export default About;
