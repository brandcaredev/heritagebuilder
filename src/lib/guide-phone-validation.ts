const MIN_PHONE_DIGITS = 7;
const MAX_E164_DIGITS = 15;

export const isValidGuidePhoneNumber = (value: string) => {
  const phone = value.trim();
  if (!phone || !/^\+?[\d\s().-]+$/.test(phone)) return false;

  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return (
      digits.length >= MIN_PHONE_DIGITS &&
      digits.length <= MAX_E164_DIGITS &&
      /^[1-9]/.test(digits)
    );
  }

  if (digits.startsWith("00")) {
    const internationalDigits = digits.slice(2);
    return (
      internationalDigits.length >= MIN_PHONE_DIGITS &&
      internationalDigits.length <= MAX_E164_DIGITS &&
      /^[1-9]/.test(internationalDigits)
    );
  }

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_E164_DIGITS;
};
