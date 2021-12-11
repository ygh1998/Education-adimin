<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- card body -->
      <div style="display: flex; align-items: flex-start">
        <img :src="detail.cover" style="width: 200px; height: 160px" alt="" />
        <div style="flex: 1; margin-left: 20px">
          <div style="display: flex; justify-content: space-between">
            <h3 style="margin-top: 5px; margin-bottom: 0px">
              {{ detail.title }}
            </h3>
            <small style="color: #bbbbbb">{{
              detail.isend ? "已完结" : "连载中"
            }}</small>
          </div>
          <p style="margin: 8px 0px">
            <small style="color: #bbb">{{ detail.try }}</small>
          </p>
          <p>
            <small style="color: red">¥{{ detail.price }}</small>
          </p>
          <el-button-group>
            <el-button
              size="small"
              type="warning"
              @click="changeDetailStatus"
              >{{ detail.status ? "下架" : "上架" }}</el-button
            >
            <el-button size="small" @click="changeDetailisend"
              >设为{{ detail.isend ? "连载中" : "已完结" }}</el-button
            >
          </el-button-group>
        </div>
      </div>
    </el-card>

    <div
      class="filter-container"
      style="display: flex; justify-content: space-between; margin-top: 20px"
    >
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="addColumn()"
      >
        添加课程
      </el-button>
      <div>
        <el-select
          v-model="listQuery.status"
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
          placeholder="标题"
          style="width: 200px"
          class="filter-item"
        />
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
        >
          搜索
        </el-button>
      </div>
    </div>

    <el-table
      ref="dragTable"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
      type="index"
      label="序号"
      align="center" 
      width="60">
    </el-table-column>

      <el-table-column min-width="300px" label="单品名称">
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

      <el-table-column label="类型" align="center" width="95">
        <template>
          <span>音频</span>
        </template>
      </el-table-column>

        <el-table-column label="访问量" align="center" width="95">
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

     <el-table-column
        label="操作"
        align="center"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
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

      <el-table-column align="center" label="Drag" width="80">
        <template slot-scope="{}">
          <svg-icon class="drag-handler" icon-class="drag" />
        </template>
      </el-table-column>
    </el-table>
    <chooseCourse ref="openDialog"></chooseCourse>
  </div>
</template>
<script>
let id = 0;
import chooseCourse from '@/components/chooseCourse/index.vue';
import { fetchDetailCourse, fetchCourse } from "@/api/column";
import Sortable from "sortablejs";
import waves from "@/directive/waves"; // waves directive
let statusOptions = {
  0: "已下架",
  1: "已上架",
};
export default {
  components: {
    chooseCourse
  },
  beforeRouteEnter(to, from, next) {
    id = to.query.id;
    next();
  },
  directives: {
    waves,
  },
  data() {
    return {
      statusOptions,
      listLoading: true,
      list: [],
      detail: {
        content: "",
        cover: "",
        id: 0,
        isend: 0,
        price: 0,
        status: 0,
        sub_count: 0,
        title: "",
        try: "",
      },
      listQuery: {
        status: undefined,
        title: undefined,

      },
    };
  },
  filters: {
    statusFilter(status) {
      return statusOptions[status];
    },
  },
  created() {
    this.getData();
    this.getList();
  },
  methods: {
    addColumn() {
      this.$refs.openDialog.openDialog((val)=>{
          this.list = [...this.list,...val]
      },50)
    },
    getData() {
      fetchCourse({
        id,
      }).then((res) => {
        this.detail = res.data;
      });
    },
     handleDelete(row, index) {
      this.$notify({
          title: "提示",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.list.splice(index, 1);
    },
    handleUpdate(row) {
     
    },
    changeDetailStatus() {
      this.detail.status = this.detail.status ? 0 : 1;
    },
    changeDetailisend() {
      this.detail.isend = this.detail.isend ? 0 : 1;
    },
    async getList() {
      this.listLoading = true;
      const { data } = await fetchDetailCourse(this.listQuery);
      console.log(data)
      this.list = data.items;
      this.total = data.total;
      this.listLoading = false;
      this.oldList = this.list.map((v) => v.id);
      this.newList = this.oldList.slice();
      this.$nextTick(() => {
        this.setSort();
      });
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll(
        ".el-table__body-wrapper > table > tbody"
      )[0];
      this.sortable = Sortable.create(el, {
        ghostClass: "sortable-ghost", // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData("Text", "");
        },
        onEnd: (evt) => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0];
          this.list.splice(evt.newIndex, 0, targetRow);

          // for show the changes, you can delete in you code
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
          this.newList.splice(evt.newIndex, 0, tempIndex);
        },
      });
    },
  },
};
</script>
<style>
.sortable-ghost {
  opacity: 0.8;
  color: #fff !important;
  background: #42b983 !important;
}
</style>

<style scoped>
.icon-star {
  margin-right: 2px;
}
.drag-handler {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d {
  margin-top: 15px;
}
</style>