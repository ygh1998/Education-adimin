<template>
    <div>
        <el-form v-if="formType == 'search'" ref="form" label-width="80px"  size="mini">
            <el-form-item label="占位提示">
                <el-input @input="handleChange('placeholder')" v-model="search.placeholder" style="width: 250px;"></el-input>
            </el-form-item>
        </el-form>
        
    </div>
</template>

<script>
export default {
    props: {
        formType: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            search: {
                placeholder: ''
            }
        };
    },
    methods: {
        // 监听变化
        handleChange(key) {
            this.$emit('change', {
                key,
                value: this[this.formType][key]
            });
        },
        initVal(val) {
            for(let k in val) {
                console.log(k)
                this[val.type][k] = val[k]
            }
            // this.search.placeholder = val.placeholder
        }
    }
}
</script>

<style scoped>

</style>