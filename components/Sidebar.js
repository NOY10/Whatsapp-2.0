import { Avatar, Button, IconButton } from "@material-ui/core";
import { Chat, MoreVert, SearchOutlined } from "@material-ui/icons";
import styled from "styled-components";
import * as EmailValidator from "email-validator";
import Chats from './Chats';
import { auth, db } from "../firebase";
import { useCollection } from 'react-firebase-hooks/firestore'
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, setDoc } from "firebase/firestore";

function Sidebar() {

    const [user] = useAuthState(auth);
    const userChatRef = db.collection('chats').where('users','array-contains', user.email);
    const [chatsSnapshot] = useCollection(userChatRef);

    const createChat = () =>{
        const input = prompt(
            "Please enter an email address for the user you wish to chat with"
        );

        if (!input) return null;

        if (EmailValidator.validate(input) && !chatAlreadyExists(input) && input !== user.email) {
            setDoc(doc(collection(db, 'chats')), {
                users: [user.email, input]
            });
        }

    };
    const chatAlreadyExists = (recipientEmail) => 
        !!chatsSnapshot?.docs.find(
            (chat) => 
                chat.data().users.find((user) => user === recipientEmail)?.length > 0
        );
    
  return (
    <Container>
        <Header>
            <UserAvatar src={user.photoURL} onClick={() => auth.signOut()}/>

            <IconContainer>
                <IconButton>
                    <Chat/>
                </IconButton>
                <IconButton>
                    <MoreVert/>
                </IconButton>
            </IconContainer>
          
        </Header>

        <Search>
            <SearchOutlined/>
            <SearchInput placeholder="Search in chats"/>
        </Search>

        <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

        {/* List of Chats */}
        {chatsSnapshot?.docs.map((chat) => (
            <Chats key={chat.id} id={chat.id} users={chat.data().users} />
        ))}
    
    </Container>
  )
}

export default Sidebar;

const Container = styled.div`
    flex:0.45;
    border-right:1px solid whitesmoke;
    height:100vh;
    min-width:300px;
    max-width: 350px;
    overflow-y:scroll;

    ::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style:none;
    scrollbar-width: none;
`;

const Search = styled.div`
    display: flex;
    align-items: center;
    padding:20px;
    border-radius:2px;
`;

const SidebarButton = styled(Button)`
    width:100%;
    &&&{
        border-top: 1px solid whitesmoke;
        border-bottom: 1px solid whitesmoke;
    }
`;

const SearchInput = styled.input`
    outline-width:0;
    border:none;
    flex:1;
`;

const Header = styled.div`
    display:flex;
    position:sticky;
    top:0;
    background-color:white;
    z-index: 1;
    justify-content:space-between;
    align-items:center;
    padding:15;
    height:80px;
    border:1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;

const IconContainer = styled.div``;

