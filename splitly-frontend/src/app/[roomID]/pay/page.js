'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css"
import Navigation from "../../components/nav";
import { gql, useMutation, useQuery } from '@apollo/client';
import { ReactSession } from 'react-client-session';
import client from '@/app/apollo';

const PUSH_PAYMENT = gql`
    mutation UpdateTransaction($userId: ID!, $groupId: ID!, $cardNumber: Int!, $cardExpiration: String!, $cardSecurity: Int!, $paid: Boolean!) {
        updateTransaction(userId: $userId, groupId: $groupId, cardNumber: $cardNumber, cardExpiration: $cardExpiration, cardSecurity: $cardSecurity, paid: $paid) {
            transaction {
                paid
            }
        }
    }
`;

const GET_PAYMENT_INFO = gql`
    query TransactionById($userId: ID!, $groupId: ID!) {
        transactionById(userId: $userId, groupId: $groupId) {
            totalOwed
        }
    }
`;
export default function PayPage({ params }) {
    const router = useRouter();
    const roomID = params.roomID;

    const userID = ReactSession.get("userID");

    const [updateTransaction] = useMutation(PUSH_PAYMENT, {client});
    const {loading, error, data} = useQuery(GET_PAYMENT_INFO, { variables: { userId: userID, groupId: roomID }, client: client });

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    const subtotal = data.transactionById.totalOwed;
    const platformFee = 4;
    const total = subtotal + platformFee;

    const moneyString = (amount) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const handleCardInput = (event) => {
        let inputValue = event.target.value.replace(/\D/g, '');
        inputValue = inputValue.substring(0, 16);
        const formattedValue = inputValue.replace(/(\d{4})/g, '$1 ').trim();
        event.target.value = formattedValue;
    }

    const handleCVVInput = (event) => {
        let inputValue = event.target.value.replace(/\D/g, '');
        inputValue = inputValue.substring(0, 3);
        event.target.value = inputValue;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        updateTransaction({
            variables: { userId: userID, groupId: roomID, cardNumber:  parseInt(event.target[2].value, 10), 
                cardExpiration: event.target[3].value, cardSecurity:  parseInt(event.target[4].value, 10),
                paid: true},
            onCompleted: (data) => {
                // API Request
                // Navigate to next page
                router.push(`/${roomID}/${userID}/receipt`);
            }
        })
    };



    return (
        <main>
            <Navigation/>

            <div className = {styles.totalBillContainer}>
                <p>Your bill</p>
            <div className = {styles.totalBillBox}>
                 {moneyString(total)}
            </div>
            </div>
        <div className = {styles.payPage}>
            
            <form className={styles.payForm} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="first-name">Sign in With Your Name</label>
                    <input type="text" id="first-name" name="first-name" placeholder="First" required />
                    <input type="text" id="last-name" name="last-name" placeholder="Last" required />
                </div>
                <div>
                    <label htmlFor="credit-card">Credit Card Number:</label>
                    <input onInput={handleCardInput} type="text" id="credit-card" name="credit-card" pattern="\d{4} \d{4} \d{4} \d{4}" placeholder="XXXX XXXX XXXX XXXX" required/>
                </div>

                <div>
                    <label htmlFor="expiration-date">Expiration Date:</label>
                    <input type="month" id="expiration-date" name="expiration-date" placeholder="MM/YY" required/>
                
                    <label htmlFor="cvv">CVV</label>
                    <input onInput={handleCVVInput} type="text" id="cvv" name="cvv" pattern="\d{3}" placeholder="XXX" required />
                    
                </div>

                <div>
                    <div className={styles.moneyLine}>
                        <p>Subtotal</p>
                        <p>{moneyString(subtotal)}</p>
                    </div>
                    <div className={styles.moneyLine}>
                        <p>Platform Fee</p>
                        <p>{moneyString(platformFee)}</p>
                    </div>
                    <div id={styles.totalPayment} className={styles.moneyLine}>
                        <p>Total</p>
                        <p>{moneyString(total)}</p>
                    </div>

                </div>
                


                <button type="submit">Make Payment</button>
            </form>
            </div>
        </main>
    );
}