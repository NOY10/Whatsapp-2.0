import { Avatar } from '@material-ui/core';
import React from 'react';
import styled from "styled-components";
import { auth, db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';
import {useAuthState} from "react-firebase-hooks/auth";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useNavigate } from 'react-router-dom';


function Chats({id, users}) {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [recipientSnapshot] = useCollection(
    db.collection('users').where('email','==',getRecipientEmail(users,user))
  );
    
  const enterChat = () => {
    navigate(`/chat/${id}`);
  }
  
  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const recipientEmail = getRecipientEmail(users, user);
  return (
    <Container onClick={enterChat}>
        {recipient ? (
          <UserAvatar src={recipient?.photoURL}/>
        ): (
          <UserAvatar>{recipientEmail[0]}</UserAvatar> 
        )
        }
        
        <ChatInfo>
          <strong>{recipient?.displayName || recipientEmail}</strong>
          <span>{recipientEmail}</span>
        </ChatInfo>

    </Container>
  )
}

export default Chats;

const Container = styled.div`
    display:flex;
    align-items:center;
    cursor:pointer;
    padding: 14px 18px;
    word-break: break-word;
    border-bottom: 1px solid #f0f2f5;
    transition: background-color 0.15s ease;
    :hover{
        background-color:#f5f6f6;
    }
`;

const UserAvatar = styled(Avatar)`
    margin-right: 15px;
    flex-shrink: 0;
`;

const ChatInfo = styled.div`
    min-width: 0;

    > strong,
    > span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    > strong {
        color: #111b21;
        font-size: 16px;
        font-weight: 600;
    }

    > span {
        margin-top: 4px;
        color: #667781;
        font-size: 13px;
    }
`;
