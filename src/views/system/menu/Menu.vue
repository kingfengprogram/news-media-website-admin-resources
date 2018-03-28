<template>
    <div class="manager-menu-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <span>菜单管理</span>
            </div>
            <div class="panel-body">
                <el-row>
                    <el-col :span="8" :offset="3">
                        <el-card :body-style="{ padding: '0px' }">
                            <div slot="header" class="clearfix">
                                <span>菜单编辑</span>
                            </div>
                            <div v-loading="loading" element-loading-text="拼命加载中">
                                <el-tree :data="menu" node-key="id" default-expand-all :expand-on-click-node="false" :render-content="renderContent">
                                </el-tree>
                                <div class="custom-button">
                                    <el-button type="primary" size="mini" @click="updateMenuEntity" :loading="submiting">{{submitText}}</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8" :offset="2">
                        <el-card :body-style="{ padding: '0px' }">
                            <div slot="header" class="clearfix">
                                <span>菜单预览</span>
                            </div>
                            <div style="min-height: 126px;" v-loading="loading" element-loading-text="拼命加载中" >
                                <el-menu background-color="#3d464d" :default-openeds="getAllOpeneds" text-color="rgba(255, 255, 255, 0.8)" active-text-color="#409EFF" menu-trigger="hover">
                                    <sidebar-item :menu="menu"></sidebar-item>
                                </el-menu>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

            </div>
            <el-dialog :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
                <el-form :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                    <el-form-item label="菜单标题" prop="label">
                        <el-input v-model="addDialog.formData.label" placeholder="请输入菜单标题"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单uri" prop="uri">
                        <el-input v-model="addDialog.formData.uri" placeholder="请输入菜单uri"></el-input>
                    </el-form-item>
                    <el-form-item label="图标" prop="icon">
                        <el-select v-model="addDialog.formData.icon" placeholder="请选择菜单图标">
                            <el-option v-for="item in shareState.paramMap.menuIcon" :value="item.value" :key="item.id">
                                <span style="float: left">{{item.value}}</span>
                                <span style="float: right" :class="item.value"></span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="菜单描述" prop="description">
                        <el-input v-model="addDialog.formData.description" placeholder="请输入菜单描述"></el-input>
                    </el-form-item>
                    <el-form-item prop="disabled">
                        <el-switch v-model="addDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                        </el-switch>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="resetForm(addDialog.formName)">重置</el-button>
                    <el-button @click="closeAddDialog">取 消</el-button>
                    <el-button type="primary" @click="appendNode">确定</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
                <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                    <el-form-item label="菜单标题" prop="label">
                        <el-input v-model="updateDialog.formData.label" placeholder="请输入菜单标题"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单uri" prop="uri">
                        <el-input v-model="updateDialog.formData.uri" placeholder="请输入菜单uri"></el-input>
                    </el-form-item>
                    <el-form-item label="图标" prop="icon">
                        <el-select v-model="updateDialog.formData.icon" placeholder="请选择菜单图标">
                            <el-option v-for="item in shareState.paramMap.menuIcon" :value="item.value" :key="item.id">
                                <span style="float: left">{{item.value}}</span>
                                <span  style="float: right" :class="item.value"></span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="菜单描述" prop="description">
                        <el-input v-model="updateDialog.formData.description" placeholder="请输入菜单描述"></el-input>
                    </el-form-item>
                    <el-form-item prop="disabled">
                        <el-switch v-model="updateDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                        </el-switch>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="resetForm(updateDialog.formName)">重置</el-button>
                    <el-button @click="closeUpdateDialog">取 消</el-button>
                    <el-button type="primary" @click="updateNode">确定</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import PageBreadcrumb from '@/components/breadcurmb/PageBreadcrumb';
import ElButton from '../../../../node_modules/element-ui/packages/button/src/button.vue';
import SidebarItem from '@/components/sidebar/SidebarItem';

