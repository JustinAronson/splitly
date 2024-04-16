'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CreditCard from '@/app/components/card';
import Navigation from '@/app/components/nav';

// group payment that generates card

const GroupPayment = ({ params }) => {
  const router = useRouter();
  const roomID = params.roomID;
    // replace these with actual queries (not in MVP)
  const cardNumber = '1234 5678 9012 3456';
  const cardHolder = 'John Doe';
  const expirationDate = '12/23';
  const cvv = '123';

  return (
    <div>
    <Navigation/>
    <CreditCard
      cardNumber={cardNumber}
      cardHolder={cardHolder}
      expirationDate={expirationDate}
      cvv={cvv}
    />
  </div>
);
};

export default GroupPayment;
