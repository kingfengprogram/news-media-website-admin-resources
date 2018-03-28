<template>
    <div class="param-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <div class="search">
                    <el-input placeholder="请输入参数名" v-model="queryParams.name" @keyup.enter.native="loadData">
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="right" inline disabled label-width="100px">
                                <div v-for="(child, index) in props.row.childParams" :key="child.id" style="margin-left: 100px;">
                                    <el-form-item label="">
                                        <span>{{index}}</span>
                                    </el-form-item>
                                    <el-form-item label="参数名">
                                        <el-input v-model="child.name"></el-input>
                                    </el-form-item>
                                    <el-form-item label="参数值">
                                        <el-input v-model="child.value"></el-input>
                                    </el-form-item>
                                    <el-form-item label="参数描述">
                                        <el-input v-model="child.description"></el-input>
                                    </el-form-item>
                                </div>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="name" label="参数名"></el-table-column>
                    <el-table-column prop="value" label="参数值"></el-table-column>
                    <el-table-column prop="description" label="参数描述"></el-table-column>
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
        <el-dialog :fullscreen="$getIsFullscreen(addDialog.formData.childParams.length)" :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
            <el-form :inline="true" :validate-on-rule-change="false" :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="参数名" prop="name">
                    <el-input v-model="addDialog.formData.name" placeholder="请输入参数名"></el-input>
                </el-form-item>
                <el-form-item label="参数值" prop="value">
                    <el-input v-model="addDialog.formData.value" placeholder="请输入参数值"></el-input>
                </el-form-item>
                <el-form-item label="参数描述" prop="description">
                    <el-input v-model="addDialog.formData.description" placeholder="请输入参数描述"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="button-small" size="small" icon="fa fa-plus" @click="addChildrenParam('addDialog')">新增子参数</el-button>
                </el-form-item>
                <div class="child-param" v-show="addDialog.formData.childParams.length != 0">
                    <div v-for="(child, index) in addDialog.formData.childParams" v-dragging="{ item: child, list: addDialog.formData.childParams, group: 'addDialog' }" :key="'addDialog.' + index">
                        <el-form-item>
                            <i>{{index}}</i>
                        </el-form-item>
                        <el-form-item label="参数名" :prop="'childParams.' + index + '.name'" :rules="addDialog.formDataRules.childName">
                            <el-input v-model="addDialog.formData.childParams[index].name" placeholder="请输入参数名"></el-input>
                        </el-form-item>
                        <el-form-item label="参数值" :prop="'childParams.' + index + '.value'" :rules="addDialog.formDataRules.value">
                            <el-input v-model="addDialog.formData.childParams[index].value" placeholder="请输入参数值"></el-input>
                        </el-form-item>
                        <el-form-item label="参数描述" :prop="'childParams.' + index + '.description'" :rules="addDialog.formDataRules.description">
                            <el-input v-model="addDialog.formData.childParams[index].description" placeholder="请输入参数描述"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="button-small" size="small" icon="fa fa-trash" @click="deleteChildrenParam('addDialog', index)"></el-button>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm(addDialog.formName)">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog :fullscreen="$getIsFullscreen(updateDialog.formData.childParams.length)" :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :inline="true" :validate-on-rule-change="false" :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="参数名" prop="name">
                    <el-input v-model="updateDialog.formData.name" placeholder="请输入参数名"></el-input>
                </el-form-item>
                <el-form-item label="参数值" prop="value">
                    <el-input v-model="updateDialog.formData.value" placeholder="请输入参数值"></el-input>
                </el-form-item>
                <el-form-item label="参数描述" prop="description">
                    <el-input v-model="updateDialog.formData.description" placeholder="请输入参数描述"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="button-small" size="small" icon="fa fa-plus" @click="addChildrenParam('updateDialog')">新增子参数</el-button>
                </el-form-item>
                <div class="child-param" v-show="updateDialog.formData.childParams.length != 0">
                    <div v-for="(child, index) in updateDialog.formData.childParams" v-dragging="{ item: child, list: updateDialog.formData.childParams, group: 'updateDialog' }"  :key="'updateDialog.' + index">
                        <el-form-item>
                            <i>{{index}}</i>
                        </el-form-item>
                        <el-form-item label="参数名" :prop="'childParams.' + index + '.name'" :rules="updateDialog.formDataRules.childName">
                            <el-input v-model="updateDialog.formData.childParams[index].name" placeholder="请输入参数名"></el-input>
                        </el-form-item>
                        <el-form-item label="参数值" :prop="'childParams.' + index + '.value'" :rules="updateDialog.formDataRules.value">
                            <el-input v-model="updateDialog.formData.childParams[index].value" placeholder="请输入参数值"></el-input>
                        </el-form-item>
                        <el-form-item label="参数描述" :prop="'childParams.' + index + '.description'" :rules="updateDialog.formDataRules.description">
                            <el-input v-model="updateDialog.formData.childParams[index].description" placeholder="请输入参数描述"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="button-small" size="small" icon="fa fa-trash" @click="deleteChildrenParam('updateDialog', index)"></el-button>
                        </el-form-item>
                    </div>
                </div>
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
import ElFormItem from '../../../../node_modules/element-ui/packages/form/src/form-item.vue';
import ElInput from '../../../../node_modules/element-ui/packages/input/src/input.vue';

