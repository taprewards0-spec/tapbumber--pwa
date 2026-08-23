
Build a complete mobile-first Progressive Web App (PWA) called TapBumber.

TapBumber is a Nigerian Naira earning and referral platform with secure user accounts, activation packages, timed earning cycles, wallet balances, referral bonuses, withdrawals, notifications, a WhatsApp community link, and a secure admin control panel.

ONLY TWO ACTIVATION PACKAGES

Standard — ₦3,000

- Activation fee: ₦3,000
- Reward: ₦50 for each completed 2-hour cycle
- 12 cycles per daily earning period
- Maximum cycle earnings for 12 cycles: ₦600
- Referral bonus: ₦500 to the referrer after the referred user's activation is confirmed

Premium — ₦5,000

- Activation fee: ₦5,000
- Reward: ₦120 for each completed 2-hour cycle
- 12 cycles per daily earning period
- Maximum cycle earnings for 12 cycles: ₦1,440
- Referral bonus: ₦800 to the referrer after the referred user's activation is confirmed

Do NOT create any ₦7,500 or ₦10,000 package.

EARNING CYCLE AND CLAIM WINDOW

- Each earning cycle lasts exactly 2 hours.
- There are 12 cycles in each daily earning period.
- The daily earning period runs from 5:00 PM WAT to 5:00 PM WAT the following day.
- Cycle 1: 5 PM–7 PM.
- Continue every 2 hours through Cycle 12: 3 PM–5 PM.
- When a 2-hour cycle ends, its reward becomes claimable.
- The user has exactly 20 minutes to claim the reward.
- If the 20-minute claim window expires, that cycle's reward is forfeited and cannot be claimed later.
- A cycle can only be claimed once.
- Use server-side time and Africa/Lagos timezone.
- Display the current cycle, countdown, claim countdown, completed cycles, claimed cycles, and today's earnings.

REGISTRATION AND ACTIVATION

- Users can register and log in securely.
- Give every user a unique User ID and referral code.
- User selects either the ₦3,000 or ₦5,000 package.
- Activation must be manually verified by an administrator.
- Activation statuses: Not Activated, Pending, Activated, Rejected.
- Users can submit an activation request and payment proof/details.
- Never automatically mark an activation as successful before admin confirmation.

REFERRAL SYSTEM

- Every user receives a unique referral link/code.
- ₦3,000 confirmed activation → referrer receives ₦500.
- ₦5,000 confirmed activation → referrer receives ₦800.
- Give the normal referral bonus only once per successful activation.
- Pending or rejected activations do not count.
- Display referral count and referral earnings.

WEEKLY REFERRAL BONUS

- If a user gets 10 successful, admin-confirmed activations within the same week, credit an additional ₦5,000 weekly referral bonus.
- The 10 activations can be any combination of ₦3,000 and ₦5,000 packages.
- Each activated user counts only once.
- Automatically track the weekly count.
- Prevent duplicate weekly bonuses.

WALLET

Each user has a wallet displaying:

- Available balance
- Cycle earnings
- Referral earnings
- Weekly referral bonuses
- Transaction history
- Withdrawal history

Every earning and bonus must create a transaction record.
Users cannot manually change their wallet balance.

WITHDRAWALS

- Minimum withdrawal: ₦1,500.
- Withdrawal dates: 14th and 30th of every month.
- Withdrawal window: 6:00 AM–7:30 AM WAT.
- Withdrawal fee: 20%.
- Before confirmation, show the requested amount, 20% fee, and net amount.
- User can cancel before confirming.
- Collect bank name, account name, and account number.
- Withdrawal requests go to the administrator for approval.
- Admin can approve, reject, and mark approved withdrawals as paid.
- Never automatically mark a withdrawal as paid.

ADMIN BANK SETTINGS

Do NOT hard-code any personal bank details.

Create Admin Settings fields for:

- Bank Name
- Account Name
- Account Number
- Payment Instructions

The administrator will enter the real receiving account details privately after the app is built.

WHATSAPP GROUP

Add a Join WhatsApp Group option inside the user dashboard/menu.

When clicked, show a button that opens this TapBumber WhatsApp group:

https://chat.whatsapp.com/FFGIXhlJHMRKHOB3hhp3fb?s=cl&p=a&ilr=1

USER DASHBOARD

Create a clean professional mobile-first TAPBUMBER dashboard showing:

- Wallet balance
- Selected package
- Activation status
- Current cycle
- 2-hour cycle countdown
- 20-minute claim countdown when a reward is available
- Reward per cycle
- Today's earnings
- Completed/claimed cycles
- Claim button
- Referral section
- Weekly referral progress
- Withdrawal section
- Transaction history
- Notifications
- Join WhatsApp Group
- Help & FAQ

ADMIN PANEL

Create a secure administrator dashboard with:

- Overview
- Users
- Activations
- Withdrawals
- Transactions
- Referrals
- Weekly referral bonuses
- Notifications
- Settings
- Help & FAQ

Admin must be able to:

- Search and view users
- Review activation requests
- Approve/reject activations
- View withdrawals
- Approve/reject withdrawals
- Mark withdrawals as paid
- View transactions
- View referral activity
- View weekly referral progress
- Send notifications
- Configure activation payment details

SECURITY

- Secure authentication.
- Protect admin routes.
- Server-side validation for all financial operations.
- Prevent duplicate cycle claims.
- Prevent duplicate referral bonuses.
- Prevent duplicate weekly bonuses.
- Prevent withdrawals above available balance.
- Maintain an audit trail for important admin actions.
- Users cannot access admin functions or modify wallet balances.

DESIGN

Make the application modern, professional, trustworthy, and mobile-first.

Use Nigerian Naira (₦) throughout the app and prominently brand it TAPBUMBER.

Build a real functional full-stack application with database, authentication, backend business logic, user dashboard, admin panel, wallet, activation system, earning-cycle engine, referral system, withdrawals, notifications, and all required pages.

These rules are the source of truth. Do not invent additional packages or change any amounts or timing rules.