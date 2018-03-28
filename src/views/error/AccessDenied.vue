<template>
    <div class="denied-container">
        <div class="center-container">
            <img src="/static/images/403.png">
            <div class="back-home">
                <div>亲爱的用户,您无权访问该页面...</div>
                <router-link to="/home">
                    <el-button class="button" icon="fa fa-home" type="text">返回首页</el-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
</script>

<style scoped>
    .denied-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .denied-container .center-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .denied-container .back-home {
        position: absolute;
        left: 50%;
        margin-left: -100px;
        bottom: 180px;
    }

</style>
