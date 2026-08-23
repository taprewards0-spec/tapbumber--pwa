
TapBumber — Second Audit: Full Functional & Security Review

Audit the current TapBumber website/source code thoroughly. Do not rebuild or redesign the application yet. The purpose of this audit is to identify bugs, missing functionality, security weaknesses, incorrect calculations, broken flows, and anything that does not match the approved TapBumber specification.

1. Core Packages

TapBumber must have ONLY these two activation packages:

Standard

- Activation fee: ₦3,000
- Activation bonus: ₦500
- Completed earning-cycle reward: ₦50

Premium

- Activation fee: ₦5,000
- Activation bonus: ₦800
- Completed earning-cycle reward: ₦120

Do not add any third package or change these amounts.

2. Earning Cycle

Each earning cycle lasts exactly 2 hours 20 minutes.

The dashboard must:

- Show the current cycle clearly.
- Show a prominent real-time countdown.
- Update the countdown accurately without requiring the user to refresh.
- Calculate earnings according to the user's activated package.
- Prevent users from claiming the same completed cycle more than once.
- Prevent users from claiming future/uncompleted cycles.
- Keep the timer and earnings logic consistent after logout, login, refresh, or reopening the PWA.

3. Wallet

Audit all wallet calculations carefully.

The system must correctly handle:

- Activation bonus
- Cycle earnings
- Referral bonuses
- Total wallet balance
- Withdrawable balance
- Withdrawal deductions
- Transaction/history records

Check for duplicate credits, negative balances, incorrect calculations, client-side manipulation, and race-condition problems.

4. Referral System

Verify that referrals work correctly and securely.

Check that:

- Each user has a unique referral ID/link.
- The correct referrer receives the referral reward.
- Referral rewards cannot be duplicated.
- Users cannot refer themselves.
- Users cannot manipulate referral IDs to generate unauthorized bonuses.
- Referral rewards are credited only when the referred user's activation is legitimately confirmed.

5. Activation

Audit the activation process from beginning to end.

Verify:

- Package selection is correct.
- The selected package is stored correctly.
- Activation status is stored securely.
- Activation cannot be falsely marked as successful from the browser.
- Pending/payment/approval states cannot be manipulated.
- Activation bonuses are credited only once.
- The user's package determines the correct cycle reward.

6. Withdrawals

Audit the complete withdrawal system.

Verify:

- Withdrawal is available only when the user meets the minimum withdrawal requirement defined in the current specification.
- The withdrawal amount is validated server-side.
- The user cannot withdraw more than their available balance.
- Fees are calculated correctly.
- The fee is clearly shown before confirmation.
- Users can cancel before confirming.
- Duplicate withdrawal requests are prevented.
- Withdrawal status is tracked correctly.
- Bank-account information is handled securely.
- Approved withdrawals cannot be altered by ordinary users.

7. Authentication & Security

Perform a serious security review.

Check for:

- Authentication bypass
- Weak authorization
- Admin-panel exposure
- Client-side-only security checks
- Exposed secrets/API keys
- Insecure database access
- Unauthorized balance modification
- Unauthorized package modification
- Unauthorized withdrawal approval
- User ID manipulation
- Admin privilege escalation
- XSS
- CSRF where applicable
- Injection vulnerabilities
- Insecure API routes
- Missing server-side validation
- Sensitive information exposed in browser code
- Predictable or forgeable tokens

Do not expose secrets in your audit response.

8. Admin Panel

Verify that only authorized administrators can access administrative functions.

Audit:

- User management
- Activation approval
- Withdrawal approval
- Balance management
- Package/settings management
- Referral management
- Transaction records
- Notifications
- Admin authentication and authorization

A normal user must never be able to access or invoke admin functions.

9. Database & Persistence

Check whether important user/account data is actually persisted securely.

Verify that balances, activation status, package selection, cycle claims, referrals, withdrawals, and transaction records do not disappear after refresh, logout, deployment, or server restart.

Identify any places where the application is incorrectly relying only on localStorage or other client-side storage for financial/accounting data.

10. PWA & Mobile Experience

Check:

- Mobile responsiveness
- PWA manifest
- Service worker
- Installability
- Icons
- Offline behavior
- Loading states
- Error states
- Navigation
- Android browser compatibility
- Countdown behavior on mobile
- Prevention of accidental duplicate actions

11. Code Quality

Review the entire project for:

- Broken imports
- Runtime errors
- Build errors
- Missing environment variables
- Incorrect configuration
- Dead code
- Duplicate logic
- Incorrect calculations
- Race conditions
- Bad error handling
- Deployment problems
- Vercel compatibility issues

12. Audit Report

At the end, provide a clear report with these sections:

A. PASS

List everything that is correctly implemented.

B. FAIL

List every important problem found.

C. SECURITY RISKS

Rank security problems as:

- Critical
- High
- Medium
- Low

D. FINANCIAL/ACCOUNTING RISKS

Identify anything that could cause incorrect wallet balances, duplicate earnings, duplicate referrals, or unauthorized withdrawals.

E. REQUIRED FIXES

Give the exact files/components/functions that need to be changed and explain what each fix must accomplish.

F. FINAL VERDICT

State clearly whether the current TapBumber application is:

READY FOR DEPLOYMENT

or

NOT READY FOR DEPLOYMENT

Do not make assumptions. Base the audit on the actual source code and configuration available to you.