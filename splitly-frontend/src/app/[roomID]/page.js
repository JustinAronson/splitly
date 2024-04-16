'use client'
import React, {useState} from 'react';
import styles from './page.module.css';
import Navigation from '../components/nav';
import { gql, useQuery } from '@apollo/client';
import { ReactSession } from 'react-client-session';
import client from '../apollo';

const GET_GROUP_INFO = gql`
    query GroupById($id: ID!) {
        groupById(id: $id) {
            transactionSet {
                payer {id displayName}
                paid
            }
            totalCharge
            totalMembers
        }
    }
`;
const MemberViewFriends = ({ params }) => {
    const roomID = params.roomID;
    const {loading, error, data} = useQuery(GET_GROUP_INFO, { variables: { id: roomID}, client: client, pollInterval: 500 });
    const [isSplitChecked, setIsSplitChecked] = useState(false);
    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    let billAmount = data.groupById.totalCharge;
    let totalPaidMembers = data.groupById.transactionSet.filter(transaction => transaction.paid).length;
    let totalAllowedMembers = data.groupById.totalMembers;
    let friends = data.groupById.transactionSet;

    const handleSplitChange = () => {
      setIsSplitChecked(!isSplitChecked);
    };
  
    return (
      <main>
        <Navigation/>
    
        <div className = {styles.container}>
        <div className = {styles.totalBillContainer}>
                <h2 className = {styles.billAmount}>Group bill</h2>
            <div className = {styles.totalBillBox}>
                 {billAmount}
            </div>
            </div>
        
       <div className={styles.splitCheckbox}>
          <input
            type="checkbox"
            checked={isSplitChecked}
            onChange={handleSplitChange}
          />
          <label className = {styles.split}>Split</label>
        </div>

        <div className={styles.memberStatus}>
          {totalPaidMembers}/{totalAllowedMembers} Paid
        </div>
        <div className={styles.friendsList}>
        {friends.map((friend, index) => (
              <div key={index} className={friend.paid ? styles.friendPaid : styles.friendNotPaid}>
                {friend.payer.displayName}
              </div>
            ))}
        </div>
    </div>
      </main>
  );
};

export default MemberViewFriends;
