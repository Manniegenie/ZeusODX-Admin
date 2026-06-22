import { LoginForm } from '../components/LoginForm';
import Bg from '../../../assets/img/auth-bg.jpg';
import Logo from '../../../assets/img/logo.png';

export function LoginPage() {
  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-gray-50"
      style={{
        backgroundImage: `url(${Bg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-md w-full space-y-5">
          <img
            src={Logo}
            alt="Logo"
            className="mx-auto h-12 w-auto"
            // style={{ filter: 'invert(1)' }}
          />
        <div className="w-full p-6 bg-card rounded-xl shadow-lg space-y-12 border border-border">
          <div>
          <h2 className="mt-6 text-center text-[24px] font-semibold text-foreground">
            Welcome back!
          </h2>
          <p className="text-[14px] font-light text-center text-muted-foreground">Log in to your ZeusODX Dashboard to continue.</p>
        </div>
        <LoginForm />
        <div className="text-center">
          <a
            href="/reset-password"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Forgot your password?
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}