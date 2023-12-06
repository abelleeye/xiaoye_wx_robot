import axios from 'axios';


const instance = axios.create({
    timeout: 10000, // 设置请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 在发送请求之前可以做一些处理，例如添加token等
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        // 对响应数据做一些处理，例如统一处理错误码等
        return response.data;
    },
    error => {
        // 统一处理请求错误
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 封装GET请求
const get = async (url, params, config = {}) => {
    try {
        const response = await instance.get(url, { params, ...config });
        return response;
    } catch (error) {
        throw error;
    }
};

// 封装POST请求
const post = async (url, data, config = {}) => {
    try {
        const response = await instance.post(url, data, config);
        return response;
    } catch (error) {
        throw error;
    }
};


export default {
    get,
    post,
};