import GlobalConfig from '@/components/globalConfig/GlobalConfig';

let convertPrefixUrl = function (url) {
    if (!url) {
        return GlobalConfig.nullDefaultImage;
    } else if (url.startsWith(GlobalConfig.stroge.localPrefix)) {
        return GlobalConfig.stroge.localUrl + url.replace(GlobalConfig.stroge.localPrefix, '');
    } else if (url.startsWith(GlobalConfig.stroge.ossPrefix)) {
        return GlobalConfig.stroge.ossUrl + url.replace(GlobalConfig.stroge.ossPrefix, '');
    } else {
        return url;
    }
};

export default{
    install (Vue, options) {
        Vue.prototype.$deepCopy = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        Vue.prototype.$getIsFullscreen = function (length) {
            return length >= 10;
        };
        Vue.prototype.$loadRemoteFile = function (uri) {
            return convertPrefixUrl(uri);
        };
        Vue.prototype.$beforeImageUpload = function (file) {
            const now = new Date().getTime();
            const imageAccepts = GlobalConfig.upload.imageUploadAccept.split(',');
            const isLt5M = file.size / 1024 / 1024 < 5;
            var isImage = false;
            for (var i in imageAccepts) {
                if (file.type === imageAccepts[i]) {
                    isImage = true;
                    break;
                }
            }
            if (!isImage || !isLt5M) {
                this.$message.error(GlobalConfig.upload.imageUploadTip);
            }
            if (GlobalConfig.upload.uploadFunction === 'oss') {
                this.$root.store.state.aliyunOssSign.Filename = now + '_' + file.name;
                this.$root.store.state.aliyunOssSign.key = this.$root.store.state.aliyunOssSign.dir + now + '_' + file.name;
            }
            return isImage && isLt5M;
        };
        Vue.prototype.$beforeVideoUpload = function (file) {
            const now = new Date().getTime();
            const videoAccepts = GlobalConfig.upload.videoUploadAccept.split(',');
            const isLt3G = file.size / 1024 / 1024 / 1024 < 3;
            var isVideo = false;
            for (var i in videoAccepts) {
                if (file.type === videoAccepts[i]) {
                    isVideo = true;
                    break;
                }
            }
            if (!isVideo || !isLt3G) {
                this.$message.error(GlobalConfig.upload.videoUploadTip);
            }
            if (GlobalConfig.upload.uploadFunction === 'oss') {
                this.$root.store.state.aliyunOssSign.Filename = now + '_' + file.name;
                this.$root.store.state.aliyunOssSign.key = this.$root.store.state.aliyunOssSign.dir + now + '_' + file.name;
            }
            return isVideo && isLt3G;
        };
        Vue.prototype.$sortArray = function (array) {
            return array.sort(function (a, b) {
                return a - b;
            });
        };
        Vue.prototype.$generateUUID = function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };
        Vue.prototype.$setUserinfo = function (user) {
            sessionStorage.setItem('userinfo', JSON.stringify(user));
        };
        Vue.prototype.$getUserinfo = function () {
            return JSON.parse(sessionStorage.getItem('userinfo'));
        };
        Vue.prototype.$clearStorage = function () {
            sessionStorage.clear();
        };
    }
};
