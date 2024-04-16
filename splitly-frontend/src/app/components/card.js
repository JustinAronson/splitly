import React from 'react';

const CreditCard = ({ cardNumber, cardHolder, expirationDate, cvv }) => {
  return (

      <div className = 'creditContainer'>
    <div className = 'creditCard'>
      <div className = 'cardFront'>
        <div className= 'cardChip'></div>
        <div className='cardNumber'>{cardNumber}</div>
        <div className='cardInfo'>
          <div className='cardHolder'>
            <div className='label'>Card Holder</div>
            <div>{cardHolder}</div>
          </div>
          <div className='expirationDate'>
            <div className='label'>Expires</div>
            <div>{expirationDate}</div>
          </div>
        </div>
      </div>
      <div className='cardBack'>
        <div className='cardBackStrip'></div>
        <div className='cvv'>
          <div className='label'>CVV</div>
          <div>{cvv}</div>
        </div>
      </div>
    </div>
    </div>
  );
  };

export default CreditCard;
