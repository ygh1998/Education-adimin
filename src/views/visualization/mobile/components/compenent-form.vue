<template>
  <div>
    <div>
      <el-form ref="form" label-width="80px" size="mini">
        <el-form-item label="占位提示" v-if="formType == 'search'">
          <el-input
            @input="handleChange('placeholder')"
            v-model="search.placeholder"
            style="width: 250px"
          ></el-input>
        </el-form-item>

        <template v-else-if="formType == 'list'">
          <el-form-item label="类型">
            <el-radio-group
              v-model="list.listType"
              @change="handleChange('listType')"
            >
              <el-radio label="one"> 单栏 </el-radio>
              <el-radio label="two"> 双栏 </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="标题">
            <el-input
              v-model="list.title"
              size="mini"
              style="width: 200px"
              @input="handleChange('title')"
            ></el-input>
          </el-form-item>

          <el-form-item label="更多">
            <el-radio-group
              v-model="list.showMore"
              @change="handleChange('showMore')"
            >
              <el-radio :label="true"> 显示 </el-radio>
              <el-radio :label="false"> 隐藏 </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="更多链接">
            <el-button type="default" size="mini">{{
              list.more ? list.more : "选择页面"
            }}</el-button>
          </el-form-item>

          <el-form-item label-width="0">
            <div class="choose-course-btn">
              <el-button icon="el-icon-circle-plus-outline" type="text" @click="addColumn()"
                >关联课程</el-button
              >
              <span>最多关联10门</span>
            </div>
            <drag-course :list="list.data"></drag-course>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <chooseCourse ref="openDialog"></chooseCourse>
  </div>
</template>

<script>
import dragCourse from "./drag-course.vue";
import chooseCourse from "@/components/chooseCourse/index.vue";
export default {
  props: {
    formType: {
      type: String,
      default: "",
    },
  },
  components: {
    dragCourse,
    chooseCourse,
  },
  data() {
    return {
      search: {
        placeholder: "",
      },
      list: {
        listType: "one",
        title: "",
        showMore: true,
        more: false,
        data: [],
      },
    };
  },
  methods: {
    // 监听变化
    handleChange(key) {
      this.$emit("change", {
        key,
        value: this[this.formType][key],
      });
    },
    initVal(val) {
      for (let k in val) {
        console.log(k);
        this[val.type][k] = val[k];
      }
      // this.search.placeholder = val.placeholder
    },
    addColumn() {
      this.$refs.openDialog.openDialog((val)=>{
          this[this.formType].data = [...this[this.formType].data ,...val]
          this.handleChange('data')
      },50)
    },
  },
};
</script>

<style scoped>
.choose-course-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dotted #13ce66;
}

.choose-course-btn span {
  color: #888888;
  font-size: 12px;
}
</style>