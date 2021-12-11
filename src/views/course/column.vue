<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增专栏
      </el-button>
      <div>
        <el-select
          v-model="listQuery.importance"
          placeholder="商品状态"
          clearable
          style="width: 110px; margin-right: 10px"
          class="filter-item"
        >
          <el-option
            v-for="(item, k) in statusOptions"
            :key="k"
            :label="item"
            :value="k"
          />
        </el-select>
        <el-input
          v-model="listQuery.title"
          placeholder="Title"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索
        </el-button>
      </div>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="专栏内容" min-width="150px">
        <template slot-scope="{ row }">
          <div style="display: flex">
            <img :src="row.cover" width="120px" height="60px" alt="" />
            <div
              style="
                margin-left: 10px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              "
            >
              <span>{{ row.title }}</span>
              <span style="color: red">¥ {{ row.price }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新状态" align="center" width="95">
        <template slot-scope="{ row }">
          <span :style="row.isend ? 'color: #333' : 'color:red'">{{
            row.isend ? "已完结" : "连载中"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订阅量" align="center" width="95">
        <template slot-scope="{ row }">
          <span>{{ row.sub_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.created_time }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="warning" size="mini" @click="openDetail(row)">
            目录
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status == 0"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 1)"
          >
            上架
          </el-button>
          <el-button
            v-if="row.status == 1"
            size="mini"
            @click="handleModifyStatus(row, 0)"
          >
            下架
          </el-button>
          <el-popconfirm
            @onConfirm="handleDelete(row, $index)"
            confirm-button-text="删除"
            cancel-button-text="取消"
            icon="el-icon-info"
            icon-color="red"
            title="是否要删除该记录"
            style="margin-left: 10px"
            ><el-button
              v-if="row.status != 'deleted'"
              size="mini"
              type="danger"
              slot="reference"
            >
              删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog
      fullscreen
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <!-- <el-form-item label="Type" prop="type">
          <el-select
            v-model="temp.type"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label-width="79px" label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label-width="79px" label="封面" prop="title">
          <el-upload
            action="https://jsonplaceholder.typicode.com/posts/"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleUploadRemove"
            :on-success="handleUploadSuccess"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="" />
          </el-dialog>
        </el-form-item>
        <el-form-item label-width="79px" label="课程介绍" prop="try">
          <tinymce v-model="temp.try" :height="300" :width="600" />
        </el-form-item>
        <el-form-item label-width="79px" label="课程内容" prop="content">
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-remove="handleRemove"
            :limit="1"
            accept=".mp4,.avi,.wmv,.mov,.flv,.rmvb"
            :file-list="fileList"
            :on-change="handleUploadChange"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              支持mp4，avi，wmv，mov，flv，rmvb，3gp，m4v，mkv格式；文件最大不超过5G。
              当前店铺版本最大支持720高清转码
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label-width="79px" label="课程价格">
          <el-input-number
            v-model="temp.price"
            @change="handleChange"
            :min="1"
            :max="10"
            label="描述文字"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="temp.status">
            <el-radio :label="0">下架</el-radio>
            <el-radio :label="1">上架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  createColumn,
  updateColumn,
  deleteColumn,
} from "@/api/column";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Tinymce from "@/components/Tinymce";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// arr to obj, such as { CN : "China", US : "USA" }
let statusOptions = {
  0: "已下架",
  1: "已上架",
};

export default {
  name: "ComplexTable",
  components: {
    Pagination,
    Tinymce,
  },
  directives: {
    waves,
  },
  filters: {
    statusFilter(status) {
      return statusOptions[status];
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      num: 1,
      fileList: [
        {
          name: "food.jpeg",
          url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        title: undefined,
      },
      sortOptions: [
        {
          label: "ID Ascending",
          key: "+id",
        },
        {
          label: "ID Descending",
          key: "-id",
        },
      ],
      statusOptions,
      showReviewer: false,
      temp: {
        id: undefined,
        title: "",
        price: 0,
        status: 1,
        try: "",
        content: "",
        cover: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      dialogPvVisible: false,
      dialogImageUrl: "",
      dialogVisible: false,
      pvData: [],
      rules: {
        title: [
          {
            required: true,
            message: "请填写标题",
            trigger: "blur",
          },
        ],
        try: [
          {
            required: true,
            message: "请填写试看内容",
            trigger: "blur",
          },
        ],
        content: [
          {
            required: true,
            message: "请填写内容",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then((response) => {
        console.log(response);
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: "",
        price: 0,
        status: 1,
        try: "",
        content: "",
        cover: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createColumn(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateColumn(tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deleteColumn(row).then((response) => {
        this.$notify({
          title: "提示",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.list.splice(index, 1);
      });
      this.list.splice(index, 1);
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
    handleUploadRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleUploadSuccess(response, file, fileList) {
      console.log(response, file, fileList);
    },
    handleChange(value) {
      console.log(value);
    },
    handleUploadPreview(file) {
      console.log(file);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handleUploadChange(file, fileList) {
      console.log(file, fileList);
    },
    openDetail(row) {
        this.$router.push({
            name : 'columnDetail',
            query: {
              id: row.id
            }
        })
        console.log(row)
    }
  },
};
</script>
<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
}
</style>