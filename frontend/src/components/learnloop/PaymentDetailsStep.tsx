import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Chip
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface PaymentDetailsPayload {
  listedPrice: { INR: number; USD: number; EUR: number; GBP: number };
  sellingPrice: { INR: number; USD: number; EUR: number; GBP: number };
  globalPricingEnabled: boolean;
  currencySpecificPricingEnabled: boolean;
  /** Which currencies are enabled for payments (e.g. { INR: true, USD: false, EUR: false, GBP: false }) */
  enabledCurrencies: { [key: string]: boolean };
  installmentsOn: boolean;
  installmentPeriod: number;
  numberOfInstallments: number;
  bufferTime: number;
  paymentMethods: Record<string, { [key: string]: boolean }>;
  requirePaymentBeforeAccess: boolean;
  sendPaymentReceipts: boolean;
  enableAutomaticInvoicing: boolean;
}

export interface PaymentDetailsInitialData extends PaymentDetailsPayload {}

export interface PaymentDetailsStepRef {
  getPaymentDetails: () => PaymentDetailsPayload;
}

interface PaymentDetailsStepProps {
  initialData?: PaymentDetailsInitialData | null;
  paymentDetailsRef?: React.RefObject<PaymentDetailsStepRef | null>;
}

const PaymentDetailsStep: React.FC<PaymentDetailsStepProps> = React.memo(({ initialData, paymentDetailsRef }) => {
  const [, setPricingMode] = React.useState<'global' | 'currency-specific'>('global');
  const [globalPricingEnabled, setGlobalPricingEnabled] = React.useState(true);
  const [currencySpecificPricingEnabled, setCurrencySpecificPricingEnabled] = React.useState(false);
  const [globalListPrice, setGlobalListPrice] = React.useState('15');
  const [globalActualPrice, setGlobalActualPrice] = React.useState('10');
  const [currencyListPrices, setCurrencyListPrices] = React.useState<{ [key: string]: string }>({
    'USD': '15',
    'EUR': '12',
    'GBP': '10',
    'INR': '1200'
  });
  const [currencyActualPrices, setCurrencyActualPrices] = React.useState<{ [key: string]: string }>({
    'USD': '10',
    'EUR': '8',
    'GBP': '7',
    'INR': '750'
  });
  const [enabledCurrencies, setEnabledCurrencies] = React.useState<{ [key: string]: boolean }>({
    'USD': true,
    'EUR': true,
    'GBP': true,
    'INR': true
  });

  // Memoize expensive data structures (includes Buy Now Pay Later)
  const universalPaymentMethods = React.useMemo(() => ({
    'Credit/Debit Cards': true,
    'PayPal': true,
    'Stripe': true,
    'Apple Pay': true,
    'Google Pay': true,
    'Bank Transfer': true,
    'Buy Now Pay Later': true
  }), []);

  const paymentMethodsByCurrency = React.useMemo((): { [key: string]: { [key: string]: boolean } } => ({
    'USD': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'Bank Transfer': false,
      'Buy Now Pay Later': true
    },
    'EUR': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'SEPA Transfer': true,
      'Bank Transfer': true,
      'Buy Now Pay Later': true
    },
    'GBP': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'Bank Transfer': true,
      'Buy Now Pay Later': true
    },
    'INR': {
      'Credit/Debit Cards': true,
      'UPI': true,
      'Paytm': true,
      'Razorpay': true,
      'Net Banking': true,
      'PayPal': false,
      'Google Pay': true,
      'Buy Now Pay Later': true
    }
  }), []);

  const [enabledUniversalPaymentMethods, setEnabledUniversalPaymentMethods] = React.useState<{ [key: string]: boolean }>({
    'Credit/Debit Cards': true,
    'PayPal': true,
    'Stripe': true,
    'Apple Pay': true,
    'Google Pay': true,
    'Bank Transfer': true,
    'Buy Now Pay Later': true
  });

  // EMI/Installment Configuration
  const [emiEnabled, setEmiEnabled] = React.useState(false);
  const [installmentPeriod, setInstallmentPeriod] = React.useState(3);
  const [numberOfInstallments, setNumberOfInstallments] = React.useState(2);
  const [bufferTime, setBufferTime] = React.useState(0);
  const [, setInstallmentPrices] = React.useState<{ [key: number]: string }>({});

  const [enabledPaymentMethods, setEnabledPaymentMethods] = React.useState<{ [key: string]: { [key: string]: boolean } }>({
    'USD': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'Bank Transfer': false,
      'Buy Now Pay Later': true
    },
    'EUR': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'SEPA Transfer': true,
      'Bank Transfer': true,
      'Buy Now Pay Later': true
    },
    'GBP': {
      'Credit/Debit Cards': true,
      'PayPal': true,
      'Stripe': true,
      'Apple Pay': true,
      'Google Pay': true,
      'Bank Transfer': true,
      'Buy Now Pay Later': true
    },
    'INR': {
      'Credit/Debit Cards': true,
      'UPI': true,
      'Paytm': true,
      'Razorpay': true,
      'Net Banking': true,
      'PayPal': false,
      'Apple Pay': false,
      'Google Pay': true,
      'Buy Now Pay Later': true
    }
  });

  // Payment settings (persisted)
  const [requirePaymentBeforeAccess, setRequirePaymentBeforeAccess] = React.useState(true);
  const [sendPaymentReceipts, setSendPaymentReceipts] = React.useState(true);
  const [enableAutomaticInvoicing, setEnableAutomaticInvoicing] = React.useState(false);

  // Currency symbol mapping
  const _currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹'
  };

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  const handleCurrencyActualPriceChange = (currencyCode: string, price: string) => {
    setCurrencyActualPrices(prev => ({
      ...prev,
      [currencyCode]: price
    }));
  };

  const handleCurrencyListPriceChange = (currencyCode: string, price: string) => {
    setCurrencyListPrices(prev => ({
      ...prev,
      [currencyCode]: price
    }));
  };

  // Validation functions for price relationships
  const validateListPrice = (listPrice: string, actualPrice: string) => {
    const list = parseFloat(listPrice) || 0;
    const actual = parseFloat(actualPrice) || 0;
    return list >= actual;
  };

  const validateActualPrice = (actualPrice: string, listPrice: string) => {
    const actual = parseFloat(actualPrice) || 0;
    const list = parseFloat(listPrice) || 0;
    return actual <= list;
  };

  // Calculate discount percentage and amount
  const calculateDiscount = (listPrice: string, actualPrice: string) => {
    const list = parseFloat(listPrice) || 0;
    const actual = parseFloat(actualPrice) || 0;
    
    if (list <= 0 || actual >= list) return { percentage: 0, amount: 0 };
    
    const discountAmount = list - actual;
    const discountPercentage = ((discountAmount / list) * 100);
    
    return {
      percentage: Math.round(discountPercentage),
      amount: discountAmount
    };
  };

  const handleCurrencyToggle = (currencyCode: string, enabled: boolean) => {
    setEnabledCurrencies(prev => ({
      ...prev,
      [currencyCode]: enabled
    }));
    
    // Update payment methods based on enabled currencies
    updatePaymentMethods();
  };

  const updatePaymentMethods = () => {
    const newPaymentMethods: { [key: string]: { [key: string]: boolean } } = {};
    
    // Initialize payment methods for each currency
    Object.keys(enabledCurrencies).forEach(currencyCode => {
      if (enabledCurrencies[currencyCode]) {
        const methods = paymentMethodsByCurrency[currencyCode];
        if (methods) {
          newPaymentMethods[currencyCode] = { ...methods };
        }
      }
    });
    
    setEnabledPaymentMethods(newPaymentMethods);
  };

  const handlePaymentMethodToggle = (currencyCode: string, methodName: string, enabled: boolean) => {
    setEnabledPaymentMethods(prev => ({
      ...prev,
      [currencyCode]: {
        ...prev[currencyCode],
        [methodName]: enabled
      }
    }));
  };

  const handleUniversalPaymentMethodToggle = (methodName: string, enabled: boolean) => {
    setEnabledUniversalPaymentMethods(prev => ({
      ...prev,
      [methodName]: enabled
    }));
  };

  const _handleInstallmentPriceChange = (installmentNumber: number, price: string) => {
    setInstallmentPrices(prev => ({
      ...prev,
      [installmentNumber]: price
    }));
  };

  const calculateEmiAmount = () => {
    const inrPrice = parseFloat(currencyActualPrices['INR'] || '0');
    if (inrPrice <= 0 || numberOfInstallments <= 0) return 0;
    
    // Simple EMI calculation: Total Amount / Number of Installments
    const emiAmount = inrPrice / numberOfInstallments;
    return Math.round(emiAmount); // Round to nearest rupee
  };

  const calculateEmiPlan = () => {
    const inrPrice = parseFloat(currencyActualPrices['INR'] || '0');
    const emiAmount = calculateEmiAmount();
    const totalDays = installmentPeriod * 30; // Approximate days per month
    const daysPerInstallment = Math.floor(totalDays / numberOfInstallments);
    
    // Calculate installment amounts (last installment gets the remainder)
    const calculatedInstallments: { [key: number]: number } = {};
    let remainingAmount = inrPrice;
    
    for (let i = 1; i <= numberOfInstallments; i++) {
      if (i === numberOfInstallments) {
        // Last installment gets the remaining amount
        calculatedInstallments[i] = remainingAmount;
      } else {
        calculatedInstallments[i] = emiAmount;
        remainingAmount -= emiAmount;
      }
    }
    
    return {
      totalAmount: inrPrice,
      emiAmount,
      calculatedInstallments,
      daysPerInstallment,
      totalDays,
      remainingDays: totalDays
    };
  };

  // Initialize payment methods on component mount
  React.useEffect(() => {
    updatePaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // Hydrate from initialData when course is loaded in builder or when returning to step 4
  React.useEffect(() => {
    if (!initialData) return;
    setGlobalPricingEnabled(!!initialData.globalPricingEnabled);
    setCurrencySpecificPricingEnabled(!!initialData.currencySpecificPricingEnabled);
    const lp = (initialData.listedPrice || {}) as { USD?: number; INR?: number; EUR?: number; GBP?: number };
    const sp = (initialData.sellingPrice || {}) as { USD?: number; INR?: number; EUR?: number; GBP?: number };
    setGlobalListPrice(String(lp.USD ?? lp.INR ?? 0));
    setGlobalActualPrice(String(sp.USD ?? sp.INR ?? 0));
    setCurrencyListPrices({
      USD: String(lp.USD ?? 0),
      EUR: String(lp.EUR ?? 0),
      GBP: String(lp.GBP ?? 0),
      INR: String(lp.INR ?? 0)
    });
    setCurrencyActualPrices({
      USD: String(sp.USD ?? 0),
      EUR: String(sp.EUR ?? 0),
      GBP: String(sp.GBP ?? 0),
      INR: String(sp.INR ?? 0)
    });
    // Restore which currencies are enabled/disabled (e.g. only INR on, others off)
    if (initialData.enabledCurrencies && typeof initialData.enabledCurrencies === 'object') {
      const ec = initialData.enabledCurrencies as { [key: string]: boolean };
      setEnabledCurrencies(prev => ({ ...prev, ...ec }));
    }
    setEmiEnabled(!!initialData.installmentsOn);
    setInstallmentPeriod(initialData.installmentPeriod ?? 3);
    setNumberOfInstallments(initialData.numberOfInstallments ?? 2);
    setBufferTime(initialData.bufferTime ?? 0);
    setRequirePaymentBeforeAccess(!!initialData.requirePaymentBeforeAccess);
    setSendPaymentReceipts(initialData.sendPaymentReceipts !== false);
    setEnableAutomaticInvoicing(!!initialData.enableAutomaticInvoicing);
    if (initialData.paymentMethods && typeof initialData.paymentMethods === 'object') {
      const pm = initialData.paymentMethods as Record<string, { [key: string]: boolean }>;
      if (pm.universal && typeof pm.universal === 'object') {
        setEnabledUniversalPaymentMethods(prev => ({ ...prev, ...pm.universal }));
      }
      const { universal: _u, ...perCurrency } = pm;
      // Restore payment method toggles for all currencies (merge so disabled currencies keep their last-saved methods)
      const allCurrencyCodes = ['USD', 'EUR', 'GBP', 'INR'];
      const merged: Record<string, { [key: string]: boolean }> = {};
      allCurrencyCodes.forEach(code => {
        if (perCurrency[code] && typeof perCurrency[code] === 'object') {
          merged[code] = { ...(paymentMethodsByCurrency[code] || {}), ...perCurrency[code] };
        } else if (paymentMethodsByCurrency[code]) {
          merged[code] = { ...paymentMethodsByCurrency[code] };
        }
      });
      if (Object.keys(merged).length > 0) {
        setEnabledPaymentMethods(prev => ({ ...prev, ...merged }));
      }
    }
  }, [initialData]);

  const getPaymentDetails = React.useCallback((): PaymentDetailsPayload => {
    const toNum = (v: string) => Math.max(0, parseFloat(v) || 0);
    const listedPrice = {
      INR: currencySpecificPricingEnabled ? toNum(currencyListPrices.INR) : (globalPricingEnabled ? toNum(globalListPrice) : 0),
      USD: currencySpecificPricingEnabled ? toNum(currencyListPrices.USD) : (globalPricingEnabled ? toNum(globalListPrice) : 0),
      EUR: currencySpecificPricingEnabled ? toNum(currencyListPrices.EUR) : (globalPricingEnabled ? toNum(globalListPrice) : 0),
      GBP: currencySpecificPricingEnabled ? toNum(currencyListPrices.GBP) : (globalPricingEnabled ? toNum(globalListPrice) : 0)
    };
    const sellingPrice = {
      INR: currencySpecificPricingEnabled ? toNum(currencyActualPrices.INR) : (globalPricingEnabled ? toNum(globalActualPrice) : 0),
      USD: currencySpecificPricingEnabled ? toNum(currencyActualPrices.USD) : (globalPricingEnabled ? toNum(globalActualPrice) : 0),
      EUR: currencySpecificPricingEnabled ? toNum(currencyActualPrices.EUR) : (globalPricingEnabled ? toNum(globalActualPrice) : 0),
      GBP: currencySpecificPricingEnabled ? toNum(currencyActualPrices.GBP) : (globalPricingEnabled ? toNum(globalActualPrice) : 0)
    };
    if (globalPricingEnabled && !currencySpecificPricingEnabled) {
      const g = toNum(globalListPrice);
      const s = toNum(globalActualPrice);
      listedPrice.INR = g; listedPrice.USD = g; listedPrice.EUR = g; listedPrice.GBP = g;
      sellingPrice.INR = s; sellingPrice.USD = s; sellingPrice.EUR = s; sellingPrice.GBP = s;
    }
    return {
      listedPrice,
      sellingPrice,
      globalPricingEnabled,
      currencySpecificPricingEnabled,
      enabledCurrencies: { ...enabledCurrencies },
      installmentsOn: emiEnabled,
      installmentPeriod,
      numberOfInstallments,
      bufferTime,
      paymentMethods: {
        universal: { ...enabledUniversalPaymentMethods },
        ...enabledPaymentMethods
      },
      requirePaymentBeforeAccess,
      sendPaymentReceipts,
      enableAutomaticInvoicing
    };
  }, [
    currencySpecificPricingEnabled, currencyListPrices, currencyActualPrices, globalPricingEnabled, globalListPrice, globalActualPrice,
    enabledCurrencies,
    emiEnabled, installmentPeriod, numberOfInstallments, bufferTime,
    enabledUniversalPaymentMethods, enabledPaymentMethods,
    requirePaymentBeforeAccess, sendPaymentReceipts, enableAutomaticInvoicing
  ]);

  React.useImperativeHandle(paymentDetailsRef, () => ({
    getPaymentDetails
  }), [getPaymentDetails]);

  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #FFD600 0%, #00FFC6 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight={800} color="white" gutterBottom>
                Payment Configuration
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                Set up payment methods and pricing for your course
              </Typography>
              <Chip
                icon={<PaymentIcon />}
                label="Payment Setup"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <PaymentIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.1)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#6C63FF" gutterBottom>
                  Payment Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Configure payment methods and pricing for your course
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Switch
                  checked={true}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FFD600',
                      '&:hover': { backgroundColor: 'rgba(255, 214, 0, 0.08)' }
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FFD600'
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Payment Enabled
                </Typography>
              </Box>
            </Stack>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
              <Stack spacing={3}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#6C63FF' }} />
                    Pricing Configuration
                  </Typography>
                  
                  {/* Pricing Mode Selection */}
                  <Stack spacing={3} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                      Pricing Strategy
                    </Typography>
                    
                    {/* Global Pricing Toggle */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Global Pricing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Set one price for all currencies with automatic conversion
                        </Typography>
                      </Box>
                      <Switch
                        checked={globalPricingEnabled}
                        onChange={(e) => {
                          setGlobalPricingEnabled(e.target.checked);
                          if (e.target.checked) {
                            setCurrencySpecificPricingEnabled(false);
                            setPricingMode('global');
                          }
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6C63FF',
                            '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.08)' }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6C63FF'
                          }
                        }}
                      />
                    </Stack>

                    {/* Currency-Specific Pricing Toggle */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Currency-Specific Pricing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Set different prices for each currency
                        </Typography>
                      </Box>
                      <Switch
                        checked={currencySpecificPricingEnabled}
                        onChange={(e) => {
                          setCurrencySpecificPricingEnabled(e.target.checked);
                          if (e.target.checked) {
                            setGlobalPricingEnabled(false);
                            setPricingMode('currency-specific');
                          }
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6C63FF',
                            '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.08)' }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6C63FF'
                          }
                        }}
                      />
                    </Stack>


                  </Stack>

                  {/* Global Pricing */}
                  {globalPricingEnabled && (
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="List Price (MRP)"
                          type="number"
                          placeholder="0.00"
                          value={globalListPrice}
                          onChange={(e) => setGlobalListPrice(e.target.value)}
                          error={!validateListPrice(globalListPrice, globalActualPrice)}
                          helperText={!validateListPrice(globalListPrice, globalActualPrice) ? "List price must be higher than actual price" : ""}
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                            }
                          }}
                        />
                        <TextField
                          label="Actual Price (Selling Price)"
                          type="number"
                          placeholder="0.00"
                          value={globalActualPrice}
                          onChange={(e) => setGlobalActualPrice(e.target.value)}
                          error={!validateActualPrice(globalActualPrice, globalListPrice)}
                          helperText={!validateActualPrice(globalActualPrice, globalListPrice) ? "Actual price must be lower than list price" : ""}
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                            }
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        <strong>List Price (MRP):</strong> Original advertised price before discounts<br/>
                        <strong>Actual Price:</strong> Final price customers pay after discounts
                      </Typography>
                      
                      {/* Discount Display */}
                      {(() => {
                        const discount = calculateDiscount(globalListPrice, globalActualPrice);
                        if (discount.percentage > 0) {
                          return (
                            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600} color="green">
                                    🎉 Discount Applied
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {discount.percentage}% off - Save ${discount.amount.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${discount.percentage}% OFF`}
                                  sx={{
                                    backgroundColor: 'green',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </Stack>
                            </Paper>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Universal Payment Methods for Global Pricing */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Universal Payment Methods:
                        </Typography>
                        <Stack spacing={1}>
                          {Object.keys(universalPaymentMethods).map((method) => (
                            <FormControlLabel
                              key={method}
                              control={
                                <Switch
                                  checked={enabledUniversalPaymentMethods[method]}
                                  onChange={(e) => handleUniversalPaymentMethodToggle(method, e.target.checked)}
                                  size="small"
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#00FFC6',
                                      '&:hover': { backgroundColor: 'rgba(0, 255, 198, 0.08)' }
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#00FFC6'
                                    }
                                  }}
                                />
                              }
                              label={method}
                              sx={{ 
                                '& .MuiFormControlLabel-label': { 
                                  fontSize: '0.875rem',
                                  color: 'text.secondary'
                                } 
                              }}
                            />
                          ))}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 255, 198, 0.05)', borderRadius: 2 }}>
                          💡 <strong>Note:</strong> These payment methods work globally across all currencies with automatic conversion.
                        </Typography>
                      </Box>
                    </Stack>
                  )}

                  {/* Currency-Specific Pricing */}
                  {currencySpecificPricingEnabled && (
                    <Stack spacing={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Enable currencies and set prices for your target markets:
                      </Typography>
                      
                      {currencies.map((currency) => (
                        <Paper key={currency.code} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(108, 99, 255, 0.1)' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {currency.name} ({currency.code})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {enabledCurrencies[currency.code] ? 'Enabled for payments' : 'Disabled for payments'}
                              </Typography>
                            </Box>
                            <Switch
                              checked={enabledCurrencies[currency.code]}
                              onChange={(e) => handleCurrencyToggle(currency.code, e.target.checked)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#6C63FF',
                                  '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.08)' }
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#6C63FF'
                                }
                              }}
                            />
                          </Stack>
                          
                          {enabledCurrencies[currency.code] && (
                            <>
                              <Stack direction="row" spacing={2}>
                                <TextField
                                  label={`${currency.name} List Price (MRP)`}
                                  type="number"
                                  placeholder="0.00"
                                  value={currencyListPrices[currency.code]}
                                  onChange={(e) => handleCurrencyListPriceChange(currency.code, e.target.value)}
                                  error={!validateListPrice(currencyListPrices[currency.code], currencyActualPrices[currency.code])}
                                  helperText={!validateListPrice(currencyListPrices[currency.code], currencyActualPrices[currency.code]) ? "List price must be higher than actual price" : ""}
                                  fullWidth
                                  InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>{currency.symbol}</Typography>
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                    }
                                  }}
                                />
                                <TextField
                                  label={`${currency.name} Actual Price (Selling Price)`}
                                  type="number"
                                  placeholder="0.00"
                                  value={currencyActualPrices[currency.code]}
                                  onChange={(e) => handleCurrencyActualPriceChange(currency.code, e.target.value)}
                                  error={!validateActualPrice(currencyActualPrices[currency.code], currencyListPrices[currency.code])}
                                  helperText={!validateActualPrice(currencyActualPrices[currency.code], currencyListPrices[currency.code]) ? "Actual price must be lower than list price" : ""}
                                  fullWidth
                                  InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>{currency.symbol}</Typography>
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                    }
                                  }}
                                />
                              </Stack>
                              
                              {/* Discount Display for Currency */}
                              {(() => {
                                const discount = calculateDiscount(currencyListPrices[currency.code], currencyActualPrices[currency.code]);
                                if (discount.percentage > 0) {
                                  return (
                                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', mt: 2 }}>
                                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                          <Typography variant="subtitle2" fontWeight={600} color="green">
                                            🎉 {currency.name} Discount
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {discount.percentage}% off - Save {currency.symbol}{discount.amount.toLocaleString()}
                                          </Typography>
                                        </Box>
                                        <Chip
                                          label={`${discount.percentage}% OFF`}
                                          sx={{
                                            backgroundColor: 'green',
                                            color: 'white',
                                            fontWeight: 600
                                          }}
                                        />
                                      </Stack>
                                    </Paper>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Payment Methods for this Currency */}
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Payment Methods for {currency.name}:
                                </Typography>
                                <Stack spacing={1}>
                                  {enabledPaymentMethods[currency.code] && 
                                    Object.keys(enabledPaymentMethods[currency.code]).map((method) => (
                                      <FormControlLabel
                                        key={method}
                                        control={
                                          <Switch
                                            checked={enabledPaymentMethods[currency.code][method]}
                                            onChange={(e) => handlePaymentMethodToggle(currency.code, method, e.target.checked)}
                                            size="small"
                                            sx={{
                                              '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#00FFC6',
                                                '&:hover': { backgroundColor: 'rgba(0, 255, 198, 0.08)' }
                                              },
                                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#00FFC6'
                                              }
                                            }}
                                          />
                                        }
                                        label={method}
                                        sx={{ 
                                          '& .MuiFormControlLabel-label': { 
                                            fontSize: '0.875rem',
                                            color: 'text.secondary'
                                          } 
                                        }}
                                      />
                                    ))
                                  }
                                </Stack>
                              </Box>
                            </>
                          )}
                        </Paper>
                      ))}
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 2, bgcolor: 'rgba(108, 99, 255, 0.05)', borderRadius: 2 }}>
                        💡 <strong>Tip:</strong> Only enable currencies for countries where you expect students to sign up. This helps keep your pricing focused and relevant.
                      </Typography>
                    </Stack>
                  )}

                  {/* No Pricing Enabled Message */}
                  {!globalPricingEnabled && !currencySpecificPricingEnabled && (
                    <Stack spacing={2}>
                      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        Please enable at least one pricing strategy to configure course pricing.
                      </Typography>
                    </Stack>
                  )}
                </Paper>



                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#FFD600' }} />
                    Payment Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableAutomaticInvoicing}
                          onChange={(e) => setEnableAutomaticInvoicing(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C63FF' }
                          }}
                        />
                      }
                      label="Enable automatic invoicing"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={requirePaymentBeforeAccess}
                          onChange={(e) => setRequirePaymentBeforeAccess(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C63FF' }
                          }}
                        />
                      }
                      label="Require payment before access"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sendPaymentReceipts}
                          onChange={(e) => setSendPaymentReceipts(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C63FF' }
                          }}
                        />
                      }
                      label="Send payment receipts"
                    />
                  </Stack>
                </Paper>

                {/* EMI/Installment Configuration - Only for INR */}
                {enabledCurrencies['INR'] && (
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#6C63FF' }} />
                          EMI/Installment Plans (INR Only)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Configure installment payment options for Indian Rupee payments
                        </Typography>
                      </Box>
                      <Switch
                        checked={emiEnabled}
                        onChange={(e) => setEmiEnabled(e.target.checked)}
                        disabled={!enabledCurrencies['INR'] || !currencyActualPrices['INR'] || parseFloat(currencyActualPrices['INR'] || '0') <= 0}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6C63FF',
                            '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.08)' }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6C63FF'
                          }
                        }}
                      />
                    </Stack>

                  {emiEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.5 }}
                    >
                      <Stack spacing={3}>
                        {/* Basic EMI Configuration */}
                        <Stack direction="row" spacing={2}>
                          <FormControl fullWidth>
                            <InputLabel>Installment Period *</InputLabel>
                            <Select
                              value={installmentPeriod}
                              onChange={(e) => setInstallmentPeriod(e.target.value as number)}
                              label="Installment Period *"
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(108, 99, 255, 0.2)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6C63FF'
                                }
                              }}
                            >
                              <MenuItem value={1}>1 month</MenuItem>
                              <MenuItem value={2}>2 months</MenuItem>
                              <MenuItem value={3}>3 months</MenuItem>
                              <MenuItem value={6}>6 months</MenuItem>
                              <MenuItem value={12}>12 months</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Number of Installments *"
                            type="number"
                            value={numberOfInstallments}
                            onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 1)}
                            fullWidth
                            inputProps={{ min: 1, max: 12 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                              }
                            }}
                          />
                        </Stack>

                        {/* Individual Installment Configuration */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Automatically Calculated Installments:
                          </Typography>
                          <Stack spacing={2}>
                            {Array.from({ length: numberOfInstallments }, (_, index) => {
                              const installmentNumber = index + 1;
                              const emiPlan = calculateEmiPlan();
                              const remainingDays = emiPlan.totalDays - (index * emiPlan.daysPerInstallment);
                              const calculatedAmount = emiPlan.calculatedInstallments[installmentNumber] || 0;
                              
                              return (
                                <Paper key={installmentNumber} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(108, 99, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Installment {installmentNumber}
                                  </Typography>
                                  <Stack direction="row" spacing={2}>
                                    <TextField
                                      label="Calculated Amount *"
                                      type="number"
                                      value={calculatedAmount}
                                      fullWidth
                                      disabled
                                      InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                        }
                                      }}
                                    />
                                    <TextField
                                      label="Due Days *"
                                      type="number"
                                      value={emiPlan.daysPerInstallment}
                                      fullWidth
                                      disabled
                                      helperText={`out of remaining ${remainingDays} days`}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                        }
                                      }}
                                    />
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>
                        </Box>

                        {/* Buffer Time Configuration */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Add Buffer Time
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            User will get buffer time of selected number of day/s to pay per installment.
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel>Buffer Time</InputLabel>
                            <Select
                              value={bufferTime}
                              onChange={(e) => setBufferTime(e.target.value as number)}
                              label="Buffer Time"
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(108, 99, 255, 0.2)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6C63FF'
                                }
                              }}
                            >
                              <MenuItem value={0}>0 days</MenuItem>
                              <MenuItem value={3}>3 days</MenuItem>
                              <MenuItem value={5}>5 days</MenuItem>
                              <MenuItem value={7}>7 days</MenuItem>
                              <MenuItem value={10}>10 days</MenuItem>
                              <MenuItem value={15}>15 days</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {/* EMI Plan Summary */}
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(108, 99, 255, 0.05)', border: '1px solid rgba(108, 99, 255, 0.1)' }}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            EMI Plan Summary:
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                              • List Price (MRP): ₹{parseFloat(currencyListPrices['INR'] || '0').toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Actual Price: ₹{calculateEmiPlan().totalAmount.toLocaleString()}
                            </Typography>
                            {(() => {
                              const discount = calculateDiscount(currencyListPrices['INR'], currencyActualPrices['INR']);
                              if (discount.percentage > 0) {
                                return (
                                  <Typography variant="body2" color="green" fontWeight={600}>
                                    • Discount: {discount.percentage}% off - Save ₹{discount.amount.toLocaleString()}
                                  </Typography>
                                );
                              }
                              return null;
                            })()}
                            <Typography variant="body2" color="text.secondary">
                              • EMI Amount: ₹{calculateEmiPlan().emiAmount.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Installment Period: {installmentPeriod} month(s)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Number of Installments: {numberOfInstallments}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Days per Installment: {calculateEmiPlan().daysPerInstallment} days
                            </Typography>
                            {bufferTime > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                • Buffer Time: {bufferTime} day(s)
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </Stack>
                    </motion.div>
                  )}
                </Paper>
                )}
              </Stack>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
});

export default PaymentDetailsStep; 