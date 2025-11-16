import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { CheckCircle2, Package } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const plan = searchParams.get('plan');

    const formatAmount = (amountStr: string | null) => {
        if (!amountStr) return null;
        const numAmount = parseFloat(amountStr);
        if (isNaN(numAmount)) return amountStr;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(numAmount);
    };

    const formattedAmount = formatAmount(amount);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xl">
                <CardHeader className="text-center space-y-4 pb-6">
                    <div className="flex justify-center text-green-600">
                        <div className="relative">
                            <CheckCircle2 className="w-20 h-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full animate-ping opacity-75"></div>
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-green-600">
                        {t('payment.success.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Success Message */}
                    <div className="text-center">
                        <p className="text-lg text-gray-700 mb-4">
                            {t('payment.success.description')}
                        </p>
                    </div>

                    {/* Order Information */}
                    <div className="space-y-4">
                        {/* Order ID */}
                        {orderId && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                        {t('payment.success.orderId')}
                                    </span>
                                    <span className="text-lg font-mono font-bold text-gray-900">
                                        {orderId}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        {formattedAmount && (
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                        {t('payment.success.amount')}
                                    </span>
                                    <span className="text-2xl font-bold text-emerald-700">
                                        {formattedAmount}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Plan */}
                        {plan && (
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                            {t('payment.success.plan')}
                                        </span>
                                        <span className="text-lg font-semibold text-blue-700">
                                            {decodeURIComponent(plan)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-600 text-center">
                            {t('payment.success.helpText')}
                        </p>
                    </div>

                    {/* Return to App Message */}
                    <div className="text-center pt-4">
                        <p className="text-base font-medium text-gray-700">
                            {t('payment.success.returnToApp')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;

