import { ResetPasswordForm } from '../components/ResetPasswordForm';
import Logo from '../../../assets/img/logo.png';

export function ResetPasswordPage() {
  return (
    <div
      className="w-screen bg-primary min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-5">
          <img
            src={Logo}
            alt="Logo"
            className="mx-auto h-12 w-auto"
            // style={{ filter: 'invert(1)' }}
          />
          <div className="w-full space-y-12 p-6 bg-card rounded-xl shadow-lg border border-border">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                Reset your password
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>
            <ResetPasswordForm />
            <div className="text-center">
              <a
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                Back to login
              </a>
            </div>
        </div>
      </div>
    </div>
  );
}