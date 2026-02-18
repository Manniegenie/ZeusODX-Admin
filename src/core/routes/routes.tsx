import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from '@/core/guards/AuthGuard';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { PlatformStats } from '@/features/dashboard/pages/PlatformStats';
import { UserList } from '@/features/users/pages/UserList';
import { FeesAndRates } from '@/features/fees/pages/FeesAndRates';
import { EditFee } from '@/features/fees/pages/EditFee';
import { EditNetworkName } from '@/features/fees/pages/EditNetworkName';
import { SearchFee } from '@/features/fees/pages/SearchFee';
import { ViewFee } from '@/features/fees/pages/ViewFee';
import { CryptoFeesManagement } from '@/features/fees/pages/CryptoFeesManagement';
import { AddCryptoFee } from '@/features/fees/pages/AddCryptoFee';
import { FundingAndBalances } from '@/features/funding/pages/FundingAndBalances';
import { Security } from '@/features/security/pages/Security';
import { AuditAndMonitoring } from '@/features/audit/pages/AuditAndMonitoring';
import { Settings } from '@/features/settings/pages/Settings';
import { Disable2Fa } from '@/features/users/pages/Disable2Fa';
import { RemovePassword } from '@/features/users/pages/RemovePassword';
import { UserWallet } from '@/features/funding/pages/UserWallet';
import { GiftCardRates } from '@/features/giftcard/pages/GiftCardRates';
import { PriceCalculator } from '@/features/fees/pages/PriceCalculator';
import { CreateNewAdmin } from '@/features/users/pages/CreateNewAdmin';
import { DeductBalance } from '@/features/funding/pages/DeductBalance';
import { WalletGenerateByPhone } from '@/features/users/pages/WalletGenerateByPhone';
import { RegenerateWalletByPhone } from '@/features/users/pages/RegenerateWalletByPhone';
import { Summary } from '@/features/users/pages/Summary';
import { UserActions } from '@/features/users/pages/UserActions';
import { BlockUser } from '@/features/users/pages/BlockUser';
import { KYCReview } from '@/features/kyc/pages/KYCReview';
import { KYCDetail } from '@/features/kyc/pages/KYCDetail';
import { NotificationsManagement } from '@/features/notifications/pages/NotificationsManagement';
import { ScheduledNotifications } from '@/features/notifications/pages/ScheduledNotifications';
import { ScheduledGiftCardNotifications } from '@/features/notifications/pages/ScheduledGiftCardNotifications';
import { PriceMarkdown } from '@/features/fees/pages/PriceMarkdown';
import { OnrampManagement } from '@/features/fees/pages/OnrampManagement';
import { OfframpManagement } from '@/features/fees/pages/OfframpManagement';
import { GiftCardSubmissions } from '@/features/giftcard/pages/GiftCardSubmissions';
import { GiftCardSubmissionDetail } from '@/features/giftcard/pages/GiftCardSubmissionDetail';
import { AdminSettings } from '@/features/admin-settings/pages/AdminSettings';
import { Admin2FASetup } from '@/features/admin-settings/pages/Admin2FASetup';
import { BannerManagement } from '@/features/banners/pages/BannerManagement';
import { TransactionDetail } from '@/features/dashboard/pages/TransactionDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            path: '',
            element: <Dashboard />,
          },
          {
            path: 'platform-stats',
            element: <PlatformStats />,
          },
          {
            path: 'users',
            element: <UserList />,
          },
          {
            path: 'kyc',
            element: <KYCReview />,
          },
          {
            path: 'kyc/:kycId',
            element: <KYCDetail />,
          },
          {
            path: 'user-management/actions',
            element: <UserActions />,
          },
          {
            path: 'user-management/summary',
            element: <Summary />,
          },
          {
            path: 'user-management/disable-2fa',
            element: <Disable2Fa />,
          },
          {
            path: 'user-management/create-new-admin',
            element: <CreateNewAdmin />,
          },
          {
            path: 'user-management/remove-password',
            element: <RemovePassword />,
          },
          {
            path: 'user-management/fetch-wallets',
            element: <UserWallet />,
          },
          {
            path: 'user-management/deduct-balance',
            element: <DeductBalance />,
          },
          {
            path: 'user-management/wallet-generation',
            element: <RemovePassword />,
          },
          {
            path: 'user-management/generate-wallet-by-phone',
            element: <WalletGenerateByPhone />,
          },
          {
            path: 'user-management/regenerate-wallet-by-phone',
            element: <RegenerateWalletByPhone />,
          },
          {
            path: 'user-management/block-user',
            element: <BlockUser />,
          },
          {
            path: 'fees-rates',
            element: <FeesAndRates />,
          },
          {
            path: 'fees-rates/crypto-fees-management',
            element: <CryptoFeesManagement />,
          },
          {
            path: 'fees-rates/add-crypto-fee',
            element: <AddCryptoFee />,
          },
          {
            path: 'fees-rates/gift-card-rates',
            element: <GiftCardRates />,
          },
          {
            path: 'giftcards/submissions',
            element: <GiftCardSubmissions />,
          },
          {
            path: 'giftcards/submissions/:submissionId',
            element: <GiftCardSubmissionDetail />,
          },
          {
            path: 'fees-rates/onramp-management',
            element: <OnrampManagement />,
          },
          {
            path: 'fees-rates/offramp-management',
            element: <OfframpManagement />,
          },
          {
            path: 'fees-rates/price-markdown',
            element: <PriceMarkdown />,
          },
          {
            path: 'fees-rates/price-calculator',
            element: <PriceCalculator />,
          },
          {
            path: 'fees-rates/edit-fee',
            element: <EditFee />,
          },
          {
            path: 'fees-rates/edit-network-name',
            element: <EditNetworkName />,
          },
          {
            path: 'fees-rates/view-specific-fee',
            element: <ViewFee />,
          },
          {
            path: 'fees-rates/view/:currency/:network',
            element: <ViewFee />,
          },
          {
            path: 'fees-rates/search',
            element: <SearchFee />,
          },
          {
            path: 'funding',
            element: <FundingAndBalances />,
          },
          {
            path: 'security',
            element: <Security />,
          },
          {
            path: 'audit',
            element: <AuditAndMonitoring />,
          },
          {
            path: 'notifications',
            element: <NotificationsManagement />,
          },
          {
            path: 'scheduled-notifications',
            element: <ScheduledNotifications />,
          },
          {
            path: 'scheduled-giftcard-notifications',
            element: <ScheduledGiftCardNotifications />,
          },
          {
            path: 'banners',
            element: <BannerManagement />,
          },
          {
            path: 'admin-settings',
            element: <AdminSettings />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'transaction/:transactionId',
            element: <TransactionDetail />,
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'register',
    element: <RegisterPage />,
  },
  {
    path: 'reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: 'admin-2fa-setup',
    element: <Admin2FASetup />,
  },
]);