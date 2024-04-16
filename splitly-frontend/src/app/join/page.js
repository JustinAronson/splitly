'use client';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { ReactSession } from 'react-client-session';
import Navigation from "../components/nav";
import { gql, useMutation } from '@apollo/client';
import client from '../apollo';

const CREATE_ROOM = gql`
    mutation CreateGroup($leader: ID!, $userList: [ID!], $totalMembers: Int!, $totalCharge: Float!) {
        createGroup(leader: $leader, userList: $userList, totalMembers: $totalMembers, totalCharge: $totalCharge) {
            group{id}
        }
    }`;
const JOIN_ROOM = gql`
    mutation UpdateGroup($id: ID!, $userList: [ID!]) {
        updateGroup(id: $id, userList: $userList) {
            group{id}
        }
    }`;

export default function JoinPage() {

    const router = useRouter();
    const [createRoom] = useMutation(CREATE_ROOM, {client});
    const [joinRoom] = useMutation(JOIN_ROOM, {client});

    const handleCreateSubmit = async (event) => {
        event.preventDefault();
        ReactSession.set("admin", true);
        const userID = ReactSession.get("userID");
        createRoom({
            variables: { leader: userID, userList: [userID], 
                        totalMembers: Number(event.target[0].value), 
                        totalCharge: parseFloat(event.target[1].value)},
            onCompleted: (data) => {
                ReactSession.set("roomID", data.createGroup.group.id);
                // API Request
                // Navigate to next page
                router.push(`/admin/${data.createGroup.group.id}/waiting`);
            },
        })
    };

    const handleJoinSubmit = async (event) => {
        event.preventDefault();
        ReactSession.set("admin", false);
        const roomID = event.target[0].value;
        joinRoom({
            variables: { id: roomID, userList: [ReactSession.get("userID")] },
            onCompleted: (data) => {
                ReactSession.set("roomID", roomID);
                // API Request
                // Navigate to next page
                router.push(`/${roomID}/waiting`);
            },
            onError: (err) => {
                alert('Room full')
            }
        })
    };


    return (
        <main>
            <Navigation/>
            <div className = {styles.join}>
            <form onSubmit={handleCreateSubmit}>
                <div>
                    <label htmlFor="num-people">Enter the number of people paying:</label>
                    <input type="number" id="num-people" name="num-people" placeholder="0" min="1" required />
                </div>
                <div>
                    <label htmlFor="total-charge">Total Amount</label>
                    <input type="text" id="total-charge" name="total-charge" placeholder="100" required />
                </div>
                <button type="submit">Create Room</button>
            </form>

            <form onSubmit={handleJoinSubmit}>
                <label htmlFor="room-id">Enter Room ID:</label>
                <input type="text" id="room-id" name="room-id" placeholder="Paste room ID" required />
                <button type="submit">Join Room</button>
            </form>
            </div>
        </main>
    );
}