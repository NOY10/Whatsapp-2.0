import styled from "styled-components";
import { db,auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {Avatar, IconButton} from '@material-ui/core';
import { ArrowBack, AttachFile, InsertEmoticon, Mic, MoreVert } from "@material-ui/icons";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from 'firebase/compat/app';
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";

function ChatScreen({chat, chatId}) {
  const [user] = useAuthState(auth);
  const [input,setInput] = useState('');
  const endOfMessagesRef = useRef(null);
  const navigate = useNavigate();

  const [messagesSnapshot] = useCollection(
    db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp','asc')
  );

  const [recipientSnapshot] = useCollection(
    db.collection('users').where('email','==',getRecipientEmail(chat.users,user))
  );

  const showMessages = () => {
    if (!messagesSnapshot) return null;

    return messagesSnapshot.docs.map(message => (
        <Message 
          key={message.id} 
          user = {message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
  }

  const scrollToBottom = () =>{
    endOfMessagesRef.current?.scrollIntoView({
      behavior: 'smooth',
      block:"start",
    });
  }

  const sendMessage = (e) =>{
    e.preventDefault();

    db.collection('users').doc(user.uid).set({ 
      lastSeen:firebase.firestore.FieldValue.serverTimestamp(),

    }, { merge: true });

    db.collection('chats').doc(chatId).collection('messages').add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email, 
      photoURL: user.photoURL,
    });
    setInput('');
    scrollToBottom();

  };

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users,user);

  return (
    <Container>
        <Header>
          <BackButton onClick={() => navigate('/')} aria-label="Back to chats">
            <ArrowBack/>
          </BackButton>
          {recipient ? (
            <Avatar src={recipient?.photoURL}/>
          ) : (
            <Avatar>{recipientEmail[0]}</Avatar>
          )}
          

          <HeaderInformation>
            <h3>{recipientEmail}</h3>
            {recipientSnapshot ? (
              <p>Last active: {" "}
                  {recipient?.lastSeen?.toDate() ? (
                    <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                  ):("Unavailable"
                )}
              </p>
            ):(
              <p>Loading Last Active</p>
            )}
            
          </HeaderInformation>

          <HeaderIcons>
            <IconButton>
              <AttachFile/>
            </IconButton>
            <IconButton>
              <MoreVert/>
            </IconButton>
          </HeaderIcons>
        </Header>

        <MeessageContainer>
          {showMessages()}
          <EndOfMessage ref={endOfMessagesRef}/>
        </MeessageContainer>
        
        <InputContainer>
          <InsertEmoticon />
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message"
          />
          <button hidden disabled={!input} type='submit' onClick={sendMessage}>Send Message</button>
          <Mic />
        </InputContainer>
    </Container>
  )
}

export default ChatScreen

const InputContainer = styled.form`
  display:flex;
  align-items:center;
  gap: 8px;
  padding: 12px 16px;
  position: sticky;
  bottom: 0;
  background-color:#f0f2f5;
  z-index:100;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Input = styled.input`
  flex:1;
  min-width: 0;
  outline: none;
  border: none;
  border-radius: 999px;
  padding: 14px 18px;
  background-color:white;
  color:black;
  font-size: 15px;
`;

const Container = styled.div`
   display: flex;
   flex-direction: column;
   min-height: 100%;
   background-color: #efeae2;

`;

const Header = styled.div`
   position: sticky;
   background-color: white;
   z-index: 100;
   top: 0;
   display:flex;
   gap: 12px;
   padding:12px 16px;
   min-height: 76px;
   align-items: center;
   border-bottom: 1px solid #e9edef;

`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;
  min-width: 0;
  > h3{
    margin: 0 0 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #111b21;
  }
  > p{
    margin: 0;
    font-size: 14px;
    color:#667781;
  }
`;

const EndOfMessage = styled.div`
  margin-bottom: 50px;
`;

const HeaderIcons = styled.div`
  display: flex;
  flex-shrink: 0;

  @media (max-width: 420px) {
    button:first-child {
      display: none;
    }
  }
`;

const MeessageContainer = styled.div`
  flex: 1;
  padding: 30px;
  background-color:#efeae2;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)),
    radial-gradient(circle at 20px 20px, rgba(17, 27, 33, 0.04) 2px, transparent 0);
  background-size: auto, 42px 42px;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 16px 10px;
  }
`;

const BackButton = styled(IconButton)`
  &&& {
    display: none;
  }

  @media (max-width: 768px) {
    &&& {
      display: inline-flex;
      margin-left: -8px;
    }
  }
`;

