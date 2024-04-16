'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Navigation from '@/app/components/nav';
import { gql, useQuery } from '@apollo/client';
import client from '@/app/apollo'

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
  }`;

const LeaderViewFriends = ({ params }) => {

  const router = useRouter();
  const roomID = params.roomID;

  const {loading, error, data} = useQuery(GET_GROUP_INFO, { variables: { id: roomID }, client: client, pollInterval: 500 });
  const [isSplitChecked, setIsSplitChecked] = useState(false);
  
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  const billAmount = data.groupById.totalCharge;
  const totalPaidMembers = data.groupById.transactionSet.filter(transaction => transaction.paid).length;
  const totalAllowedMembers = data.groupById.totalMembers;
  const friends = data.groupById.transactionSet;

  const moneyString = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
  
  const handleSplitChange = () => {
    setIsSplitChecked(!isSplitChecked);
  };
  const handleGenerateCard = () => {
    router.push(`/admin/${roomID}/payment`);
  };

  return (
    <main>
      <Navigation/>
  
      <div className = {styles.container}>
      <div className = {styles.totalBillContainer}>
              <h2 className = {styles.billAmount}>Group bill</h2>
          <div className = {styles.totalBillBox}>
               {moneyString(billAmount)}
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

      
      <button
        className={styles.button}
        disabled={totalPaidMembers !== totalAllowedMembers}
        onClick={handleGenerateCard}
      >
        Generate Card
      </button>

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

export default LeaderViewFriends;