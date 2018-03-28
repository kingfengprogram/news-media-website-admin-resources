<template>
    <div></div>
</template>

<script>
export default {
    name: 'GlobalStoreLoading',
    data: function () {
        shareState: this.$root.store.state
    },
    created: function () {
        this.loadParamMapData();
        this.loadAliyunOssSignData();
        this.$root.bus.$on('paramMap_change', () => {
            this.loadParamMapData();
        });
    },
    methods: {
        loadParamMapData: function () {
            this.$http.get('/system/param/loadParamMap')
                .then((res) => {
                    if (res.data.result === 'success') {
                        this.$root.store.setParamMapAction(res.data.paramMap);
                    }
                });
        },
        loadAliyunOssSignData: function () {
            this.$http.get('/aliyunoss/aliyunOssSign')
                .then((res) => {
                    if (res.data.result === 'success') {
                        this.$root.store.setAliyunOssSignAction(res.data.aliyunOssSignResp);
                        setTimeout(() => {
                            this.loadAliyunOssSignData();
                        }, (shareState.aliyunOssSign.expire * 1000 - new Date().getTime()) / 2); // 根据配置过期时间,定时重新刷新签名
                    }
                });
        }
    }
};
</script>

<style scoped>
</style>
