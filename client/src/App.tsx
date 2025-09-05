import React from 'react'
import styled from 'styled-components'


import { useAppSelector } from './hooks'

import RoomSelectionDialog from './components/RoomSelectionDialog'
import LoginDialog from './components/LoginDialog'
import ComputerDialog from './components/ComputerDialog'
import WhiteboardDialog from './components/WhiteboardDialog'
import VideoConnectionDialog from './components/VideoConnectionDialog'
import Chat from './components/Chat'
import HelperButtonGroup from './components/HelperButtonGroup'
import MobileVirtualJoystick from './components/MobileVirtualJoystick'
import AuthDialog from './AuthDialog'
import GameSnackDialog from './components/GameSnackDialog';
import { auth } from "./firebase";

const Backdrop = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`

function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)

    const [user, setUser] = React.useState(auth.currentUser);
    const [showGameSnackDialog, setShowGameSnackDialog] = React.useState(false);

    React.useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
      const handler = () => setShowGameSnackDialog(true);
      window.addEventListener('openGameSnackDialog', handler);
      return () => {
        unsubscribe();
        window.removeEventListener('openGameSnackDialog', handler);
      };
    }, []);

    if (!user) {
      return <AuthDialog />;
    }

    let ui: JSX.Element;
    if (loggedIn) {
      if (computerDialogOpen) {
        ui = <ComputerDialog />;
      } else if (whiteboardDialogOpen) {
        ui = <WhiteboardDialog />;
      } else {
        ui = (
          <>
            <Chat />
            {!videoConnected && <VideoConnectionDialog />}
            <MobileVirtualJoystick />
          </>
        );
      }
    } else if (roomJoined) {
      ui = <LoginDialog />;
    } else {
      ui = <RoomSelectionDialog />;
    }

  return (
    <Backdrop>
      {ui}
      {showGameSnackDialog && (
        <GameSnackDialog
          onClose={() => setShowGameSnackDialog(false)}
          onScoreSubmit={score => {
            // TODO: handle score saving to Firestore
            setShowGameSnackDialog(false);
          }}
        />
      )}
      {/* Render HelperButtonGroup if no dialogs are opened. */}
      {!computerDialogOpen && !whiteboardDialogOpen && <HelperButtonGroup />}
    </Backdrop>
  );
}

export default App
