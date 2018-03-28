<template>
    <div class="sidebar-item-container">
        <div  v-for="item in menu" :key="item.id">
            <el-submenu :index="item.uri" :key="item.id" v-if="item.children && item.children.length !== 0">
                <template slot="title"><i :class="item.icon"></i>{{ item.label }}</template>
                <sidebar-item :menu="item.children"></sidebar-item>
            </el-submenu>
            <el-menu-item v-else :index="item.uri" :key="item.id">
                <template slot="title"><i :class="item.icon"></i>{{ item.label }}</template>
            </el-menu-item>
        </div>
    </div>
</template>

<script>
export default {
    name: 'sidebarItem',
    props: ['menu']
};
</script>

<style scoped>
</style>
