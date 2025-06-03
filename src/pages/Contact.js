import React from 'react';
import styled from 'styled-components';

const ContactContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #00d4ff;
`;

const Form = styled.form`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input, textarea {
    padding: 1rem;
    border: none;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
  }

  button {
    padding: 1rem;
    border: none;
    border-radius: 5px;
    background: #00d4ff;
    color: white;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      background: #00a3cc;
    }
  }
`;

const Contact = () => {
  return (
    <ContactContainer>
      <Title>Contactez-moi</Title>
      <Form>
        <input type="text" placeholder="Votre nom" required />
        <input type="email" placeholder="Votre email" required />
        <textarea placeholder="Votre message" rows="5" required />
        <button type="submit">Envoyer</button>
      </Form>
    </ContactContainer>
  );
};

export default Contact;
