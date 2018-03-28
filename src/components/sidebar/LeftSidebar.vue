<template>
    <div class="left-sidebar" v-loading="loading">
        <el-menu :default-active="onRoutes" background-color="#3d464d" text-color="rgba(255, 255, 255, 0.8)" active-text-color="#409EFF" menu-trigger="hover" unique-opened router :collapse="shareState.sidebarCollapse">
            <sidebar-item :menu="menu"></sidebar-item>
        </el-menu>
    </div>
</template>

<script>
import SidebarItem from '@/components/sidebar/SidebarItem';
export default {
    data: function () {
        return {
            loading: true,
            menu: [],
            shareState: this.$root.store.state
        };
    },
    components: {
        SidebarItem
    },
    created: function () {
        this.loadPrivilegeMenu();
        this.$root.bus.$on('privilegeMenuChange', () => {
            this.loadPrivilegeMenu();
        });
    },
    computed: {
        onRoutes: function () {
            return this.$route.path;
        }
    },
    methods: {
        loadPrivilegeMenu: function () {
            this.loading = true;
            this.$http.get('/system/menu/loadPrivilegeManagerMenu')
                .then((res) => {
                    if (res.data.result === 'success') {
                        this.menu = res.data.dataList;
                    }
                    this.loading = false;
                });
        }
    }
};
</script>

<style scoped>
    .left-sidebar {
        display: block;
        position: absolute;
        width: 250px;
        left: 0;
        top: 70px;
        bottom: 0;
        font-family: 'Montserrat', sans-serif;
    }
    .left-sidebar >>> .el-menu{
        border: 0px;
    }

    .left-sidebar >>> ul {
        height: 100%;
    }
</style>
