import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocument } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';
import ChatScreen from './ChatScreen';
import Loading from './Loading';
import Sidebar from './Sidebar';

function ChatPage() {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [chatSnapshot, loading] = useDocument(db.collection('chats').doc(id));
  const chat = chatSnapshot?.exists ? { id: chatSnapshot.id, ...chatSnapshot.data() } : null;

  useEffect(() => {
    document.title = chat
      ? `Chat with ${getRecipientEmail(chat.users, user)}`
      : 'WhatsApp Clone';
  }, [chat, user]);

  if (loading) return <Loading />;

  return (
    <Container>
      <Sidebar />
      <ChatContainer>
        {chat ? <ChatScreen chat={chat} chatId={id} /> : <EmptyChat>Chat not found.</EmptyChat>}
      </ChatContainer>
    </Container>
  );
}

export default ChatPage;

const Container = styled.div`
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

    > aside {
      display: none;
    }
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow: auto;
  height: 100%;
  min-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const EmptyChat = styled.div`
  display: grid;
  place-items: center;
  height: 100%;
  color: gray;
  padding: 24px;
  text-align: center;
`;
