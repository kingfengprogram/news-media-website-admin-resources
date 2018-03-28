<template>
    <div class="not-found-container">
        <div class="center-container">
            <img src="/static/images/404.jpg">
            <div class="back-home">
                <router-link to="/home">
                    <el-button class="button" icon="fa fa-home" plain type="text">返回首页</el-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
</script>

<style scoped>
    .not-found-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .not-found-container .center-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .not-found-container .back-home {
        position: absolute;
        left: 50%;
        margin-left: -100px;
        bottom: 200px;
    }

    .not-found-container .back-home .button {
        color: #fff;
        border: 1px solid #fff;
        width: 200px;
        padding: 15px;
        font-size: 28px;
    }

    .not-found-container .back-home .button:hover {
        color: #67C23A;
        background-color: #007BC1;
        border: 1px solid #67C23A;
    }

    .not-found-container >>> .fa {
        font-size: 1em;
        margin-right: 15px;
    }
</style>
