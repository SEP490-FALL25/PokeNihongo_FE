import { axiosPrivate } from "@configs/axios";

const geminiService = {
    getGeminiConfigModels: async () => {
        return await axiosPrivate.get('/gemini-config/models');
    }
}

export default geminiService;