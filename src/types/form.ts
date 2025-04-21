export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  idNumber: string;
  birthDate: string;
  gender: string;
}

export interface FormErrors {
  [key: string]: string;
} 