export default {
    name: 'managerMenu',
    data: function () {
        return {
            loading: true,
            menu: [],
            shareState: this.$root.store.state,
            currentData: {},
            submiting: false,
            submitText: '确定',
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '新增菜单',
                formName: 'addForm',
                formData: {
                    label: '',
                    active: true,
                    icon: '',
                    uri: '',
                    description: '',
                    position: null,
                    childParams: []
                },
                formDataRules: {
                    label: [
                        { required: true, message: '请输入菜单标题', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '菜单标题是中英文字母或数字', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或禁用', trigger: 'change' }
                    ],
                    icon: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    uri: [
                        { required: true, message: '请输入权限uri', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    description: [
                        { required: false, message: '请输入菜单相关描述', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '修改菜单',
                formName: 'updateForm',
                formData: {
                    id: null,
                    label: '',
                    active: true,
                    icon: '',
                    uri: '',
                    description: '',
                    position: null,
                    childParams: []
                },
                formDataRules: {
                    label: [
                        { required: true, message: '请输入菜单标题', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '菜单标题是中英文字母或数字', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或禁用', trigger: 'change' }
                    ],
                    icon: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    uri: [
                        { required: true, message: '请输入权限uri', trigger: 'change' },
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    description: [
                        { required: false, message: '请输入菜单相关描述', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道管理后台系统菜单管理',
                items: [
                    {
                        id: 1,
                        title: '首页',
                        path: '/home'
                    }, {
                        id: 2,
                        title: '系统管理',
                        path: ''
                    }, {
                        id: 3,
                        title: '菜单管理',
                        path: '/system/menu'
                    }
                ]
            }
        };
    },
    components: {
        ElButton,
        PageBreadcrumb,
        SidebarItem
    },
    mounted: function () {
        this.loadData();
    },
    computed: {
        getAllOpeneds: function () {
            return this.getOpeneds(this.menu);
        }
    },
    methods: {
        getOpeneds: function (item) {
            var openeds = [];
            for (var i in item) {
                if (item[i].children && item[i].children.length !== 0) {
                    openeds.push(item[i].uri);
                    openeds = openeds.concat(this.getOpeneds(item[i].children));
                }
            }
            return openeds;
        },
        showAddDialog: function (node, data) {
            this.currentData = data;
            this.addDialog.dialogVisible = true;
        },
        showUpdateDialog: function (node, data) {
            this.updateDialog.formData = this.$deepCopy(data);
            this.currentData = data;
            this.updateDialog.dialogVisible = true;
        },
        closeAddDialog: function () {
            this.addDialog.dialogVisible = false;
            this.resetForm(this.addDialog.formName);
        },
        closeUpdateDialog: function () {
            this.resetForm(this.updateDialog.formName);
            this.updateDialog.dialogVisible = false;
        },
        resetForm: function (formName) {
            this.$refs[formName].resetFields();
        },
        updateMenuEntity: function () {
            var data = this.setPosition(this.menu[0]);
            this.submiting = true;
            this.submitText = '执行中';
            this.$http.post('/system/menu/update', data)
                .then((res) => {
                    setTimeout(() => {
                        this.submiting = false;
                        this.submitText = '确定';
                        if (res.data.result === 'success') {
                            this.loadData();
                            this.$root.bus.$emit('privilegeMenuChange');
                            this.$message({
                                message: '修改菜单成功',
                                type: 'success'
                            });
                        }
                    }, 500);
                });
        },
        setPosition: function (data) {
            if (data.children && data.children.length !== 0) { // 设置序号
                for (var child in data.children) {
                    data.children[child].position = parseInt(child, 10);
                    this.setPosition(data.children[child]); // 递归调用
                }
            }
            return data;
        },
        loadData: function () {
            this.loading = true;
            this.$http.get('/system/menu/loadManagerMenu')
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.menu = res.data.dataList;
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        appendNode: function () {
            var newChild;
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    newChild = this.$deepCopy(this.addDialog.formData);
                    if (!this.currentData.children) {
                        this.$set(this.currentData, 'children', []);
                    }
                    this.closeAddDialog();
                    this.currentData.children.push(newChild);
                } else {
                    return false;
                }
            });
        },
        updateNode: function () {
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.currentData = Object.assign(this.currentData, this.$deepCopy(this.updateDialog.formData));
                    this.closeUpdateDialog();
                } else {
                    return false;
                }
            });
        },
        removeNode: function (node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },
        getMenuTooltip: function (node, data) {
            var message = node.label;
            if (data.uri) {
                message += ' ' + data.uri;
            }
            if (data.description) {
                message += ' ' + data.description;
            }
            return message;
        },
        renderContent: function (h, { node, data, store }) {
            return (
                <el-tooltip open-delay={200} effect="dark" content={ (() => this.getMenuTooltip(node, data))() } placement="top-start">
                    <span class="tree-node">
                        <span class={node.icon}></span>
                        <span>{node.label}</span>
                        <span class="span_button">
                            <el-button type="text" icon="el-icon-plus" on-click={ () => this.showAddDialog(node, data) }></el-button>
                            {data.id !== '0' ? <el-button type="text" icon="el-icon-edit" on-click={ () => this.showUpdateDialog(node, data) }></el-button> : ''}
                            {data.id !== '0' ? <el-button type="text" icon="el-icon-delete" style="color: red;" on-click={ () => this.removeNode(node, data) }></el-button> : ''}
                        </span>
                    </span>
                </el-tooltip>
            );
        }
    }
};
</script>

<style scoped>
    .manager-menu-container {
        height: 100%;
    }

    .manager-menu-container .custom-button {
        text-align: right;
        margin: 20px;
    }
    .manager-menu-container .card-title {
        text-align: right;
        margin: 20px;
    }

    .manager-menu-container >>> .el-tree-node__content {
        line-height: 56px;
        height: 56px;
        cursor: pointer;
    }

    .manager-menu-container >>> .el-tree-node__content {
        position: relative;
    }

    .manager-menu-container >>> .el-tree-node__content .span_button {
        position: absolute;
        width: 80px;
        right: 20px;
    }

</style>
