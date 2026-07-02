type OtpInputPlaceholderProps = {
  length?: number;
};

export function OtpInputPlaceholder({ length = 6 }: OtpInputPlaceholderProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-brand-navy">
        OTP code
      </legend>
      <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <label className="sr-only" htmlFor={`otp-${index + 1}`} key={`label-${index + 1}`}>
            OTP digit {index + 1}
          </label>
        ))}
        {Array.from({ length }).map((_, index) => (
          <input
            className="aspect-square min-h-12 rounded-lg border border-slate-300 bg-white text-center text-xl font-bold text-brand-navy focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20"
            id={`otp-${index + 1}`}
            inputMode="numeric"
            key={`otp-${index + 1}`}
            maxLength={1}
            type="text"
          />
        ))}
      </div>
    </fieldset>
  );
}
