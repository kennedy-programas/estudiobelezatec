
import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Pé e Mão',
    price: 50,
    description: 'Manicure e pedicure completas com esmaltação premium.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600&auto=format&fit=crop',
    category: 'Unhas'
  },
  {
    id: '2',
    name: 'Escova + Hidratação',
    price: 80,
    description: 'Escova modeladora com tratamento hidratante profundo.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    category: 'Cabelo'
  },
  {
    id: '3',
    name: 'Design de Sobrancelha',
    price: 35,
    description: 'Design personalizado com técnicas de visagismo.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=600&auto=format&fit=crop',
    category: 'Estética'
  },
  {
    id: '4',
    name: 'Maquiagem Profissional',
    price: 150,
    description: 'Make completa para eventos especiais e festas.',
    image: 'https://images.pexels.com/photos/35496497/pexels-photo-35496497.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Maquiagem'
  },
  {
    id: '5',
    name: 'Alongamento de Cílios',
    price: 180,
    description: 'Extensão de cílios fio a fio com efeito natural.',
    image: 'https://images.unsplash.com/photo-1735151226446-1d364b4adc2f?q=80&w=600&auto=format&fit=crop',
    category: 'Estética'
  },
  {
    id: '6',
    name: 'Coloração + Mechas',
    price: 250,
    description: 'Coloração completa com técnicas modernas.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop',
    category: 'Cabelo'
  }
];

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];
