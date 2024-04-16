'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Navigation from '@/app/components/nav';
import { gql, useQuery, useMutation } from '@apollo/client';
import client from '@/app/apollo'
import { ReactSession } from 'react-client-session';


const GET_FRIENDS = gql`
  query GroupById($id: ID!) {
    groupById(id: $id) {
      userList {
        id
        displayName
      }
      totalMembers
    }
  }`;

const KICK_FRIEND = gql`
  mutation DeleteUserTransactionForGroup($userId: ID!, $groupId: ID!) {
    deleteUserTransactionForGroup(userId: $userId, groupId: $groupId) {
      ok
    }
  }`;

const LeaderWaiting = ({ params }) => {
  const router = useRouter();
  const roomID = Number(params.roomID);
  const userID = ReactSession.get("userID");

  const {loading, error, data} = useQuery(GET_FRIENDS, { variables: { id: roomID }, client: client, pollInterval: 500 });
  const [kickFriend] = useMutation(KICK_FRIEND, {client});
  const [closedLink, setClosedLink] = useState(false);
  const [friends, setFriends] = useState([])
  const [membersCount, setMembersCount] = useState(1000)

  useEffect(() => {
    if (data) {
      setFriends(data.groupById.userList);
      setMembersCount(data.groupById.totalMembers); 
    }
  },  [data]); 

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  // If the room is closed (enough people have joined), route to payment page
  if (friends.length === membersCount) {
    router.push(`/${roomID}/pay`);
  }
  const handleCloseLink = () => {
    setClosedLink(true);
    router.push(`/admin/${roomID}`)
  };

  const handleButtonClick = () => {
    if (membersCount === friends.length) {
      router.push(`/${roomID}/pay`);
    } else {
      handleCloseLink();
    }
  };

  function KickButton({friend, index}) {
    if (friend.id == userID) {
      return (
          <div>{friend.displayName}</div>
      )
    }
    return (
      <div>
        {friend.displayName} <button className = {styles.kickButton} onClick={() => kickFriend({variables: {userId: friend.id, groupId: roomID}})}>Kick</button>
      </div>
    )
  }

  return (
    <main>
      <Navigation/>
    <div className={styles.container}>
      <div className = {styles.pText}>
        <p><b>Join with Code {roomID}</b></p>
        <p>Waiting for Friends to Join...</p>
      </div>
      <div className={styles.friendsList}>
        {friends.map((friend, index) => (
          <div key={index} className= {styles.frienItem}>
            <KickButton 
              friend= {friend}
              index= {index} />
          </div>
        ))}
      </div>

      {!closedLink && (
        <button className={styles.button} onClick={handleButtonClick}>
          {membersCount === friends.length ? 'Make Payment' : 'Close Link'}
        </button>
      )}
    </div>
    </main>
  );
};

export default LeaderWaiting;
