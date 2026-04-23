export interface CustomerLoginTextsDto {
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  passwordLabel?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  submitButton?: string;
  loadingButton?: string;
  noRoutes?: string;
  errors?: {
    emailRequired?: string;
    emailFormat?: string;
    emailNoSpaces?: string;
    passwordRequired?: string;
    passwordNoSpaces?: string;
  };
  modal?: {
    internalErrorTitle?: string;
    internalErrorMessage?: string;
    userNotFoundTitle?: string;
    userNotFoundMessage?: string;
    badRequestTitle?: string;
    badRequestMessage?: string;
    genericTitle?: string;
    genericMessage?: string;
  };
}
