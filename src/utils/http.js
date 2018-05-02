import axios from 'axios';
import qs from 'qs';
import ElMessage from '../../node_modules/element-ui/lib/message';
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

var instance = axios.create({
    baseURL: GlobalConfig.adminUrl,
    timeout: 5000,
    withCredentials: true, // 跨域会话保持
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
});

instance.interceptors.request.use(config => { // 这里的config包含每次请求的内容
    if (localStorage.getItem('api_token')) { // 判断localStorage中是否存在api_token
        config.headers.apiToken = `${localStorage.getItem('api_token')}`; // 存在将api_token写入 request header
    }
    return config;
}, error => {
    return Promise.reject(error);
});

instance.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.resolve(error.response);
});

var checkStatus = (response) => {
    if (response && (response.status === 200 || response.status === 304 || response.status === 403 || response.status === 400)) { // 如果http状态码正常，则直接返回数据
        return response;
    }
    return { // 异常状态下，把错误信息返回去
        status: -404,
        data: {
            result: 'error',
            message: '网络异常'
        }
    };
};

var checkCode = (res) => {
    if (res.data && (res.data.result === 'error')) {
        ElMessage({
            message: res.data.message,
            type: 'error'
        });
    }
    return res;
};

export default { // 请求方式的配置
    post (url, data) { // post
        return instance({
            method: 'post',
            url,
            data: qs.stringify(data, { allowDots: true })
        }).then((response) => {
            return checkStatus(response);
        }).then((res) => {
            return checkCode(res);
        });
    },
    get (url, params) { // get
        return instance({
            method: 'get',
            url,
            params // get请求时带的参数
        }).then((response) => {
            return checkStatus(response);
        }).then((res) => {
            return checkCode(res);
        });
    }
};
