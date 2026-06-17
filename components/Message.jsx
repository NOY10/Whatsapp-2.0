import styled from "styled-components";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import moment from "moment";

function Message({user, message}) {
  const [userLoggedIn] = useAuthState(auth);

  const TypeOfMessage = user === userLoggedIn?.email ? Sender : Receiver;
  return (
    <Container>
        <TypeOfMessage>
          {message.message}
          <Timestamp>{message.timestamp ? moment(message.timestamp).format('LT') : '...'}</Timestamp>
        </TypeOfMessage>
        
    </Container>
  )
}

export default Message;

const Container = styled.div``;

const MessageElement = styled.p`
  width: fit-content;
  max-width: min(70%, 680px);
  padding: 10px 12px;
  border-radius: 12px;
  margin: 8px 0;
  min-width: 64px;
  padding-bottom: 26px;
  position: relative;
  text-align:left;
  color: #111b21;
  line-height: 1.45;
  overflow-wrap: anywhere;
  box-shadow: 0 1px 1px rgba(11, 20, 26, 0.08);

  @media (max-width: 480px) {
    max-width: 86%;
  }
`;

const Sender = styled(MessageElement)`
  margin-left: auto;
  background-color: #dcfbcd;
`;

const Receiver = styled(MessageElement)`
  background-color:whitesmoke;
  text-align: left;
`;

const Timestamp = styled.span`
  color:gray;
  padding: 6px 8px;
  font-size: 10px;
  position:absolute;
  bottom: 0;
  text-align: right;
  right: 0;
`;
