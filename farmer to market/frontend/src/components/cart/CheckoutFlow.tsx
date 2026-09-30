import React, { useState } from 'react';
import { CheckCircle2, CreditCard, MapPin, Package, User, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface CheckoutFlowProps {
  onComplete: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onComplete }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Package size={64} className="mx-auto text-secondary-300 mb-4" />
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Your cart is empty</h2>
        <p className="text-secondary-500 mb-8">Please add some items to your cart to proceed with checkout.</p>
        <a href="/products" className="btn-primary px-8 py-3">Return to Shop</a>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearCart();
    setStep(4);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-center gap-4 mb-12">
        {[
          { id: 1, label: 'Shipping', icon: MapPin },
          { id: 2, label: 'Payment', icon: CreditCard },
          { id: 3, label: 'Review', icon: Package },
          { id: 4, label: 'Success', icon: CheckCircle2 },
        ].map((s) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 transition-all ${step >= s.id ? 'text-primary-600' : 'text-secondary-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.id ? 'bg-primary-600 text-white' : 'bg-secondary-100'}`}>
                <s.icon size={14} />
              </div>
              <span className="hidden sm:inline font-medium text-sm">{s.label}</span>
            </div>
            {s.id < 4 && <div className={`w-12 h-0.5 ${step > s.id ? 'bg-primary-600' : 'bg-secondary-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
                <MapPin className="text-primary-600" /> Shipping Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                  <input type="text" defaultValue={user?.fullName} className="input-field" />
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Street Address</label>
                  <input type="text" defaultValue={user?.address?.street} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Suburb</label>
                  <input type="text" defaultValue={user?.address?.suburb} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">City</label>
                  <input type="text" defaultValue={user?.address?.city} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Province</label>
                  <input type="text" defaultValue={user?.address?.province} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Postal Code</label>
                  <input type="text" defaultValue={user?.address?.postalCode} className="input-field" />
                </div>
              </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3 mt-8 flex items-center justify-center gap-2">
                Continue to Payment <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
                <CreditCard className="text-primary-600" /> Payment Method
              </h3>
              <div className="space-y-4">
                <div className="p-4 border-2 border-primary-600 bg-primary-50 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CreditCard size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-secondary-900">Credit/Debit Card</p>
                      <p className="text-xs text-secondary-500">Visa, Mastercard, Maestro</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-primary-600" />
                </div>
                <div className="p-4 border border-secondary-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-50 rounded-lg shadow-sm">
                      <Truck size={20} className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-secondary-900">Instant EFT</p>
                      <p className="text-xs text-secondary-500">Ozow, PayFast, Peach Payments</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-secondary-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary py-3">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary py-3">Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
                <Package className="text-primary-600" /> Order Review
              </h3>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-secondary-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-secondary-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-secondary-100 pt-4 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep(2)} className="btn-secondary py-3">Back to Payment</button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white p-12 rounded-3xl border border-secondary-200 shadow-sm text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-secondary-500 mb-8">Thank you for supporting local farmers. Your order #FM-92834 is being prepared.</p>
              <div className="bg-secondary-50 p-6 rounded-2xl border border-secondary-100 max-w-sm mx-auto mb-8 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500">Estimated Delivery</span>
                  <span className="font-bold text-secondary-900">Oct 4, 2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500">Shipping to</span>
                  <span className="font-bold text-secondary-900 truncate ml-4">{user?.address?.city}, {user?.address?.state}</span>
                </div>
              </div>
              <button onClick={onComplete} className="btn-primary px-8 py-3">Return to Home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// We need to import Loader2 for the isProcessing state
import { Loader2, ArrowRight } from 'lucide-react';

export default CheckoutFlow;
