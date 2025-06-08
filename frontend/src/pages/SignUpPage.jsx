import { Card, Container } from 'react-bootstrap';
import SignUpForm from '../components/auth/SignUpForm';

const SignUpPage = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <SignUpForm />
      </Card>
    </Container>
  );
};

export default SignUpPage;