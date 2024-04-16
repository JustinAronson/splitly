'use client';
import styles from "./page.module.css";
import Navigation from "../components/nav";
import { useRouter } from 'next/navigation';
import { ReactSession } from 'react-client-session';
import { gql, useMutation } from '@apollo/client';
import client from '../apollo';
ReactSession.setStoreType("localStorage");

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $displayName: String!) {
    createUser(username: $username, displayName: $displayName) {
      user{id}
    }
  }`;
export default function LoginPage() {

    const [createUser] = useMutation(CREATE_USER, {client});
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        createUser({
            variables: { username: event.target[0].value, displayName: event.target[0].value },
            onCompleted: (data) => {
                ReactSession.set("userID", data.createUser.user.id);
                // API Request
                // Navigate to next page
                router.push('/join');
            }
        })
    };


    return (
        <main>
            <Navigation/>
            <div className={styles.login}>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Sign in With Your Name</label>
                <input type="text" id="name" name="name" placeholder="John Doe" required />
                <button type="submit">Login</button>
            </form>
            </div>
        </main>
    );
}