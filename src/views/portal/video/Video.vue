<template>
    <div class="video-container">
        <page-breadcrumb v-bind="breadcrumbData"></page-breadcrumb>
        <div class="panel">
            <div class="panel-title">
                <el-button type="primary" size="small" icon="fa fa-plus" @click="showAddDialog">新增</el-button>
                <el-button type="danger" size="small" icon="fa fa-trash" @click="batchDelete">批量删除</el-button>
                <el-button size="small" icon="fa fa-sort-numeric-asc" @click="showSortDialog">排序</el-button>
                <div class="search">
                    <el-input placeholder="请输入视频标题" v-model="queryParams.title" class="input-with-select" @keyup.enter.native="loadData">
                        <el-select v-model="queryParams.active" class="active" slot="prepend">
                            <el-option label="状态" value=""></el-option>
                            <el-option v-for="item in shareState.paramMap.active" :label="item.value" :value="item.name" :key="item.id"></el-option>
                        </el-select>
                        <el-select v-model="queryParams.category" class="category" slot="prepend">
                            <el-option label="类别" value=""></el-option>
                            <el-option v-for="item in shareState.paramMap.videoCategory" :label="item.value" :value="item.name" :key="item.id"></el-option>
                        </el-select>
                        <el-button slot="append" icon="el-icon-search" @click="loadData"></el-button>
                    </el-input>
                </div>
            </div>
            <div class="panel-body">
                <el-table stripe v-loading="loading" element-loading-text="拼命加载中" :data="pagination.dataList" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column prop="title" label="视频标题"></el-table-column>
                    <el-table-column prop="category" label="视频分类">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.videoCategory[scope.row.category] ? shareState.paramMap.videoCategory[scope.row.category].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="difficulty" label="难度">
                        <template slot-scope="scope">
                            <el-rate disabled v-model="scope.row.difficulty" :max="getVideoDifficultyCount" :low-threshold="1" :high-threshold="getVideoDifficultyCount" :colors="['#67C23A', '#E6A23C', '#F56C6C']"></el-rate>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalNumber" label="训练人数"></el-table-column>
                    <el-table-column prop="bgImage" label="背景图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.bgImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.bgImage)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="posterImage" label="推荐图">
                        <template slot-scope="scope">
                            <img :src="$loadRemoteFile(scope.row.posterImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(scope.row.posterImage)})">
                        </template>
                    </el-table-column>
                    <el-table-column prop="url" label="视频">
                        <template slot-scope="scope">
                            <video :src="$loadRemoteFile(scope.row.url)" style="width: 70px; height: 70px;" @click="handlePreviewVideo({url: $loadRemoteFile(scope.row.url)})">
                                您的浏览器不支持 video 标签
                            </video>
                        </template>
                    </el-table-column>
                    <el-table-column prop="active" label="状态">
                        <template slot-scope="scope">
                            <span>{{shareState.paramMap.active[scope.row.active] ? shareState.paramMap.active[scope.row.active].value : '参数不存在'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="250">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="fa fa-edit" @click="showUpdateDialog(scope.row)">修改</el-button>
                            <el-button type="danger" size="mini" icon="fa fa-trash" @click="deleteEntity(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-dialog :append-to-body="true" :visible.sync="previewImageVisible">
                    <img width="100%" :src="previewImage" alt="">
                </el-dialog>
                <el-dialog :append-to-body="true" :visible.sync="previewVideoVisible" v-if="previewVideoVisible">
                    <video width="100%" :src="previewVideo" autoplay controls alt="">
                        您的浏览器不支持 video 标签
                    </video>
                </el-dialog>
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
        <el-dialog fullscreen :title="addDialog.dialogTitle" :visible.sync="addDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeAddDialog" :close-on-click-modal="false">
            <el-form :model="addDialog.formData" :ref="addDialog.formName" :rules="addDialog.formDataRules" :label-width="addDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="视频标题" prop="title">
                    <el-input v-model="addDialog.formData.title" placeholder="请输入视频标题"></el-input>
                </el-form-item>
                <el-form-item label="视频分类" prop="category">
                    <el-select v-model="addDialog.formData.category"  placeholder="请选择视频分类">
                        <el-option v-for="item in shareState.paramMap.videoCategory" :label="item.value" :value="item.name" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="难度" prop="difficulty">
                    <el-rate v-model="addDialog.formData.difficulty" :max="getVideoDifficultyCount" :low-threshold="1" :high-threshold="getVideoDifficultyCount" :colors="['#67C23A', '#E6A23C', '#F56C6C']"></el-rate>
                </el-form-item>
                <el-form-item label="训练人数" prop="totalNumber">
                    <el-input-number v-model.number="addDialog.formData.totalNumber" controls-position="right" :step="5000" :min="0" :max="20000000"></el-input-number>
                </el-form-item>
                <el-form-item label="背景图" prop="bgImage">
                    <el-input :disabled="true" v-model="addDialog.formData.bgImage" placeholder="上传背景图片后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_bg'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddBgImageProgress" :on-success="handleAddBgImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="推荐图" prop="posterImage">
                    <el-input :disabled="true" v-model="addDialog.formData.posterImage" placeholder="上传推荐图片后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_poster'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleAddPosterImageProgress" :on-success="handleAddPosterImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendSMSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="视频" prop="url">
                    <el-input :disabled="true" v-model="addDialog.formData.url" placeholder="上传视频后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="addDialog.formName + '_video'" drag :action="upload.videoUploadURL" :accept="upload.videoUploadAccept" :before-upload="$beforeVideoUpload" :on-preview="handlePreviewVideo" :on-progress="handleAddVideoProgress" :on-success="handleAddVideoSuccess" list-type="text">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.videoUploadTip}}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="addDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetAddForm">重置</el-button>
                <el-button @click="closeAddDialog">取 消</el-button>
                <el-button type="primary" @click="addEntity" :loading="addDialog.submiting">{{addDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen :title="updateDialog.dialogTitle" :visible.sync="updateDialog.dialogVisible" custom-class="dialog-custom" :before-close="closeUpdateDialog" :close-on-click-modal="false" v-if="updateDialog.dialogVisible">
            <el-form :model="updateDialog.formData" :ref="updateDialog.formName" :rules="updateDialog.formDataRules" :label-width="updateDialog.formLabelWidth" label-position="right" status-icon>
                <el-form-item label="视频标题" prop="title">
                    <el-input v-model="updateDialog.formData.title" placeholder="请输入视频标题"></el-input>
                </el-form-item>
                <el-form-item label="视频分类" prop="category">
                    <el-select v-model="updateDialog.formData.category"  placeholder="请选择视频分类">
                        <el-option v-for="item in shareState.paramMap.videoCategory" :label="item.value" :value="item.name" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="难度" prop="difficulty">
                    <el-rate v-model="updateDialog.formData.difficulty" :max="getVideoDifficultyCount" :low-threshold="1" :high-threshold="getVideoDifficultyCount" :colors="['#67C23A', '#E6A23C', '#F56C6C']"></el-rate>
                </el-form-item>
                <el-form-item label="训练人数" prop="totalNumber">
                    <el-input-number v-model.number="updateDialog.formData.totalNumber" controls-position="right" :step="1000" :min="0" :max="20000000"></el-input-number>
                </el-form-item>
                <el-form-item label="背景图" prop="bgImage">
                    <el-input :disabled="true" v-model="updateDialog.formData.bgImage" placeholder="上传背景图片后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_bg'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :file-list="updateDialog.bgImageFileList"  :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdateBgImageProgress" :on-success="handleUpdateBgImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendBigSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="推荐图" prop="posterImage">
                    <el-input :disabled="true" v-model="updateDialog.formData.posterImage" placeholder="上传推荐图片后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_poster'" drag :action="upload.imageUploadURL" :accept="upload.imageUploadAccept" :file-list="updateDialog.posterImageFileList"  :before-upload="$beforeImageUpload" :on-preview="handlePreviewImage" :on-progress="handleUpdatePosterImageProgress" :on-success="handleUpdatePosterImageSuccess" list-type="picture">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.imageUploadTip}}<b>{{upload.recommendSMSize}}</b></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="视频" prop="url">
                    <el-input :disabled="true" v-model="updateDialog.formData.url" placeholder="上传视频后自动获取"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-upload :data="upload.uploadFunction === 'oss' ? shareState.aliyunOssSign : {}" with-credentials :ref="updateDialog.formName + '_video'" drag :action="upload.videoUploadURL" :accept="upload.videoUploadAccept" :file-list="updateDialog.videoFileList"  :before-upload="$beforeVideoUpload" :on-preview="handlePreviewVideo" :on-progress="handleUpdateVideoProgress" :on-success="handleUpdateVideoSuccess" list-type="text">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">{{upload.videoUploadTip}}</div>
                    </el-upload>
                </el-form-item>
                <el-form-item prop="active">
                    <el-switch v-model="updateDialog.formData.active" active-color="#13ce66" inactive-color="#ff4949" active-text="启用" inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetUpdateForm">重置</el-button>
                <el-button @click="closeUpdateDialog">取 消</el-button>
                <el-button type="primary" @click="updateEntity" :loading="updateDialog.submiting">{{updateDialog.submitText}}</el-button>
            </div>
        </el-dialog>
        <el-dialog fullscreen v-loading="carousel.loading" element-loading-text="拼命加载中" :title="carousel.dialogTitle" :visible.sync="carousel.dialogVisible" custom-class="dialog-custom  dialog-carousel" :close-on-click-modal="false">
            <div class="el-table el-table--fit el-table--striped el-table--enable-row-hover el-table--enable-row-transition">
                <div class="el-table__header-wrapper">
                    <table cellspacing="0" cellpadding="0" border="0" class="el-table__header" style="width: 100%;">
                        <thead>
                        <tr>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">视频标题</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">视频分类</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">难度</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">训练人数</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">背景图</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">推荐图</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf">
                                <div class="cell">状态</div>
                            </th>
                            <th colspan="1" rowspan="1" class="is-leaf" style="width: 250px;">
                                <div class="cell">操作</div>
                            </th>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div class="el-table__body-wrapper is-scrolling-none">
                    <table cellpadding="0" cellspacing="0" border="0" class="el-table__body" style="width: 100%;">
                        <tbody>
                        <tr :class="index % 2 == 0 ? 'el-table__row' : 'el-table__row el-table__row--striped' " v-for="(item, index) in carousel.pagination.dataList"  v-dragging="{ item: item, list: carousel.pagination.dataList, group: 'sort' }" :key="item.id">
                            <td class="cell">{{item.title}}</td>
                            <td class="cell">{{shareState.paramMap.videoCategory[item.category] ? shareState.paramMap.videoCategory[item.category].value : '参数不存在'}}</td>
                            <td class="cell"><el-rate disabled v-model="item.difficulty" :max="getVideoDifficultyCount" :low-threshold="1" :high-threshold="getVideoDifficultyCount" :colors="['#67C23A', '#E6A23C', '#F56C6C']"></el-rate></td>
                            <td class="cell">{{item.totalNumber}}</td>
                            <td class="cell"><img :src="$loadRemoteFile(item.bgImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(item.bgImage)})"></td>
                            <td class="cell"><img :src="$loadRemoteFile(item.posterImage)" style="width: 70px; height: 70px;" @click="handlePreviewImage({url: $loadRemoteFile(item.posterImage)})"></td>
                            <td class="cell">{{shareState.paramMap.active[item.active] ? shareState.paramMap.active[item.active].value : '参数不存在'}}</td>
                            <td class="cell" style="width: 250px;">
                                <el-button :disabled="(carousel.pagination.pageSize * (carousel.pagination.currentPage - 1) + index) === 0" size="mini" icon="fa fa-arrow-up" @click="changeTop(item)">置顶</el-button>
                                <el-button :disabled="(carousel.pagination.pageSize * (carousel.pagination.currentPage - 1) + index + 1) === carousel.pagination.total" size="mini" icon="fa fa-arrow-down" @click="changeBottom(item)">置底</el-button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div v-if="!carousel.pagination.dataList || carousel.pagination.dataList.length === 0" class="el-table__empty-block" style="width: 100%;">
                        <span class="el-table__empty-text">暂无数据</span>
                    </div>
                </div>
                <div class="el-table__footer-wrapper">
                    <table cellspacing="0" cellpadding="0" border="0" class="el-table__footer" style="width: 100%;">
                        <tfoot>
                        <tr>
                            <td class="cell" style="text-align: right;">
                                <el-pagination background
                                               @size-change="handleSortSizeChange" @current-change="handleSortCurrentChange"
                                               :page-size="carousel.pagination.pageSize" :total="carousel.pagination.total"
                                               :current-page.sync="carousel.pagination.currentPage" :layout="carousel.pagination.layout"
                                               :page-sizes="carousel.pagination.pageSizes">
                                </el-pagination>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="closeSortDialog">取 消</el-button>
                <el-button type="primary" @click="updateSortEntity" :loading="carousel.submiting">{{carousel.submitText}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import PageBreadcrumb from '@/components/breadcurmb/PageBreadcrumb';
import GlobalConfig from '@/components/globalConfig/GlobalConfig';

export default {
    name: 'videoDescription',
    data: function () {
        var validateAddRemoteTitle, validateUpdateRemoteTitle;
        validateAddRemoteTitle = (roule, value, callback) => {
            this.$http.post('/portal/video/checkUniqueTitle', {title: value})
                .then(function (res) {
                    if (res.data.result === 'success') {
                        callback();
                    } else {
                        callback(new Error(res.data.message));
                    }
                });
        };
        validateUpdateRemoteTitle = (roule, value, callback) => {
            if (this.currentRowData.title !== value) {
                this.$http.post('/portal/video/checkUniqueTitle', {title: value})
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
            pagination: this.$deepCopy(GlobalConfig.pagination),
            upload: GlobalConfig.upload,
            previewImageVisible: false,
            previewImage: '',
            previewVideoVisible: false,
            previewVideo: '',
            loading: true,
            carousel: {
                dialogTitle: '视频排序',
                dialogVisible: false,
                interval: 4000,
                height: '200px',
                loading: false,
                submiting: false,
                submitText: '确定',
                pagination: this.$deepCopy(GlobalConfig.pagination)
            },
            queryParams: {
                title: '',
                active: '',
                category: '',
                currentPage: GlobalConfig.pagination.currentPage,
                pageSize: GlobalConfig.pagination.pageSize,
                position: GlobalConfig.pagination.position
            },
            multipleSelection: [],
            currentRowData: {},
            addDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '新增视频',
                formName: 'addForm',
                submiting: false,
                submitText: '确定',
                tagInputVisible: false,
                tagName: 'addTagInput',
                formData: {
                    title: '',
                    category: '',
                    difficulty: 1,
                    totalNumber: 0,
                    bgImage: '',
                    posterImage: '',
                    url: '',
                    position: null,
                    active: true
                },
                formDataRules: {
                    title: [
                        { required: true, message: '请输入视频标题', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { validator: validateAddRemoteTitle, trigger: 'change' }
                    ],
                    category: [
                        { required: true, message: '请选择视频分类', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' }
                    ],
                    difficulty: [
                        { required: true, message: '请选择难度', trigger: 'change' },
                        { type: 'integer', min: 1, max: 3, message: '只能 1 2 3 三个整数值 ', trigger: 'change' }
                    ],
                    totalNumber: [
                        { required: true, message: '请输入训练人数', trigger: 'change' },
                        { type: 'integer', min: 0, max: 20000000, message: '训练人数的范围为 0 到 2000万', trigger: 'change' }
                    ],
                    bgImage: [
                        { required: true, message: '请上传背景图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '视频背景图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    posterImage: [
                        { required: true, message: '请上传海报图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '视频海报图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    url: [
                        { required: true, message: '请上传视频', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.MP4|\.mp4)$/, message: '视频简介视频必须以oss://或local://开头, mp4为后缀', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ]
                }
            },
            updateDialog: {
                dialogVisible: false,
                formLabelWidth: '150px',
                dialogTitle: '修改视频',
                formName: 'updateForm',
                submiting: false,
                submitText: '确定',
                bgImageFileList: [],
                posterImageFileList: [],
                videoFileList: [],
                tagInputVisible: false,
                tagName: 'updateTagInput',
                formData: {
                    id: null,
                    title: '',
                    category: '',
                    difficulty: 1,
                    totalNumber: 0,
                    bgImage: '',
                    posterImage: '',
                    url: '',
                    position: null,
                    active: true
                },
                formDataRules: {
                    title: [
                        { required: true, message: '请输入视频标题', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' },
                        { validator: validateUpdateRemoteTitle, trigger: 'change' }
                    ],
                    category: [
                        { required: true, message: '请选择视频分类', trigger: 'change' },
                        { min: 2, max: 32, message: '长度为 2 到 32 个字符', trigger: 'change' }
                    ],
                    difficulty: [
                        { required: true, message: '请选择难度', trigger: 'change' },
                        { type: 'integer', min: 1, max: 3, message: '只能 1 2 3 三个整数值 ', trigger: 'change' }
                    ],
                    totalNumber: [
                        { required: true, message: '请输入训练人数', trigger: 'change' },
                        { type: 'integer', min: 0, max: 20000000, message: '训练人数的范围为 0 到 2000万 ', trigger: 'change' }
                    ],
                    bgImage: [
                        { required: true, message: '请上传背景图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '视频背景图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    posterImage: [
                        { required: true, message: '请上传海报图', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.JPEG|\.jpeg|\.JPG|\.jpg|\.GIF|\.gif|\.PNG|\.png)$/, message: '视频海报图必须以oss://或local://开头, jpeg/jpg/gif/png为后缀', trigger: 'change' }
                    ],
                    url: [
                        { required: true, message: '请上传视频', trigger: 'change' },
                        { max: 256, message: '长度不能超过 256 个字符', trigger: 'change' },
                        { pattern: /^(oss:\/\/|local:\/\/).+(\.MP4|\.mp4)$/, message: '视频简介视频必须以oss://或local://开头, mp4为后缀', trigger: 'change' }
                    ],
                    active: [
                        { required: true, message: '请选择启用或者禁用', trigger: 'change' }
                    ]
                }
            },
            breadcrumbData: {
                pageInfo: '身材有道门户系统视频管理',
                items: [
                    {
                        id: 1,
                        title: '首页',
                        path: '/home'
                    }, {
                        id: 2,
                        title: '运营管理',
                        path: ''
                    }, {
                        id: 3,
                        title: '视频管理',
                        path: '/portal/video'
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
    computed: {
        getVideoDifficultyCount: function () {
            var count = 0;
            if (this.shareState.paramMap.videoDifficulty) {
                for (var i in this.shareState.paramMap.videoDifficulty) {
                    console.log(i);
                    count++;
                }
            }
            return count;
        }
    },
    methods: {
        handleSizeChange: function (val) {
            this.pagination.pageSize = val;
            this.loadData();
        },
        handleCurrentChange: function (val) {
            this.loadData();
        },
        handleSortSizeChange: function (val) {
            this.loadSortData();
        },
        handleSortCurrentChange: function (val) {
            this.loadSortData();
        },
        handleSelectionChange: function (selection) {
            this.multipleSelection = selection;
        },
        showAddDialog: function () {
            this.addDialog.dialogVisible = true;
        },
        addEntity: function () {
            var formData = this.addDialog.formData;
            formData.position = this.pagination.total;
            this.$refs[this.addDialog.formName].validate((valid) => {
                if (valid) {
                    this.addDialog.submiting = true;
                    this.addDialog.submitText = '执行中';
                    this.$http.post('/portal/video/add', formData)
                        .then((res) => {
                            this.addDialog.submiting = false;
                            this.addDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeAddDialog();
                                this.loadData();
                                this.$message({
                                    message: '新增视频成功',
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
            var url;
            this.updateDialog.formData = this.$deepCopy(rowData);
            url = this.$loadRemoteFile(rowData.bgImage);
            this.updateDialog.bgImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
            url = this.$loadRemoteFile(rowData.posterImage);
            this.updateDialog.posterImageFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
            url = this.$loadRemoteFile(rowData.url);
            this.updateDialog.videoFileList = [{
                name: url.substring(url.lastIndexOf('/') + 1),
                url: url
            }];
        },
        updateEntity: function () {
            var formData = this.updateDialog.formData;
            this.$refs[this.updateDialog.formName].validate((valid) => {
                if (valid) {
                    this.updateDialog.submiting = true;
                    this.updateDialog.submitText = '执行中';
                    this.$http.post('/portal/video/update', formData)
                        .then((res) => {
                            this.updateDialog.submiting = false;
                            this.updateDialog.submitText = '确定';
                            if (res.data.result === 'success') {
                                this.closeUpdateDialog();
                                this.loadData();
                                this.$message({
                                    message: '修改视频成功',
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
                this.$confirm('此操作将永久删除该视频, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.post('/portal/video/delete/' + rowData.id)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadData();
                                this.$message({
                                    message: '删除视频成功',
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
                    message: '没有选择要删除的视频',
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
                    message: '没有选择要批量删除的视频',
                    type: 'warning'
                });
            } else {
                this.$confirm('此操作将永久删除选择的视频, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '执行中...';
                            this.$http.post('/portal/video/batchDelete', batchDeleteData)
                                .then((res) => {
                                    instance.confirmButtonLoading = false;
                                    if (res.data.result === 'success') {
                                        this.loadData();
                                        this.$message({
                                            message: '批量删除视频成功',
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
        closeSortDialog: function () {
            this.loadData();
            this.carousel.dialogVisible = false;
        },
        updateSortEntity: function () {
            var formData, positionList;
            if (!this.carousel.pagination.dataList || this.carousel.pagination.dataList.length === 0) {
                this.$message({
                    message: '修改视频排序失败, 内容列表为空',
                    type: 'error'
                });
                return;
            }
            positionList = [];
            for (var i in this.carousel.pagination.dataList) {
                positionList.push(this.carousel.pagination.dataList[i].position);
            }
            this.$sortArray(positionList);
            formData = {
                videos: this.carousel.pagination.dataList
            };
            for (i in formData.videos) {
                formData.videos[i].position = positionList[i];
            }
            this.carousel.submiting = true;
            this.carousel.submitText = '执行中';
            this.$http.post('/portal/video/updateSort', formData)
                .then((res) => {
                    this.carousel.submiting = false;
                    this.carousel.submitText = '确定';
                    if (res.data.result === 'success') {
                        this.closeSortDialog();
                        this.$message({
                            message: '修改视频排序成功',
                            type: 'success'
                        });
                    }
                });
        },
        resetAddForm: function () {
            this.$refs[this.addDialog.formName].resetFields();
            this.$refs[this.addDialog.formName + '_bg'].clearFiles();
            this.$refs[this.addDialog.formName + '_poster'].clearFiles();
            this.$refs[this.addDialog.formName + '_video'].clearFiles();
        },
        resetUpdateForm: function () {
            this.$refs[this.updateDialog.formName].resetFields();
            this.initUpdateForm(this.currentRowData);
        },
        loadData: function () {
            this.loading = true;
            this.queryParams.currentPage = this.pagination.currentPage;
            this.queryParams.pageSize = this.pagination.pageSize;
            this.$http.get('/portal/video/list', this.queryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.pagination = Object.assign({}, this.pagination, res.data.pagination);
                        }
                        this.loading = false;
                    }, 1000);
                });
        },
        handleAddBgImageProgress: function (event, file, fileList) {
            this.addDialog.formData.bgImage = '';
        },
        handleAddPosterImageProgress: function (event, file, fileList) {
            this.addDialog.formData.posterImage = '';
        },
        handleAddVideoProgress: function (event, file, fileList) {
            this.addDialog.formData.url = '';
        },
        handleUpdateBgImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.bgImage = '';
        },
        handleUpdatePosterImageProgress: function (event, file, fileList) {
            this.updateDialog.formData.posterImage = '';
        },
        handleUpdateVideoProgress: function (event, file, fileList) {
            this.updateDialog.formData.url = '';
        },
        handleAddBgImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.bgImage = response.fileUploadResp.uri;
                this.addDialog.formData.width = response.fileUploadResp.width;
                this.addDialog.formData.height = response.fileUploadResp.height;
            }
        },
        handleAddPosterImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.posterImage = response.fileUploadResp.uri;
            }
        },
        handleAddVideoSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.addDialog.formData.url = response.fileUploadResp.uri;
            }
        },
        handleUpdateBgImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.bgImage = response.fileUploadResp.uri;
                this.updateDialog.formData.width = response.fileUploadResp.width;
                this.updateDialog.formData.height = response.fileUploadResp.height;
            }
        },
        handleUpdatePosterImageSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.posterImage = response.fileUploadResp.uri;
            }
        },
        handleUpdateVideoSuccess: function (response, file, fileList) {
            if (response.result === 'success') {
                this.updateDialog.formData.url = response.fileUploadResp.uri;
            }
        },
        handlePreviewImage: function (file) {
            this.previewImage = file.url;
            this.previewImageVisible = true;
        },
        handlePreviewVideo: function (file) {
            this.previewVideo = file.url;
            this.previewVideoVisible = true;
        },
        showSortDialog: function () {
            this.carousel.dialogVisible = true;
            this.loadSortData();
        },
        loadSortData: function () {
            this.carousel.loading = true;
            var sortQueryParams = {
                active: true,
                position: 'asc',
                currentPage:
                this.carousel.pagination.currentPage,
                pageSize: this.carousel.pagination.pageSize
            };
            this.$http.get('/portal/video/list', sortQueryParams)
                .then((res) => {
                    setTimeout(() => {
                        if (res.data.result === 'success') {
                            this.carousel.pagination = Object.assign({}, this.carousel.pagination, res.data.pagination);
                        }
                        this.carousel.loading = false;
                    }, 1000);
                });
        },
        changeTop: function (rowData) {
            if (rowData && rowData.id) {
                this.$confirm('此操作将该视频置顶, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.get('/portal/video/changeSort/' + rowData.id + '/-1')
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadSortData();
                                this.$message({
                                    message: '置顶视频成功',
                                    type: 'success'
                                });
                            }
                        });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消置顶视频'
                    });
                });
            } else {
                this.$message({
                    message: '没有选择要置顶的视频',
                    type: 'warning'
                });
            }
        },
        changeBottom: function (rowData) {
            if (rowData && rowData.id) {
                this.$confirm('此操作将该视频置底, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$http.get('/portal/video/changeSort/' + rowData.id + '/' + this.carousel.pagination.total)
                        .then((res) => {
                            if (res.data.result === 'success') {
                                this.loadSortData();
                                this.$message({
                                    message: '置底视频成功',
                                    type: 'success'
                                });
                            }
                        });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消置底视频'
                    });
                });
            } else {
                this.$message({
                    message: '没有选择要置底的视频',
                    type: 'warning'
                });
            }
        }
    }
};
</script>

<style scoped>
    .video-container {
        height: 100%;
    }

    .video-container >>> .el-rate {
        height: 40px;
    }

    .video-container >>> .el-rate i {
        line-height: 40px;
    }

    .video-container >>> .el-tag {
        cursor: pointer;
    }

    .video-container >>> .el-dialog {
        width: 50%;
    }

    .video-container >>> .dialog-carousel {
        width: 80%;
    }

    .video-container .panel-title .search {
        display: inline-block;
        margin-left: 10px;
    }

    .video-container .panel-title .search .active {
        display: inline-block;
        width: 90px;
        margin-right: 10px;
    }

    .video-container .panel-title .search .category {
        display: inline-block;
        width: 120px;
    }

    .video-container .panel-footer {
        text-align: right;
    }

</style>
