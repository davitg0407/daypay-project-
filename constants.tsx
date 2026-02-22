import React from 'react';
import { Truck, Sparkles, ShoppingBag, Brush, Shovel } from 'lucide-react';
import { Job } from './types';

export const CATEGORIES = [
  { id: 'moving', name: 'გადაზიდვა და ტრანსპორტირება', icon: <Truck className="w-6 h-6" />, color: 'bg-blue-500' },
  { id: 'cleaning', name: 'დასუფთავების სერვისი', icon: <Brush className="w-6 h-6" />, color: 'bg-emerald-500' },
  { id: 'delivery', name: 'სწრაფი კურიერი', icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-amber-500' },
  { id: 'gardening', name: 'ბაღი და ეზო', icon: <Shovel className="w-6 h-6" />, color: 'bg-lime-600' },
  { id: 'events', name: 'ღონისძიებების დახმარება', icon: <Sparkles className="w-6 h-6" />, color: 'bg-purple-500' },
];

export const GEORGIAN_CITIES = ['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 'ზუგდიდი', 'ფოთი'];

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'ავეჯის გადაზიდვაში დახმარება',
    description: 'ვეძებთ 2 ძლიერ ადამიანს როსტოვის ქუჩაზე მძიმე ავეჯის გადასატანად. საჭიროა ფიზიკური ძალა და სიფრთხილე მყიფე ნივთებთან.',
    category: 'moving',
    budget: 80,
    location: 'თბილისი, როსტოვის ქუჩა',
    coordinates: { lat: 41.6913, lng: 44.8219 },
    date: '2024-05-20',
    startTime: '10:00',
    endTime: '14:00',
    isUrgent: true,
    isFeatured: true,
    posterId: 'u1',
    status: 'OPEN'
  },
  {
    id: '2',
    title: 'ბინის დალაგება წვეულების შემდეგ',
    description: 'გვესაჭიროება პროფესიონალი დამლაგებელი 3-ოთახიანი ბინისთვის მცირე ღონისძიების შემდეგ. ყველა საჭირო ინვენტარი ადგილზეა.',
    category: 'cleaning',
    budget: 60,
    location: 'ბათუმი, ცენტრი',
    coordinates: { lat: 41.6434, lng: 41.6399 },
    date: '2024-05-21',
    startTime: '09:00',
    endTime: '13:00',
    isUrgent: false,
    isFeatured: true,
    posterId: 'u2',
    status: 'OPEN'
  },
  {
    id: '3',
    title: 'ყვავილების მიტანა საღამოს',
    description: 'საჭიროა 5 თაიგულის მიტანა ქუთაისის სხვადასხვა მისამართზე. აუცილებელია საკუთარი ტრანსპორტი (სკუტერი ან მანქანა). საწვავი ანაზღაურდება.',
    category: 'delivery',
    budget: 45,
    location: 'ქუთაისი',
    coordinates: { lat: 42.2662, lng: 42.7180 },
    date: '2024-05-19',
    startTime: '18:00',
    endTime: '21:00',
    isUrgent: false,
    isFeatured: false,
    posterId: 'u3',
    status: 'OPEN'
  }
];