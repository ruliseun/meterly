import countries from "../config/constants/countries";

export const processPhoneNumber = async (phoneNumber: string, country = "nigeria") => {
  const passedNumber =
    country === "nigeria" ? phoneNumber.replace(/.*(\d{10})/, "$1") : phoneNumber.replace(/.*(\d{9})/, "$1");
  return passedNumber;
};

export const processPhoneNumberCode = (phoneNumber: string, country: string) => {
  if (!country) return { phone: null };
  const getCountry = countries.find((cty) => cty.name?.toLowerCase() === country?.toLowerCase());

  if (!getCountry) return { status: false, message: "Invalid country" };

  const parsedNumber = phoneNumber.replace(/.*(\d{10})/, "$1");

  return { status: true, phone: getCountry.dialCode + parsedNumber };
};

const NumberParserService = {
  processPhoneNumber,
};

export default NumberParserService;
