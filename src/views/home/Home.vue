<template>
    <div class="home-container">
        <div class="home-model"></div>
        <div class="welcome">
            欢迎访问身材有道后台管理系统
        </div>
    </div>
</template>

<script>
export default {
    name: 'home'
};
</script>

<style scoped>
    .home-container {
        position: relative;
        height: 100%;
        background: url("/static/images/home_bg.png") no-repeat center;
    }
    .home-container .home-model {
        height: 100%;
        background-color: #3d464d;
        opacity: 0.6;
    }

    .home-container .welcome {
        position: absolute;
        color: #fff;
        font-size: 50px;
        font-weight: bold;
        left: 50%;
        top: 200px;
        transform: translateX(-50%);
    }
</style>
