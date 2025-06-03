import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1e3c72 50%, #2a5298 100%);
  color: white;
  padding: 2rem;
`;

const ErrorTitle = styled.h1`
  font-size: 3rem;
  color: #ff4757;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  color: #b8b8b8;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const RetryButton = styled.button`
  padding: 1rem 2rem;
  background: #ffd700;
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ffed4a;
    transform: translateY(-2px);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Oups ! Une erreur s'est produite</ErrorTitle>
          <ErrorMessage>
            Une erreur inattendue s'est produite. Veuillez rafraîchir la page ou réessayer plus tard.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Rafraîchir la page
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
