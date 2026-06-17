import { Avatar, Button, IconButton } from "@material-ui/core";
import { Chat, Close, MoreVert, SearchOutlined } from "@material-ui/icons";
import styled from "styled-components";
import Chats from './Chats';
import { auth, db } from "../firebase";
import { useCollection } from 'react-firebase-hooks/firestore'
import { useAuthState } from "react-firebase-hooks/auth";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {

    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [chatSearch, setChatSearch] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const userChatRef = db.collection('chats').where('users','array-contains', user.email);
    const [chatsSnapshot] = useCollection(userChatRef);
    const [usersSnapshot, usersLoading, usersError] = useCollection(db.collection('users').orderBy('email'));

    const chatAlreadyExists = (recipientEmail) =>
        chatsSnapshot?.docs.find((chat) =>
            chat.data().users.includes(recipientEmail)
        );

    const filteredSystemUsers = useMemo(() => {
        const search = userSearch.trim().toLowerCase();

        return usersSnapshot?.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((systemUser) => systemUser.email && systemUser.email !== user.email)
            .filter((systemUser) => {
                if (!search) return true;

                return [systemUser.displayName, systemUser.email]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(search));
            }) || [];
    }, [user.email, userSearch, usersSnapshot]);

    const filteredChats = useMemo(() => {
        const search = chatSearch.trim().toLowerCase();
        const docs = chatsSnapshot?.docs || [];

        if (!search) return docs;

        return docs.filter((chat) =>
            chat.data().users.some((chatUser) =>
                chatUser !== user.email && chatUser.toLowerCase().includes(search)
            )
        );
    }, [chatSearch, chatsSnapshot, user.email]);

    const startChatWithUser = async (recipientEmail) => {
        if (!recipientEmail || recipientEmail === user.email || isCreatingChat) return;

        const existingChat = chatAlreadyExists(recipientEmail);

        if (existingChat) {
            setIsUserPickerOpen(false);
            setUserSearch('');
            navigate(`/chat/${existingChat.id}`);
            return;
        }

        setIsCreatingChat(true);

        try {
            const chatRef = await db.collection('chats').add({
                users: [user.email, recipientEmail],
            });

            setIsUserPickerOpen(false);
            setUserSearch('');
            navigate(`/chat/${chatRef.id}`);
        } finally {
            setIsCreatingChat(false);
        }
    };
    
  return (
    <Container as="aside">
        <Header>
            <Profile>
                <UserAvatar src={user.photoURL} onClick={() => auth.signOut()}/>
                <ProfileText>
                    <strong>{user.displayName || 'My account'}</strong>
                    <span>{user.email}</span>
                </ProfileText>
            </Profile>

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
            <SearchInput
                placeholder="Search in chats"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
            />
        </Search>

        <SidebarButton onClick={() => setIsUserPickerOpen(true)}>Start a new chat</SidebarButton>

        {/* List of Chats */}
        <ChatList>
            {filteredChats.map((chat) => (
                <Chats key={chat.id} id={chat.id} users={chat.data().users} />
            ))}
            {chatsSnapshot?.empty && (
                <EmptyState>No chats yet. Start one with someone in the system.</EmptyState>
            )}
            {!chatsSnapshot?.empty && filteredChats.length === 0 && (
                <EmptyState>No chats match your search.</EmptyState>
            )}
        </ChatList>

        {isUserPickerOpen && (
            <PickerOverlay onClick={() => setIsUserPickerOpen(false)}>
                <PickerPanel onClick={(e) => e.stopPropagation()}>
                    <PickerHeader>
                        <div>
                            <h2>Start a new chat</h2>
                            <p>Search users who have signed in to this app.</p>
                        </div>
                        <IconButton onClick={() => setIsUserPickerOpen(false)} aria-label="Close user search">
                            <Close />
                        </IconButton>
                    </PickerHeader>

                    <PickerSearch>
                        <SearchOutlined />
                        <SearchInput
                            autoFocus
                            placeholder="Search by name or email"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </PickerSearch>

                    <SystemUserList>
                        {usersLoading && <EmptyState>Loading users...</EmptyState>}

                        {usersError && (
                            <EmptyState>
                                Could not load users. Check Firestore rules for the users collection.
                            </EmptyState>
                        )}

                        {!usersLoading && !usersError && filteredSystemUsers.map((systemUser) => {
                            const existingChat = chatAlreadyExists(systemUser.email);

                            return (
                                <SystemUserButton
                                    key={systemUser.id}
                                    type="button"
                                    disabled={isCreatingChat}
                                    onClick={() => startChatWithUser(systemUser.email)}
                                >
                                    <UserAvatar src={systemUser.photoURL}>
                                        {systemUser.email?.[0]?.toUpperCase()}
                                    </UserAvatar>
                                    <SystemUserInfo>
                                        <strong>{systemUser.displayName || systemUser.email}</strong>
                                        <span>{systemUser.email}</span>
                                    </SystemUserInfo>
                                    <UserAction>{existingChat ? 'Open' : 'Chat'}</UserAction>
                                </SystemUserButton>
                            );
                        })}

                        {!usersLoading && !usersError && filteredSystemUsers.length === 0 && (
                            <EmptyState>No users found.</EmptyState>
                        )}
                    </SystemUserList>
                </PickerPanel>
            </PickerOverlay>
        )}
    
    </Container>
  )
}

