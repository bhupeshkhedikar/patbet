import React, { useState, useEffect } from 'react';
import '../../src/WithdrawalRequest.css';
import { db, auth } from "../firebase"; // Import Firestore and auth
import { doc, updateDoc, getDoc, addDoc, collection, onSnapshot } from "firebase/firestore";

const WithdrawalRequest = () => {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [confirmBankAccount, setConfirmBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      const userRef = doc(db, "users", user.uid);

      // Listen for real-time wallet balance updates
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWalletBalance(data.walletBalance || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleRequestWithdrawal = async () => {
    try {
      // Validate input fields
      if (amount <= 350) {
        setErrorMessage('Amount must be greater than 350');
        return;
      }
      if (!paymentMethod) {
        setErrorMessage('Please select a payment method');
        return;
      }
      if (!name) {
        setErrorMessage('Please enter your name');
        return;
      }
      if (paymentMethod === 'UPI' && !upiId) {
        setErrorMessage('Please enter your UPI ID');
        return;
      }
      if (paymentMethod === 'Bank') {
        if (!bankAccount || !ifscCode) {
          setErrorMessage('Please enter your bank account details and IFSC code');
          return;
        }
        if (bankAccount !== confirmBankAccount) {
          setErrorMessage('Account number and confirm account number must match');
          return;
        }
      }

      // Check if wallet balance is sufficient
      const walletBalanceFloat = parseFloat(walletBalance);
      if (walletBalanceFloat < amount) {
        setErrorMessage('Insufficient balance');
        return;
      }

      // Deduct the requested amount from wallet balance
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        walletBalance: walletBalanceFloat - amount,
      });

      // Create withdrawal request in Firestore
      await addDoc(collection(db, 'withdrawalRequests'), {
        userId,
        amount,
        name,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : null,
        bankAccount: paymentMethod === 'Bank' ? bankAccount : null,
        ifscCode: paymentMethod === 'Bank' ? ifscCode : null,
        status: 'pending',
        requestDate: new Date(),
        reason:null
      });

      setSuccessMessage('Withdrawal request successfully created');
      alert('Withdrawal request successfully created');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error creating withdrawal request');
      console.error('Error creating withdrawal request:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Request Withdrawal</h2>
        <p style={{fontSize:'13px', color:'yellow'}}>Instant Withdrawal Within 5 to 30 min</p> <br/>
        <p className="wallet-text">Wallet Balance: ₹{walletBalance}</p>

        {/* Amount Input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />

        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {/* Payment Method Selection */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="payment-method-select"
        >
          <option value="">Select Payment Method</option>
          {/* <option value="UPI">UPI</option> */}
          <option value="Bank">Bank Transfer</option>
        </select>

        {/* UPI ID Input */}
        {paymentMethod === 'UPI' && (
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI ID"
          />
        )}

        {/* Bank Account Inputs */}
        {paymentMethod === 'Bank' && (
          <>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Enter Bank Account Number"
            />
            <input
              type="text"
              value={confirmBankAccount}
              onChange={(e) => setConfirmBankAccount(e.target.value)}
              placeholder="Confirm Bank Account Number"
            />
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="Enter IFSC Code"
            />
          </>
        )}

        {/* Submit Button */}
        <button onClick={handleRequestWithdrawal}>Request Withdrawal</button>

        <p style={{ fontSize: '10px', color: 'grey',marginTop:'20px' }}>12% transaction fee will be deducted from the withdrawal amount,
          and the funds will be credited to your account within 5 to 30 minutes. note:you need to win Min ₹300 from bets to withdraw amount</p>

        {/* Error and Success Messages */}
        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
      </div>
    </div>
  );
};

export default WithdrawalRequest;
