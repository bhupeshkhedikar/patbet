import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1 className="terms-title">Terms and Conditions</h1>
      
      <section className="terms-section">
        <h2>1. Introduction</h2>
        <p>Welcome to <strong>PatBet</strong>! By using our platform, you agree to comply with the following terms and conditions. Please read them carefully before placing any bets or making transactions.</p>
      </section>
      
      <section className="terms-section">
        <h2>2. Betting Rules</h2>
        <ul>
          <li>The <strong>minimum bet amount</strong> is <strong>₹60</strong>.</li>
          <li>All bets are final once placed and cannot be reversed.</li>
          <li>The platform reserves the right to modify or cancel bets in case of technical issues or fraudulent activity.</li>
          <li><strong>10% commission</strong> will be deducted from the winnings of a bet.</li>
        </ul>
      </section>
      
      <section className="terms-section">
        <h2>3. Withdrawal Policy</h2>
        <ul>
          <li>A <strong>10% transaction fee</strong> will be deducted from the withdrawal amount.</li>
          <li>You must <strong>win at least ₹500 from bets</strong> before making a withdrawal.</li>
          <li>The <strong>minimum withdrawal amount</strong> is <strong>₹550</strong>.</li>
          <li>Bonus amounts provided by the platform <strong>cannot be withdrawn</strong>.</li>
          <li>Withdrawals are processed after admin approval.</li>
        </ul>
      </section>
      
      <section className="terms-section">
        <h2>4. Fair Play & Security</h2>
        <p>Users engaging in fraudulent activities, multiple accounts, or unfair practices will be permanently banned. The platform ensures a fair betting experience and takes necessary actions against suspicious behavior.</p>
      </section>
      
      <section className="terms-section">
        <h2>5. Account Responsibilities</h2>
        <p>Users must provide accurate information during registration. Any misuse of accounts or violations of our terms will lead to suspension.</p>
      </section>
      
      <section className="terms-section">
        <h2>6. Modifications & Updates</h2>
        <p>PatBet reserves the right to update these terms at any time. Continued use of the platform implies acceptance of any revised terms.</p>
      </section>
      
      <section className="terms-section">
        <h2>7. Contact & Support</h2>
        <p>For any queries or support, please reach out to our customer service through the app.</p>
      </section>
      
      <p className="terms-footer">&mdash; <strong>PatBet Team</strong> &mdash;</p>
    </div>
  );
};

export default TermsAndConditions;