<template>
    <el-container>
        <global-store-loading></global-store-loading>
        <el-header height="70px">
            <head-top></head-top>
        </el-header>
        <el-container>
            <el-aside width="250px">
                <left-sidebar></left-sidebar>
            </el-aside>
            <el-container>
                <el-main class="main-content">
                    <transition :name="transitionName">
                        <keep-alive>
                            <router-view></router-view>
                        </keep-alive>
                    </transition>
                </el-main>
                <el-footer height="46px">
                    <foot-guide></foot-guide>
                </el-footer>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
import HeadTop from '@/components/header/Header';
import FootGuide from '@/components/footer/Footer';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import GlobalStoreLoading from '@/components/store/GlobalStoreLoading';
export default {
    data: function () {
        return {
            transitionName: 'slideDown'
        };
    },
    components: {
        HeadTop,
        FootGuide,
        LeftSidebar,
        GlobalStoreLoading
    },
    beforeRouteUpdate: function (to, from, next) {
        var toIndex, fromIndex;
        toIndex = to.meta.position;
        fromIndex = from.meta.position;
        if (toIndex >= fromIndex) {
            this.transitionName = 'slideUp';
        } else {
            this.transitionName = 'slideDown';
        }
        next();
    }
};
</script>

<style scoped>
    .el-container {
        height: 100%;
    }

    .el-main {
        height: 100%;
        padding: 0px;
        background: #f5f5f5;
    }

    .main-content {
        position: relative;
    }

    .el-footer {
        padding: 0px;
    }

    .slideUp-enter {
        transform: translate3d(0, 0, 0);
    }

    .slideUp-enter-to {
        transform: translate3d(0, -100%, 0);
    }

    .slideUp-enter-active, .slideDown-enter-active, .slideUp-leave-active, .slideDown-leave-active {
        transition: 1s;
    }

    .slideUp-leave {
        transform: translate3d(0, 0, 0);
    }

    .slideUp-leave-to {
        transform: translate3d(0, -100%, 0);
    }

    .slideDown-enter {
        transform: translate3d(0, -200%, 0);
    }

    .slideDown-enter-to {
        transform: translate3d(0, -100%, 0);
    }

    .slideDown-leave {
        transform: translate3d(0, 0, 0);
    }

    .slideDown-leave-to {
        transform: translate3d(0, 100%, 0);
    }

</style>
