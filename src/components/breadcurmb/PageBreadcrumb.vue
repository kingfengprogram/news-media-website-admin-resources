<template>
    <div class="page-breadcrumb">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item class="title" :key="item.id" v-for="item in items" :to="{ path: '' + item.path + '' }">{{item.title}}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="info">{{pageInfo}}</div>
    </div>
</template>

<script>
export default {
    name: 'pageBreadcrumb',
    props: ['items', 'pageInfo']
};
</script>

<style>
    .page-breadcrumb {
        position: relative;
        background: #fff;
        padding: 20px;
    }

    .page-breadcrumb .title {
        padding: 0;
        margin: 0;
        font-family: 'Montserrat', sans-serif;
        font-size: 20px;
        line-height: normal;
        font-weight: normal;
        color: #37363e;
        padding-bottom: 6px;
    }

    .page-breadcrumb .info {
        font-weight: normal;
        color: #999;
        font-size: 13px;
    }
</style>
