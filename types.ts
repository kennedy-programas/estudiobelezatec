
export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'Unhas' | 'Cabelo' | 'Estética' | 'Maquiagem';
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  observation?: string;
  total: number;
  status: 'Confirmado' | 'Pendente';
  createdAt: string;
  reviewed?: boolean;
}

export interface User {
  name: string;
  email: string;
  picture?: string;
  role: 'user' | 'admin';
}

export interface Review {
  id: string;
  userName: string;
  userPicture?: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
}
