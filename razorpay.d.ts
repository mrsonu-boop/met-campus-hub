declare module "razorpay" {
  export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status?: string;
  }

  export interface RazorpayConstructorOptions {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrderCreateOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  export default class Razorpay {
    constructor(options: RazorpayConstructorOptions);
    orders: {
      create(options: RazorpayOrderCreateOptions): Promise<RazorpayOrder>;
    };
  }
}
