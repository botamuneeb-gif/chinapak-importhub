type AuthErrorMessageProps = {
  message?: string;
};

export function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="rounded-lg border border-brand-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-brand-error"
      role="alert"
    >
      {message}
    </p>
  );
}
