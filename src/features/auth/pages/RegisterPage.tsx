import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6 bg-card rounded-xl shadow-lg border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Sign in
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}