import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase/compat/app';
import styled from 'styled-components';
import { auth, db } from './firebase';
import ChatPage from './components/ChatPage';
import Loading from './components/Loading';
import Login from './components/Login';
import Sidebar from './components/Sidebar';

function Home() {
  useEffect(() => {
    document.title = 'WhatsApp Clone';
  }, []);

  return (
    <AppShell>
      <Sidebar />
      <WelcomePanel>
        <WelcomeCard>
          <WelcomeLogo src="/whatsapp-logo.svg" alt="WhatsApp" />
          <h1>WhatsApp Clone</h1>
          <p>Select a chat from the sidebar or start a new conversation.</p>
        </WelcomeCard>
      </WelcomePanel>
    </AppShell>
  );
}

function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    db.collection('users').doc(user.uid).set(
      {
        email: user.email,
        displayName: user.displayName,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        photoURL: user.photoURL,
      },
      { merge: true }
    );
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

const AppShell = styled.main`
  display: flex;
  width: min(1500px, 100%);
  height: 100vh;
  margin: 0 auto;
  background: white;
  box-shadow: 0 24px 80px rgba(11, 20, 26, 0.16);

  @media (max-width: 768px) {
    display: block;
    height: 100dvh;
    box-shadow: none;
  }
`;

const WelcomePanel = styled.section`
  flex: 1;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(37, 211, 102, 0.12), transparent 28rem),
    linear-gradient(135deg, #f7fbf8, #eef7f2);
  border-bottom: 6px solid #25d366;

  @media (max-width: 768px) {
    display: none;
  }
`;

const WelcomeCard = styled.div`
  max-width: 420px;
  text-align: center;
  color: #1f2c34;

  > h1 {
    margin: 22px 0 8px;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -0.04em;
  }

  > p {
    margin: 0;
    color: #667781;
    font-size: 1.05rem;
    line-height: 1.6;
  }
`;

const WelcomeLogo = styled.img`
  width: 110px;
  height: 110px;
`;
