import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(45deg, #00d4ff, #ff6b6b, #ffd93d);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #b8b8b8;
  margin-bottom: 2rem;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 50vh;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Title>Bienvenue dans mon monde</Title>
      <Subtitle>Avocat en cybersécurité et vendeur</Subtitle>
      <CanvasContainer>
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sphere visible args={[1, 100, 200]} scale={2}>
            <MeshDistortMaterial
              color="#00d4ff"
              attach="material"
              distort={0.3}
              speed={1.5}
              roughness={0.2}
            />
          </Sphere>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </CanvasContainer>
    </HomeContainer>
  );
};

export default Home;
