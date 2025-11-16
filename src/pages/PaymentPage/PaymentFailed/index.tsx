import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { XCircle, AlertCircle, FileQuestion, RefreshCw } from 'lucide-react';

type PaymentErrorType =
    | 'payment_not_found'
    | 'payment_failed'
    | 'system_error'
    | 'payment_cancelled';

const PaymentFailed = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const error = searchParams.get('error') as PaymentErrorType | null;
    const orderCode = searchParams.get('orderCode');
    const reason = searchParams.get('reason');

    // Get error configuration
    const getErrorConfig = () => {
        switch (error) {
            case 'payment_not_found':
                return {
                    icon: FileQuestion,
                    title: t('payment.failed.errors.payment_not_found.title'),
                    description: t('payment.failed.errors.payment_not_found.description'),
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                };
            case 'payment_failed':
                return {
                    icon: XCircle,
                    title: t('payment.failed.errors.payment_failed.title'),
                    description: reason
                        ? t('payment.failed.errors.payment_failed.descriptionWithReason', { reason: decodeURIComponent(reason) })
                        : t('payment.failed.errors.payment_failed.description'),
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                };
            case 'system_error':
                return {
                    icon: AlertCircle,
                    title: t('payment.failed.errors.system_error.title'),
                    description: t('payment.failed.errors.system_error.description'),
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                };
            case 'payment_cancelled':
                return {
                    icon: RefreshCw,
                    title: t('payment.failed.errors.payment_cancelled.title'),
                    description: t('payment.failed.errors.payment_cancelled.description'),
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                };
            default:
                return {
                    icon: AlertCircle,
                    title: t('payment.failed.errors.unknown.title'),
                    description: t('payment.failed.errors.unknown.description'),
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                };
        }
    };

    const errorConfig = getErrorConfig();
    const IconComponent = errorConfig.icon;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Card className={`w-full max-w-2xl border-2 ${errorConfig.borderColor} ${errorConfig.bgColor} shadow-xl`}>
                <CardHeader className="text-center space-y-4 pb-6">
                    <div className={`flex justify-center ${errorConfig.color}`}>
                        <IconComponent className="w-20 h-20" />
                    </div>
                    <CardTitle className={`text-3xl font-bold ${errorConfig.color}`}>
                        {errorConfig.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Error Description */}
                    <div className="text-center">
                        <p className="text-lg text-gray-700 mb-4">
                            {errorConfig.description}
                        </p>
                    </div>

                    {/* Order Code */}
                    {orderCode && (
                        <div className={`rounded-lg ${errorConfig.bgColor} border ${errorConfig.borderColor} p-4`}>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    {t('payment.failed.orderCode')}
                                </span>
                                <span className="text-lg font-mono font-bold text-gray-900">
                                    {orderCode}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            {t('payment.failed.helpText')}
                        </p>
                    </div>

                    {/* Return to App Message */}
                    <div className="text-center pt-4">
                        <p className="text-base font-medium text-gray-700">
                            {t('payment.failed.returnToApp')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentFailed;

