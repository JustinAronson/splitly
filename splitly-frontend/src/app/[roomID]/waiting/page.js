'use client';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css"
import Navigation from "@/app/components/nav";
import { gql, useQuery } from '@apollo/client';
import client from '@/app/apollo';
import { ReactSession } from 'react-client-session';
import React, { useState, useEffect } from 'react';

const GET_MEMBERS = gql`
    query GroupById($id: ID!) {
        groupById(id: $id) {
            transactionSet {
                payer {id displayName}
            }
            totalMembers
        }
    }`;

export default function WaitingPage({ params }) {
    const roomID = params.roomID;
    const router = useRouter();
    const userID = ReactSession.get("userID");

    const {loading, error, data} = useQuery(GET_MEMBERS, { variables: { id: roomID }, client: client, pollInterval: 500, fetchPolicy: "no-cache" });

    useEffect(() => {
        if (data) {
            // This checks if the user has been kicked
            if (!data.groupById.transactionSet.some(user => user.payer.id === userID)) {
                router.push(`/join`);
            }

            // If the room is closed (enough people have joined), route to payment page
            if (data.groupById.transactionSet.length === data.groupById.totalMembers) {
                router.push(`/${roomID}/pay`);
            }
        }
    },  [data]); 

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;
  
    return (
        <main>
            <Navigation/>
            <div className={styles.mainContainer}>
            
            <div className = {styles.pText}>
                <p >Waiting for everyone to join...</p>
            </div>
            
            <div>
                <div className={styles.container}>
                    <p>Total Group Bill</p>
                    <div className={styles.groupSettings}>$100</div>
                </div>
                <div className={styles.container}>
                    <p>Split</p>
                    <div className={styles.groupSettings}>Evenly</div>
                </div>
            </div>
        </div>
        </main>
    );
}