import { useNavigate } from 'react-router-dom';
import { Button } from '@ui/Button';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center px-4 py-16 max-w-md">
                {/* 404 Text */}
                <h1 className="text-9xl font-bold text-indigo-600 mb-4 animate-pulse">
                    404
                </h1>
                
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Trang không tồn tại
                </h2>
                
                {/* Description */}
                <p className="text-gray-600 mb-8 text-lg">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                
                {/* Buttons */}
                <div className="space-y-4">
                    <Button
                        onClick={() => navigate(-1)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        ← Quay lại
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

