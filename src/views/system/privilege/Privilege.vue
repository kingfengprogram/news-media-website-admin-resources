<template>
    <div class="privilege-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <div class="search">
                    <el-input placeholder="请输入权限名" v-model="queryParams.name" @keyup.enter.native="loadData">
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="name" label="权限名"></el-table-column>
                    <el-table-column prop="code" label="权限编码"></el-table-column>
                    <el-table-column prop="uri" label="权限uri"></el-table-column>
                    <el-table-column prop="description" label="权限描述">
                        <template slot-scope="scope">
                            <span>{{scope.row.description || '无'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="privilegeGroup" label="权限分组">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.privilegeGroup[scope.row.privilegeGroup] ? shareState.paramMap.privilegeGroup[scope.row.privilegeGroup].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="isAdmin" label="系统管理权限">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.isAdmin[scope.row.isAdmin] ? shareState.paramMap.isAdmin[scope.row.isAdmin].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="250">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="fa fa-edit" @click="showUpdateDialog(scope.row)">修改</el-button>
                            <el-button type="danger" size="mini" icon="fa fa-trash" @click="deleteEntity(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="panel-footer">
                <div class="block">
                    <el-pagination background
                                   @size-change="handleSizeChange" @current-change="handleCurrentChange"
                                   :page-size="pagination.pageSize" :total="pagination.total"
                                   :current-page.sync="pagination.currentPage" :layout="pagination.layout"
                                   :page-sizes="pagination.pageSizes">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
            <el-form :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="权限名" prop="name">
                    <el-input v-model="addDialog.formData.name" placeholder="请输入权限名"></el-input>
                </el-form-item>
                <el-form-item label="权限编码" prop="code">
                    <el-input v-model="addDialog.formData.code" placeholder="请输入权限编码"></el-input>
                </el-form-item>
                <el-form-item label="权限uri" prop="uri">
                    <el-input v-model="addDialog.formData.uri" placeholder="请输入权限uri"></el-input>
                </el-form-item>
                <el-form-item label="权限描述" prop="description">
                    <el-input v-model="addDialog.formData.description" placeholder="请输入权限描述"></el-input>
                </el-form-item>
                <el-form-item label="权限分组" prop="privilegeGroup">
                    <el-select v-model="addDialog.formData.privilegeGroup" clearable placeholder="请选择权限分组">
                        <el-option v-for="item in shareState.paramMap.privilegeGroup" :key="item.id" :label="item.value" :value="item.name">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="系统管理权限" prop="isAdmin">
                    <el-switch v-model="addDialog.formData.isAdmin" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm(addDialog.formName)">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="权限名" prop="name">
                    <el-input v-model="updateDialog.formData.name" placeholder="请输入权限名"></el-input>
                </el-form-item>
                <el-form-item label="权限编码" prop="code">
                    <el-input v-model="updateDialog.formData.code" placeholder="请输入权限编码"></el-input>
                </el-form-item>
                <el-form-item label="权限uri" prop="uri">
                    <el-input v-model="updateDialog.formData.uri" placeholder="请输入权限uri"></el-input>
                </el-form-item>
                <el-form-item label="权限描述" prop="description">
                    <el-input v-model="updateDialog.formData.description" placeholder="请输入权限描述"></el-input>
                </el-form-item>
                <el-form-item label="权限分组" prop="privilegeGroup">
                    <el-select v-model="updateDialog.formData.privilegeGroup" clearable placeholder="请选择权限分组">
                        <el-option v-for="item in shareState.paramMap.privilegeGroup" :key="item.id" :label="item.value" :value="item.name">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="系统管理权限" prop="isAdmin">
                    <el-switch v-model="updateDialog.formData.isAdmin" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetForm(updateDialog.formName)">重置</el-button>
                <el-button @click="closeUpdateDialog">取 消</el-button>
                <el-button type="primary" @click="updateEntity" :loading="updateDialog.submiting">{{updateDialog.submitText}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import PageBreadcrumb from '@/components/breadcurmb/PageBreadcrumb';
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

export default {
    name: 'privilege',
    data: function () {
        var validateAddRemoteName, validateAddRemoteCode, validateUpdateRemoteName, validateUpdateRemoteCode;
        validateAddRemoteName = (rule, value, callback) => {
            this.$http.post('/system/privilege/checkUniqueName', {name: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateAddRemoteCode = (rule, value, callback) => {
            this.$http.post('/system/privilege/checkUniqueCode', {code: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateUpdateRemoteName = (rule, value, callback) => {
            if (this.currentRowData.name !== value) {
                this.$http.post('/system/privilege/checkUniqueName', {name: value})
                    .then(function (res) {
                        if (res.data.result === 'success') {
                            callback();
                        } else {
                            callback(new Error(res.data.message));
                        }
                    });
            } else {
                callback();
            }
        };
        validateUpdateRemoteCode = (rule, value, callback) => {
            if (this.currentRowData.code !== value) {
                this.$http.post('/system/privilege/checkUniqueCode', {code: value})
                    .then(function (res) {
                        if (res.data.result === 'success') {
                            callback();
                        } else {
                            callback(new Error(res.data.message));
                        }
                    });
            } else {
                callback();
            }
        };
        return {
            shareState: this.$root.store.state,
            pagination: GlobalConfig.pagination,
            loading: true,
            queryParams: {
                name: '',
                currentPage: GlobalConfig.pagination.currentPage,
                pageSize: GlobalConfig.pagination.pageSize,
                position: GlobalConfig.pagination.position
            },
            multipleSelection: [],
            currentRowData: {},
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '新增权限',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    name: '',
                    code: '',
                    uri: '',
                    description: '',
                    privilegeGroup: '',
                    isAdmin: false
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入权限名', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '权限名是中英文字母或数字', trigger: 'change' },
                        { validator: validateAddRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入权限编码', trigger: 'change' },
                        { min: 2, max: 64, message: '长度为 2 到 64 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9:]{2,64}$/, message: '权限编码是英文字母,数字或:', trigger: 'change' },
                        { validator: validateAddRemoteCode, trigger: 'change' }
                    ],
                    uri: [
                        { required: true, message: '请输入权限uri', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\{}/]{0,256}$/, message: '权限uri是英文字母或数字以及/', trigger: 'change' }
                    ],
                    description: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    privilegeGroup: [
                        { required: true, message: '请选择权限分组', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' }
                    ],
                    isAdmin: [
                        { required: true, message: '请选择是否属于系统管理特殊权限', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '修改权限',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    id: null,
                    name: '',
                    code: '',
                    uri: '',
                    description: '',
                    privilegeGroup: '',
                    isAdmin: false
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入权限名', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '权限名是中英文字母或数字', trigger: 'change' },
                        { validator: validateUpdateRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入权限编码', trigger: 'change' },
                        { min: 2, max: 64, message: '长度为 2 到 64 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9:]{2,64}$/, message: '权限编码是英文字母,数字或:', trigger: 'change' },
                        { validator: validateUpdateRemoteCode, trigger: 'change' }
                    ],
                    uri: [
                        { required: true, message: '请输入权限uri', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\{}/]{0,256}$/, message: '权限uri是英文字母或数字以及/', trigger: 'change' }
                    ],
                    description: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    privilegeGroup: [
                        { required: true, message: '请选择权限分组', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' }
                    ],
                    isAdmin: [
                        { required: true, message: '请选择是否属于系统管理特殊权限', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道管理后台系统权限管理',
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
                        title: '权限管理',
                        path: '/system/privilege'
                    }
                ]
            }
        };
    },
    components: {
        PageBreadcrumb
    },
    mounted: function () {
        this.loadData();
    },
    methods: {
        handleSizeChange: function (val) {
            this.pagination.pageSize = val;
            this.loadData();
        },
        handleCurrentChange: function (val) {
            this.loadData();
        },
        handleSelectionChange: function (selection) {
            this.multipleSelection = selection;
        },
        showAddDialog: function () {
            this.addDialog.dialogVisible = true;
        },
        addEntity: function () {
            var formData = this.addDialog.formData;
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/system/privilege/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '创建权限成功',
                                    type: 'success'
                                });
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        showUpdateDialog: function (rowData) {
            this.updateDialog.formData = this.$deepCopy(rowData);
            this.currentRowData = this.$deepCopy(rowData);
            this.updateDialog.dialogVisible = true;
        },
        updateEntity: function () {
            var formData = this.updateDialog.formData;
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/system/privilege/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改权限成功',
                                    type: 'success'
                                });
                            }
                        });
                } else {
                    return false;
                }
            });
        },
        deleteEntity: function (rowData) {
            if (rowData && rowData.id) {
                this.$confirm('此操作将永久删除该权限, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/system/privilege/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除权限成功',
                                    type: 'success'
                                });
                            }
                        });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            } else {
                this.$message({
                    message: '没有选择要删除的权限',
                    type: 'warning'
                });
            }
        },
        batchDelete: function () {
            var batchDeleteData = {
                ids: []
            };
            for (var i in this.multipleSelection) {
                batchDeleteData.ids.push(this.multipleSelection[i].id);
            }
            if (!batchDeleteData.ids || batchDeleteData.ids.length === 0) {
                this.$message({
                    message: '没有选择要批量删除的权限',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的权限, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/system/privilege/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除权限成功',
                                            type: 'success'
                                        });
                                    }
                                    done();
                                });
                        } else {
                            done();
                        }
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消批量删除'
                    });
                });
            }
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
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/system/privilege/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        }
    }
};
</script>

<style scoped>
    .privilege-container {
        height: 100%;
    }

    .privilege-container .panel-title .search {
        display: inline-block;
        width: 400px;
        margin-left: 10px;
    }

    .privilege-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .privilege-container .panel-footer {
        text-align: right;
    }
</style>
