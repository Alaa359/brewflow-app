import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="text-muted-foreground w-full max-w-sm rounded-lg border p-3 text-center text-xs">
        <p className="font-medium">Comptes de démonstration</p>
        <p>admin@brewflow.tn · serveur@brewflow.tn · cuisinier@brewflow.tn</p>
        <p>Mot de passe : password123</p>
      </div>
    </>
  );
}
