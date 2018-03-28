<template>
    <div class="role-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <div class="search">
                    <el-input placeholder="请输入角色名" v-model="queryParams.name" @keyup.enter.native="loadData">
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <div v-for="(spliceArr, index) in convertSplicePrivilegesByGroup(props.row.privileges, 5)" :key="'expand_role_' + index" >
                                <el-row>
                                    <el-col :span="4" v-for="(item, index) in spliceArr" :key="'splice_array_' + index" style="margin: 20px;">
                                        <el-card :body-style="{ padding: '0px' }" class="expand-card">
                                            <div slot="header" class="card-title">
                                                <span>{{shareState.paramMap.privilegeGroup[item[0].privilegeGroup] ? shareState.paramMap.privilegeGroup[item[0].privilegeGroup].value : '参数不存在'}}</span>
                                            </div>
                                            <div v-for="(privilege, index) in item" :key="index" style="padding: 14px 40px;" class="expand-card-item">
                                                <span>{{privilege.name}}</span>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="name" label="角色名"></el-table-column>
                    <el-table-column prop="code" label="角色编码"></el-table-column>
                    <el-table-column prop="description" label="角色描述"></el-table-column>
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
                <el-form-item label="角色名" prop="name">
                    <el-input v-model="addDialog.formData.name" placeholder="请输入角色名"></el-input>
                </el-form-item>
                <el-form-item label="角色编码" prop="code">
                    <el-input v-model="addDialog.formData.code" placeholder="请输入角色编码"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="description">
                    <el-input v-model="addDialog.formData.description" placeholder="请输入角色描述"></el-input>
                </el-form-item>
                <el-form-item label="角色权限配置" prop="privileges">
                    <el-transfer v-model="addDialog.transfer.value" @change="handleAddChange" filterable :render-content="addDialog.transfer.renderFunc" :titles="['未获得权限', '已获得权限']"
                        :button-texts="['到左边', '到右边']" :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }" :data="transferData" :props="addDialog.transfer.props">
                    </el-transfer>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="角色名" prop="name">
                    <el-input v-model="updateDialog.formData.name" placeholder="请输入角色名"></el-input>
                </el-form-item>
                <el-form-item label="角色编码" prop="code">
                    <el-input v-model="updateDialog.formData.code" placeholder="请输入角色编码"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="description">
                    <el-input v-model="updateDialog.formData.description" placeholder="请输入角色描述"></el-input>
                </el-form-item>
                <el-form-item label="角色权限配置" prop="privileges">
                    <el-transfer v-model="updateDialog.transfer.value" @change="handleUpdateChange" filterable :render-content="updateDialog.transfer.renderFunc" :titles="['未获得权限', '已获得权限']"
                                 :button-texts="['到左边', '到右边']" :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }" :data="transferData" :props="updateDialog.transfer.props">
                    </el-transfer>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetUpdateForm">重置</el-button>
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
    name: 'role',
    data: function () {
        var validateAddRemoteName, validateAddRemoteCode, validateUpdateRemoteName, validateUpdateRemoteCode;
        validateAddRemoteName = (rule, value, callback) => {
            this.$http.post('/system/role/checkUniqueName', {name: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateAddRemoteCode = (rule, value, callback) => {
            this.$http.post('/system/role/checkUniqueName', {code: value})
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
                this.$http.post('/system/role/checkUniqueName', {name: value})
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
                this.$http.post('/system/role/checkUniqueName', {code: value})
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
            transferData: [],
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '新增角色',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                transfer: {
                    value: [],
                    props: {
                        key: 'id',
                        label: 'name'
                    },
                    renderFunc: function (h, option) {
                        return <span>{ this.$root.store.state.paramMap.privilegeGroup[option.privilegeGroup].value } - { option.name }</span>;
                    }
                },
                formData: {
                    name: '',
                    code: '',
                    description: '',
                    privileges: []
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入角色名', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '角色名是中英文字母或数字', trigger: 'change' },
                        { validator: validateAddRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入角色编码', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9]{2,32}$/, message: '角色编码是英文字母或数字', trigger: 'change' },
                        { validator: validateAddRemoteCode, trigger: 'change' }
                    ],
                    description: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    privileges: [
                        { required: true, message: '角色权限不能为空', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '修改角色',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                transfer: {
                    value: [],
                    props: {
                        key: 'id',
                        label: 'name'
                    },
                    renderFunc: function (h, option) {
                        return <span>{ this.$root.store.state.paramMap.privilegeGroup[option.privilegeGroup].value } - { option.name }</span>;
                    }
                },
                formData: {
                    id: null,
                    name: '',
                    code: '',
                    description: '',
                    privileges: []
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入角色名', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9]{2,32}$/, message: '角色名是中英文字母或数字', trigger: 'change' },
                        { validator: validateUpdateRemoteName, trigger: 'change' }
                    ],
                    code: [
                        { required: true, message: '请输入角色编码', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9]{2,32}$/, message: '角色编码是英文字母或数字', trigger: 'change' },
                        { validator: validateUpdateRemoteCode, trigger: 'change' }
                    ],
                    description: [
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ],
                    privileges: [
                        { required: true, message: '角色权限不能为空', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道管理后台系统角色管理',
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
                        title: '角色管理',
                        path: '/system/role'
                    }
                ]
            }
        };
    },
    components: {
        PageBreadcrumb
    },
    created: function () {
        this.loadAllPrivilege();
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
            this.addDialog.transfer.value = [];
            this.addDialog.dialogVisible = true;
        },
        addEntity: function () {
            var formData = this.addDialog.formData;
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/system/role/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '创建角色成功',
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
            this.currentRowData = this.$deepCopy(rowData);
            this.initUpdateForm(rowData);
            this.updateDialog.dialogVisible = true;
        },
        initUpdateForm: function (rowData) {
            this.updateDialog.formData = this.$deepCopy(rowData);
            this.updateDialog.transfer.value = [];
            for (var i in rowData.privileges) {
                this.updateDialog.transfer.value.push(rowData.privileges[i].id);
            }
        },
        updateEntity: function () {
            var formData = this.updateDialog.formData;
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/system/role/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改角色成功',
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
                this.$confirm('此操作将永久删除该角色, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/system/role/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除角色成功',
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
                    message: '没有选择要删除的角色',
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
                    message: '没有选择要批量删除的角色',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的角色, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/system/role/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除角色成功',
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
            this.resetAddForm(this.addDialog.formName);
        },
        closeUpdateDialog: function () {
            this.resetUpdateForm(this.updateDialog.formName);
            this.updateDialog.dialogVisible = false;
        },
        resetAddForm: function () {
            this.$refs[this.addDialog.formName].resetFields();
            this.addDialog.transfer.value = [];
        },
        resetUpdateForm: function () {
            this.$refs[this.updateDialog.formName].resetFields();
            this.initUpdateForm(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/system/role/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        loadAllPrivilege: function () {
            this.$http.get('/system/privilege/listAll')
                .then((res) => {
                    if (res.data.result === 'success') {
                        this.transferData = res.data.dataList;
                    }
                });
        },
        handleAddChange: function (value, direction, movedKeys) {
            var i, index;
            if (direction === 'right') {
                for (i in movedKeys) {
                    this.addDialog.formData.privileges.push({
                        id: movedKeys[i]
                    });
                }
            } else {
                for (i in movedKeys) {
                    index = this.indexOf(this.addDialog.formData.privileges, movedKeys[i]);
                    if (index !== -1) {
                        this.addDialog.formData.privileges.splice(index, 1);
                    }
                }
            }
        },
        handleUpdateChange: function (value, direction, movedKeys) {
            var i, index;
            if (direction === 'right') {
                for (i in movedKeys) {
                    this.updateDialog.formData.privileges.push({
                        id: movedKeys[i]
                    });
                }
            } else {
                for (i in movedKeys) {
                    index = this.indexOf(this.updateDialog.formData.privileges, movedKeys[i]);
                    if (index !== -1) {
                        this.updateDialog.formData.privileges.splice(index, 1);
                    }
                }
            }
        },
        indexOf: function (arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id === val) {
                    return i;
                }
            }
            return -1;
        },
        convertSplicePrivilegesByGroup: function (privileges, length) {
            var i, groupPrivileges, tempGroup, spliceGroupPrivileges;
            groupPrivileges = [];
            spliceGroupPrivileges = [];
            tempGroup = {};
            for (i in privileges) {
                if (!tempGroup[privileges[i].privilegeGroup]) {
                    tempGroup[privileges[i].privilegeGroup] = [];
                }
                tempGroup[privileges[i].privilegeGroup].push(privileges[i]);
            }
            for (i in tempGroup) {
                groupPrivileges.push(tempGroup[i]);
            }
            // splice会改变原数组
            for (i = 0; i * length < groupPrivileges.length;) {
                spliceGroupPrivileges.push(groupPrivileges.splice(i, i + length));
            }
            return spliceGroupPrivileges;
        }
    }
};
</script>

<style scoped>
    .role-container {
        height: 100%;
    }
    .role-container >>> .el-transfer-panel{
        width: 300px;
    }

    .role-container .panel-title .search {
        display: inline-block;
        width: 400px;
        margin-left: 10px;
    }

    .role-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .role-container .panel-footer {
        text-align: right;
    }

    .role-container .expand-card >>> .el-card__body {
        background: linear-gradient(to bottom,  rgba(244,241,233,1) 0%,rgba(237,232,219,1) 100%);
        color: #6f6f6f;
    }

    .role-container .expand-card .expand-card-item:hover {
        background-color: rgb(244,244,244);
    }
</style>