export default {
    name: 'params',
    data: function () {
        var validateAddParentParamName, validateUpdateParentParamName, validateChlidParamName;
        validateAddParentParamName = (rule, value, callback) => {
            this.$http.post('/system/param/checkUniqueName', {name: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateUpdateParentParamName = (rule, value, callback) => {
            if (this.currentRowData.name !== value) {
                this.$http.post('/system/param/checkUniqueName', {name: value})
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
        validateChlidParamName = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入参数名'));
            } else if (this.checkChildParamName(value)) {
                callback(new Error('子参数中参数名不能重复'));
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
                formLabelWidth: '100px',
                dialogTitle: '新增参数',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    name: '',
                    value: '',
                    description: '',
                    position: null,
                    childParams: []
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入参数名', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\-]{1,32}$/, message: '参数名是以英文字母开头的英文字母或数字', trigger: 'change' },
                        { validator: validateAddParentParamName, trigger: 'change' }
                    ],
                    childName: [
                        { required: true, message: '请输入参数名', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\-]{1,32}$/, message: '参数名是以英文字母开头的英文字母或数字', trigger: 'change' },
                        { validator: validateChlidParamName, trigger: 'change' }
                    ],
                    value: [
                        { required: true, message: '请输入参数值', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' }
                    ],
                    description: [
                        { required: false, max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '100px',
                dialogTitle: '修改参数',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                formData: {
                    id: null,
                    name: '',
                    value: '',
                    description: '',
                    position: null,
                    parentParam: {},
                    childParams: []
                },
                formDataRules: {
                    name: [
                        { required: true, message: '请输入参数名', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\-]{1,32}$/, message: '参数名是以英文字母开头的英文字母或数字', trigger: 'change' },
                        { validator: validateUpdateParentParamName, trigger: 'change' }
                    ],
                    childName: [
                        { required: true, message: '请输入参数名', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' },
                        { pattern: /^[a-zA-Z0-9\\-]{1,32}$/, message: '参数名是以英文字母开头的英文字母或数字', trigger: 'change' },
                        { validator: validateChlidParamName, trigger: 'change' }
                    ],
                    value: [
                        { required: true, message: '请输入参数值', trigger: 'change' },
                        { min: 1, max: 32, message: '长度为 1 到 32 个字符', trigger: 'change' }
                    ],
                    description: [
                        { required: false, message: '请输入参数相关描述', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道管理后台系统参数管理',
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
                        title: '参数管理',
                        path: '/system/param'
                    }
                ]
            }
        };
    },
    components: {
        ElInput,
        ElFormItem,
        PageBreadcrumb
    },
    mounted: function () {
        this.loadData();
        this.$dragging.$on('dragged', ({ value }) => {
        });
        this.$dragging.$on('dragend', () => {
        });
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
            var emptyData = {
                name: '',
                value: '',
                description: '',
                position: null,
                childParams: []
            };
            this.addDialog.formData = emptyData;
            this.addDialog.dialogVisible = true;
        },
        addEntity: function () {
            var formData = this.addDialog.formData;
            formData.position = this.pagination.total;
            for (var param in formData.childParams) {
                formData.childParams[param].position = parseInt(param, 10);
            }
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/system/param/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$root.bus.$emit('paramMap_change');
                                this.$message({
                                    message: '新增参数成功',
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
            for (var param in formData.childParams) {
                formData.childParams[param].position = parseInt(param, 10);
            }
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/system/param/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$root.bus.$emit('paramMap_change');
                                this.$message({
                                    message: '修改参数成功',
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
                this.$confirm('此操作将永久删除该参数, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/system/param/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$root.bus.$emit('paramMap_change');
                                this.$message({
                                    message: '删除参数成功',
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
                    message: '没有选择要删除的参数',
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
                    message: '没有选择要批量删除的参数',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的参数, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/system/param/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$root.bus.$emit('paramMap_change');
                                        this.$message({
                                            message: '批量删除参数成功',
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
        resetAddForm: function (formName) {
            this.resetForm(formName);
            this.addDialog.formData.childParams = [];
        },
        resetForm: function (formName) {
            this.$refs[formName].resetFields();
            this.updateDialog.formData = this.$deepCopy(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/system/param/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        addChildrenParam: function (dialogName) {
            this[dialogName].formData.childParams.push({
                name: '',
                value: '',
                description: '',
                position: null
            });
        },
        deleteChildrenParam: function (dialogName, index) {
            this[dialogName].formData.childParams.splice(index, 1);
        },
        checkChildParamName: function (value) { // 返回true表示重复了
            var addChildParams, updateChildParams, len, count;
            addChildParams = this.addDialog.formData.childParams;
            updateChildParams = this.updateDialog.formData.childParams;
            len = addChildParams.length;
            count = 0;
            while (len) {
                len--;
                if (addChildParams[len].name === value) {
                    count++;
                }
            }
            if (count > 1) {
                return true;
            }
            len = updateChildParams.length;
            count = 0;
            while (len) {
                len--;
                if (updateChildParams[len].name === value) {
                    count++;
                }
            }
            if (count > 1) {
                return true;
            }
            return false;
        }
    }
};
</script>

<style scoped>
    .param-container {
        height: 100%;
    }

    .param-container >>> .el-dialog {
        width: 62%;
    }

    .param-container .child-param {
        border-top: 1px solid #e2e2e2;
        padding-top: 20px;
    }

    .param-container >>> .el-dialog .button-small {
        margin-left: 20px;
        transform: translateY(-2px);
    }

    .param-container .panel-title .search {
        display: inline-block;
        width: 400px;
        margin-left: 10px;
    }

    .param-container .panel-title .search .el-select {
        display: inline-block;
        width: 90px;
    }

    .param-container .panel-footer {
        text-align: right;
    }
</style>
