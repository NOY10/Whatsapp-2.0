import { useEffect } from 'react';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import { auth, provider } from '../firebase';

function Login() {
  useEffect(() => {
    document.title = 'Login | WhatsApp Clone';
  }, []);

  const signIn = () => {
    auth.signInWithPopup(provider).catch((error) => {
      const deletedClientMessage =
        'Google sign-in is blocked because the Firebase project OAuth client was deleted. ' +
        'Create or restore the Google sign-in client in Firebase/Google Cloud, then update your Vite Firebase env values.';

      alert(error.message?.includes('deleted_client') ? deletedClientMessage : error.message);
    });
  };

  return (
    <Container>
      <LoginContainer>
        <Logo
          src="/whatsapp-logo.svg"
          alt="WhatsApp"
        />
        <Button onClick={signIn} variant="outlined">
          Sign in with Google
        </Button>
        <Hint>Continue with Google to sync your chats across devices.</Hint>
      </LoginContainer>
    </Container>
  );
}

export default Login;

const Container = styled.div`
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(37, 211, 102, 0.18), transparent 26rem),
    linear-gradient(135deg, #e6fff0, #f6f8fa 52%, #d9fdd3);
`;

const LoginContainer = styled.div`
  width: min(100%, 420px);
  padding: clamp(32px, 8vw, 72px);
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(11, 20, 26, 0.18);

  &&& button {
    width: 100%;
    border-radius: 999px;
    border-color: #25d366;
    color: #075e54;
    font-weight: 700;
    text-transform: none;
    padding: 12px 18px;
  }
`;

const Logo = styled.img`
  width: clamp(110px, 35vw, 180px);
  height: clamp(110px, 35vw, 180px);
  margin-bottom: 38px;
`;

const Hint = styled.p`
  margin: 18px 0 0;
  color: #667781;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
`;
