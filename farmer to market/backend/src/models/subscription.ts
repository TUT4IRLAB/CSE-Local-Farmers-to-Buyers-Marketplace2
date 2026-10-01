export interface Subscription {
  id: string;
  farmerId: string;
  plan: 'monthly_basic' | 'yearly_premium';
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
