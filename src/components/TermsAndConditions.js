import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1 className="terms-title">Terms and Conditions</h1>

      <section className="terms-section">
        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>PatWin</strong>! This platform is an
          <strong> entertainment and prediction-based game</strong>. By using
          this app, you agree to comply with the following terms and conditions.
          Please read them carefully before participating.
        </p>
      </section>

      <section className="terms-section">
        <h2>2. Participation Rules</h2>
        <ul>
          <li>The minimum participation value is <strong>10 Coins</strong>.</li>
          <li>All predictions are final once submitted and cannot be changed.</li>
          <li>The platform reserves the right to modify or cancel any game in
              case of technical issues or suspicious activity.</li>
          <li>A <strong>10% service charge</strong> may be deducted from reward
              coins.</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2>3. Reward Redemption Policy</h2>
        <ul>
          <li>A <strong>10% processing charge</strong> will be deducted while
              redeeming reward coins.</li>
          <li>You must earn a minimum number of <strong>reward coins</strong>
              before placing a redemption request.</li>
          <li>The <strong>minimum redeemable coins</strong> limit is decided by
              the platform.</li>
          <li>Bonus coins provided by the platform <strong>cannot be redeemed</strong>.</li>
          <li>All redemption requests are processed only after
              <strong> admin approval</strong>.</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2>4. Fair Play & Security</h2>
        <p>
          Users involved in unfair practices, multiple accounts, misuse of the
          platform, or any fraudulent activity will be permanently blocked.
          PatWin ensures fair gameplay and takes strict action against
          suspicious behavior.
        </p>
      </section>

      <section className="terms-section">
        <h2>5. Account Responsibilities</h2>
        <p>
          Users must provide accurate registration details. Sharing accounts,
          providing false information, or attempting to manipulate the system
          may result in suspension or permanent ban.
        </p>
      </section>

      <section className="terms-section">
        <h2>6. Modifications & Updates</h2>
        <p>
          PatWin reserves the right to update these terms at any time. Continued
          use of the app after updates means you accept the revised terms.
        </p>
      </section>

      <section className="terms-section">
        <h2>7. Legal Disclaimer</h2>
        <p>
          This app is strictly for <strong>entertainment and prediction
          purposes only</strong>. It does not promote or support gambling,
          betting, or real money trading in any form. All in-app coins are
          virtual and used solely for gameplay.
        </p>
      </section>

      <section className="terms-section">
        <h2>8. Contact & Support</h2>
        <p>
          For any issues, questions, or support, please contact us through the
          in-app support section.
        </p>
      </section>

      <p className="terms-footer">
        &mdash; <strong>PatWin Team</strong> &mdash;
      </p>
    </div>
  );
};

export default TermsAndConditions;
