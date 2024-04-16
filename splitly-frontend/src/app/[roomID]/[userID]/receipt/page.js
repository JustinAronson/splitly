'use client';
import { ReactSession } from 'react-client-session';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'
import Navigation from '@/app/components/nav';

const ReceiptPage = ({ params }) => {
    const router = useRouter();
    const roomID = params.roomID;
    const userID = params.userID;

    const mockUserData = {
      userId: userID,
      groupId: roomID,
      transactionId: '789',
      isGroupLeader: ReactSession.get("admin")
    };

    const handleViewFriends = () => 
    {
        if(mockUserData.isGroupLeader)
        {
          router.push(`/admin/${roomID}`);

        }
        else
        {
          router.push(`/${roomID}`);
        }

    }
  
    return (
      <div>
        <Navigation/>
        <div className = {styles.receiptBox}>
          <p>User ID: {mockUserData.userId}</p>
          <p>Group ID: {mockUserData.groupId}</p>
          <p>Transaction ID: {mockUserData.transactionId}</p>
        </div>

        <div className = {styles.buttonWrapper}>
        <button className = {styles.button} onClick={handleViewFriends}>View Friends</button>
        </div>

      </div>
    );
  };

  export default ReceiptPage;
  