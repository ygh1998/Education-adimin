<template>
  <div style="padding: 20px 30px; background: #eeeeee">
    <el-row :gutter="20">
      <el-col :span="6" :offset="0">
        <el-card
          style="height: 80vh"
          shadow="always"
          :body-style="{ padding: '20px' }"
        >
          <div slot="header">
            <div>组件列表</div>
            <small style="font-size: 10px; color: #bbbbbb"
              >点击组件,添加至页面</small
            >
          </div>
          <el-row :gutter="20">
            <el-col
              :span="12"
              :offset="0"
              style="margin-bottom: 20px"
              @click.native="handleComponent(item)"
              v-for="(item, index) in components"
              :key="index"
            >
              <el-card shadow="hover" :body-style="{ padding: '15px 8px' }">
                <div style="display: flex; align-items: center">
                  <i
                    :class="item.icon"
                    style="font-size: 25px; color: #13ce66; margin-right: 8px"
                  ></i>
                  <span style="font-size: 13px">{{ item.title }}</span>
                </div>
                <!-- card body -->
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8" :offset="0">
        <el-card
          shadow="never"
          :body-style="{ padding: '10px 8px' }"
          style="height: 80vh; overflow: inherit"
        >
          <!-- 顶部按钮 -->
          <img
            src="./status.png"
            width="100%"
            alt=""
            style="margin-bottom: 10px"
          />
          <!-- 中间的整体家伙 -->
          <div style="margin-left: -10px; margin-right: -10px">
            <div
              class="checked-box"
              v-for="(item, index) in templates"
              :key="index"
              :class="item.checked ? 'checked-box-active' : ''"
              @click="handleCheckedComponent(item)"
            >
              <!-- 操作按钮 -->
              <div v-if="item.checked" class="checked-box-btns">
                <i
                  class="el-icon-top"
                  :class="index == 0 ? 'i-disable' : ''"
                  @click.stop="moveUp(index)"
                ></i>
                <i
                  class="el-icon-bottom"
                  @click.stop="moveDown(index)"
                  :class="index + 1 == templates.length ? 'i-disable' : ''"
                ></i>
                <i
                  class="el-icon-delete"
                  @click.stop="deleteComponent(index)"
                ></i>
              </div>
              <!-- 组件 -->
              <template v-if="item.type == 'search'"
                ><searchBar :placeholder="item.placeholder"></searchBar
              ></template>
              <template v-if="item.type == 'list'"
                ><list
                  :title="item.title"
                  :showMore="item.showMore"
                  :list="item.data"
                  :listType="item.listType"
                ></list
              ></template>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 右边固定宽度 -->
    <div style="position: fixed; right: 40px; top: 100px">
      <el-card
        shadow="always"
        :body-style="{ padding: '20px' }"
        style="width: 450px; height: 85vh; position: relative"
      >
        <div slot="header">组件编辑</div>
        <!-- card body -->
        <div
          style="
            overflow-y: auto;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            top: 60px;
          "
        >
          <compenentForm
            ref="compenentForm"
            :formType="currentComponent.type"
            @change="onCurrentComponentChange"
          ></compenentForm>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import searchBar from "./components/search-bar";
import compenentForm from "./components/compenent-form";
import list from "./components/list";
import util from "@/utils/util.js";
import List from "@/views/example/list.vue";
export default {
  components: {
    searchBar,
    compenentForm,
    list,
  },
  data() {
    return {
      components: [
        {
          icon: "el-icon-s-order",
          title: "课程列表",
          type: "list",
          default: {
            listType: "one",
            title: "最新列表",
            showMore: true,
            more: false,
            data: [],
          },
        },
        {
          icon: "el-icon-search",
          title: "搜索框",
          type: "search",
          default: {
            placeholder: "请输入搜索关键词",
          },
        },
      ],
      templates: [],
    };
  },
  computed: {
    // 当前选中组件
    currentComponent() {
      let i = this.templates.findIndex((v) => v.checked);
      return this.templates[i] || {};
    },
  },
  methods: {
    // 监听组件的变化
    onCurrentComponentChange(e) {
      console.log(e);
      let i = this.templates.findIndex((v) => v.checked);
      console.log(this.templates[i]);
      if (i != -1) {
        this.templates[i][e.key] = e.value;
      }
    },
    // 点击组件
    handleComponent(row) {
      let data = JSON.parse(JSON.stringify(row.default));
      data.checked = false;
      data.type = row.type;
      this.templates.push(data);
    },
    // 选中组件
    handleCheckedComponent(row) {
      this.templates.map((v) => {
        v.checked = false;
        return v;
      });
      row.checked = true;
      console.log(row);
      this.$refs.compenentForm.initVal(row);
    },
    deleteComponent(index) {
      this.$confirm("是否要删除该组件?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.templates.splice(index, 1);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
      });
    },
    moveUp(index) {
      util.moveUp(this.templates, index);
    },
    moveDown(index) {
      util.moveDown(this.templates, index);
    },
  },
};
</script>
<style scoped>
.checked-box {
  cursor: pointer;
  position: relative;
}

.checked-box-active {
  border: 2px dotted #2196f3;
  padding: 5px 0;
  margin-bottom: 10px;
}

.checked-box-btns {
  position: absolute;
  right: -29px;
  top: -2px;
  border: 2px dotted #2196f3;
  display: flex;
  flex-direction: column;
  border-left-width: 0;
}

.checked-box-btns i {
  color: #2196f3;
  padding: 4px;
  font-weight: bold;
}

.checked-box-btns i:hover {
  color: #eee;
}

.checked-box-btns .i-disable {
  background: #fff;
  color: #bbbbbb;
  cursor: no-drop;
}
</style>