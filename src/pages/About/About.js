import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

// Components
import SkillProgressBar from '../../components/SkillProgressBar/SkillProgressBar';
import TimelineItem from '../../components/TimelineItem/TimelineItem';
import StatCard from '../../components/StatCard/StatCard';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
`;

const HeroSection = styled(motion.section)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80vh;
  margin-bottom: 5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  padding-right: 2rem;
  
  @media (max-width: 768px) {
    padding-right: 0;
    margin-bottom: 2rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  background: linear-gradient(45deg, #00d4ff, #ff6b6b, #ffd93d);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: #b8b8b8;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Description = styled(motion.div)`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #e0e0e0;
  margin-bottom: 3rem;
  
  p {
    margin-bottom: 1rem;
  }
`;

const ThreeContainer = styled.div`
  flex: 1;
  height: 500px;
  max-width: 500px;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 5rem 0;
`;

const SkillsSection = styled(motion.section)`
  margin: 5rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #00d4ff;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TimelineSection = styled(motion.section)`
  margin: 5rem 0;
`;

const Timeline = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #00d4ff, #ff6b6b);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    &::before {
      left: 20px;
    }
  }
`;

const PersonalitySection = styled(motion.section)`
  margin: 5rem 0;
  text-align: center;
`;

const PersonalityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const PersonalityCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    color: #00d4ff;
    margin-bottom: 1rem;
  }
  
  p {
    color: #b8b8b8;
    line-height: 1.6;
  }
`;

// 3D Scene Component
const AnimatedSphere = () => {
  return (
    <Sphere visible args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#00d4ff"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.2}
      />
    </Sphere>
  );
};

const About = () => {
  const [activeSkill, setActiveSkill] = useState(null);
  const controls = useAnimation();

  const skills = [
    { name: 'Solidity', level: 95, category: 'Blockchain' },
    { name: 'React.js', level: 90, category: 'Frontend' },
    { name: 'Node.js', level: 85, category: 'Backend' },
    { name: 'Web3.js', level: 92, category: 'Blockchain' },
    { name: 'Python', level: 88, category: 'Backend' },
    { name: 'Smart Contracts', level: 94, category: 'Blockchain' },
    { name: 'DeFi Protocols', level: 89, category: 'DeFi' },
    { name: 'IPFS', level: 82, category: 'Blockchain' }
  ];

  const timeline = [
    {
      year: '2024',
      title: 'Senior Blockchain Developer',
      company: 'DeFi Protocol Inc.',
      description: 'Leading development of next-generation DeFi protocols with $100M+ TVL.',
      technologies: ['Solidity', 'Hardhat', 'React', 'Web3.js']
    },
    {
      year: '2023',
      title: 'Full Stack Web3 Developer',
      company: 'Crypto Startup',
      description: 'Built NFT marketplace and DEX from scratch, handling 10K+ daily transactions.',
      technologies: ['Ethereum', 'IPFS', 'Next.js', 'GraphQL']
    },
    {
      year: '2022',
      title: 'Blockchain Engineer',
      company: 'Tech Consultancy',
      description: 'Developed custom blockchain solutions for enterprise clients.',
      technologies: ['Solidity', 'Truffle', 'OpenZeppelin', 'React']
    },
    {
      year: '2021',
      title: 'Web Developer',
      company: 'Digital Agency',
      description: 'Started journey in Web3, building traditional web apps and learning blockchain.',
      technologies: ['JavaScript', 'React', 'Node.js', 'MongoDB']
    }
  ];

  const stats = [
    { number: '50+', label: 'Smart Contracts Deployed', icon: '📋' },
    { number: '$5M+', label: 'Total Value Locked', icon: '💰' },
    { number: '15K+', label: 'Active Users', icon: '👥' },
    { number: '99.9%', label: 'Uptime', icon: '⚡' }
  ];

  const personality = [
    {
      title: 'Innovation Driven',
      description: 'Always exploring cutting-edge technologies and pushing the boundaries of what\'s possible in Web3.'
    },
    {
      title: 'Security Focused',
      description: 'Prioritizing security in every line of code, understanding the critical nature of blockchain applications.'
    },
    {
      title: 'Community Builder',
      description: 'Active in the Web3 community, contributing to open-source projects and mentoring newcomers.'
    },
    {
      title: 'Continuous Learner',
      description: 'The blockchain space evolves rapidly, and I stay ahead by constantly learning and adapting.'
    }
  ];

  useEffect(() => {
    controls.start('visible');
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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

  return (
    <AboutContainer>
      <HeroSection
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <ContentSection>
          <Title variants={itemVariants}>
            About Me
          </Title>
          <Subtitle variants={itemVariants}>
            Blockchain Architect & Web3 Innovator
          </Subtitle>
          <Description variants={itemVariants}>
            <p>
              I'm a passionate blockchain developer with over 4 years of experience in building 
              decentralized applications that shape the future of finance and digital ownership.
            </p>
            <p>
              My journey started with traditional web development, but I quickly fell in love with 
              the revolutionary potential of blockchain technology. Since then, I've dedicated myself 
              to mastering smart contract development, DeFi protocols, and creating seamless Web3 experiences.
            </p>
            <p>
              When I'm not coding, you'll find me researching the latest DeFi innovations, contributing 
              to open-source projects, or explaining blockchain concepts to anyone willing to listen.
            </p>
          </Description>
        </ContentSection>

        <ThreeContainer>
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </ThreeContainer>
      </HeroSection>

      <StatsGrid variants={containerVariants} initial="hidden" animate="visible">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            number={stat.number}
            label={stat.label}
            icon={stat.icon}
            variants={itemVariants}
          />
        ))}
      </StatsGrid>

      <SkillsSection variants={containerVariants} initial="hidden" animate="visible">
        <SectionTitle>Technical Expertise</SectionTitle>
        <SkillsGrid>
          {skills.map((skill, index) => (
            <SkillProgressBar
              key={index}
              skill={skill}
              isActive={activeSkill === index}
              onHover={() => setActiveSkill(index)}
              onLeave={() => setActiveSkill(null)}
              delay={index * 0.1}
            />
          ))}
        </SkillsGrid>
      </SkillsSection>

      <TimelineSection variants={containerVariants} initial="hidden" animate="visible">
        <SectionTitle>Professional Journey</SectionTitle>
        <Timeline>
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              item={item}
              index={index}
              variants={itemVariants}
            />
          ))}
        </Timeline>
      </TimelineSection>

      <PersonalitySection variants={containerVariants} initial="hidden" animate="visible">
        <SectionTitle>What Drives Me</SectionTitle>
        <PersonalityGrid>
          {personality.map((trait, index) => (
            <PersonalityCard
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{trait.title}</h3>
              <p>{trait.description}</p>
            </PersonalityCard>
          ))}
        </PersonalityGrid>
      </PersonalitySection>
    </AboutContainer>
  );
};

export default About;