export default Sidebar;

const Container = styled.div`
    flex: 0 0 clamp(320px, 32vw, 420px);
    border-right: 1px solid #e9edef;
    height: 100%;
    min-width: 0;
    max-width: 420px;
    overflow-y: auto;
    background-color: #ffffff;

    ::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style:none;
    scrollbar-width: none;

    @media (max-width: 768px) {
        max-width: none;
        width: 100%;
        height: 100dvh;
        border-right: 0;
    }
`;

const Search = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px 16px;
    padding: 10px 14px;
    border-radius: 999px;
    background-color: #f0f2f5;
    color: #54656f;
`;

const SidebarButton = styled(Button)`
    width: calc(100% - 32px);
    margin: 0 16px 10px !important;
    &&&{
        border: 1px solid #d9fdd3;
        border-radius: 999px;
        color: #075e54;
        background: #f0fff4;
        font-weight: 700;
        text-transform: none;
    }
`;

const SearchInput = styled.input`
    outline-width: 0;
    border: none;
    flex: 1;
    min-width: 0;
    background: transparent;
    font-size: 15px;
`;

const Header = styled.div`
    display:flex;
    position:sticky;
    top:0;
    background-color:#f0f2f5;
    z-index: 1;
    justify-content:space-between;
    align-items:center;
    gap: 12px;
    padding: 14px 16px;
    min-height: 76px;
    border-bottom:1px solid #e9edef;
`;

const UserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;

const Profile = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
`;

const ProfileText = styled.div`
    min-width: 0;

    > strong,
    > span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    > strong {
        color: #1f2c34;
        font-size: 15px;
    }

    > span {
        color: #667781;
        font-size: 12px;
    }
`;

const IconContainer = styled.div`
    display: flex;
    flex-shrink: 0;
`;

const ChatList = styled.div`
    padding-bottom: 24px;
`;

const EmptyState = styled.p`
    margin: 32px 24px;
    color: #667781;
    text-align: center;
    line-height: 1.5;
`;

const PickerOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(17, 27, 33, 0.4);

    @media (max-width: 768px) {
        align-items: end;
        padding: 0;
    }
`;

const PickerPanel = styled.div`
    width: min(440px, 100%);
    max-height: min(680px, 90dvh);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 24px;
    background: white;
    box-shadow: 0 24px 80px rgba(11, 20, 26, 0.24);

    @media (max-width: 768px) {
        width: 100%;
        max-height: 86dvh;
        border-radius: 24px 24px 0 0;
    }
`;

const PickerHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 22px 12px;

    h2,
    p {
        margin: 0;
    }

    h2 {
        color: #111b21;
        font-size: 22px;
    }

    p {
        margin-top: 5px;
        color: #667781;
        font-size: 14px;
        line-height: 1.4;
    }
`;

const PickerSearch = styled(Search)`
    margin-top: 8px;
    margin-bottom: 8px;
`;

const SystemUserList = styled.div`
    overflow-y: auto;
    padding: 4px 0 14px;
`;

const SystemUserButton = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border: 0;
    border-bottom: 1px solid #f0f2f5;
    background: white;
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #f5f6f6;
    }

    &:disabled {
        cursor: wait;
        opacity: 0.7;
    }
`;

const SystemUserInfo = styled.div`
    min-width: 0;
    flex: 1;

    > strong,
    > span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    > strong {
        color: #111b21;
        font-size: 15px;
    }

    > span {
        margin-top: 4px;
        color: #667781;
        font-size: 13px;
    }
`;

const UserAction = styled.span`
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: 999px;
    background: #e7fce3;
    color: #075e54;
    font-size: 12px;
    font-weight: 700;
`;

