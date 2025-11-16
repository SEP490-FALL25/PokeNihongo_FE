import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
    const { t } = useTranslation();

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

