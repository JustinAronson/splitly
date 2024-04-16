import ReceiptPage from './[roomID]/[userID]/receipt';
import LeaderViewFriends from './admin/roomID';
import MemberViewFriends from './[roomID]';
import GroupPayment from './admin/[roomID]/payment';
import LoginPage from './login';
import LeaderWaiting from './admin/[roomID]/waiting';
import JoinPage from './join/page';
import PayPage from './[roomID]/pay/page';
import WaitingPage from './[roomID]/waiting/page';

export default function App() {

  return (
    <div>
        <LoginPage/>
        <JoinPage />
        <WaitingPage />
        <PayPage />
        <ReceiptPage />
        <LeaderViewFriends />
        <MemberViewFriends />
        <GroupPayment />
        <LeaderWaiting />
      
    </div>
  );
}
