<script>
const pagination = {
    position: 'desc',
    pageSize: 10,
    total: 0,
    currentPage: 1,
    layout: 'total, sizes, prev, pager, next, jumper',
    pageSizes: [10, 20, 40, 80, 100],
    dataList: []
};

// 管理后台地址
// const adminUrl = 'http://172.16.1.113:9290';
const adminUrl = 'http://172.16.4.83:9090/website-admin';

// 存储地址,本地和oss不同
const stroge = {
    ossPrefix: 'oss://',
    ossUrl: 'http://cdn-scyd.vas.lutongnet.com/',
    localPrefix: 'local://',
    localUrl: adminUrl
};

// const uploadFunction = 'oss';
const uploadFunction = 'local';
var imageUoloadURL = stroge.localUrl + '/fileUpload/image';
var videoUploadURL = stroge.localUrl + '/fileUpload/video';
if (uploadFunction === 'oss') {
    imageUoloadURL = 'http://shencaiyoudao-media.oss-cn-shenzhen.aliyuncs.com';
    videoUploadURL = 'http://shencaiyoudao-media.oss-cn-shenzhen.aliyuncs.com';
}
const upload = {
    uploadFunction: uploadFunction,
    imageUploadURL: imageUoloadURL,
    imageUploadAccept: 'image/gif,image/jpeg,image/jpg,image/png',
    imageUploadTip: '只能上传png/jpg/jpeg/gif文件，且不超过5M',
    recommendBigSize: '，推荐尺寸 1920 * 1080',
    recommendMiddleSize: '，推荐尺寸 528 * 357',
    recommendSMSize: '，推荐尺寸 443 * 327',
    recommendSmallSize: '，推荐尺寸 387 * 387',
    videoUploadURL: videoUploadURL,
    videoUploadAccept: 'video/mp4',
    videoUploadTip: '只能上传mp4文件，且不超过3G'
};

const nullDefaultImage = '/static/images/null_default_image.jpg';

export default {
    pagination,
    adminUrl,
    upload,
    stroge,
    nullDefaultImage
};
</script>
