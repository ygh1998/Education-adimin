import request from '@/utils/request'

export function fetchList(query) {
    return request({
        url: '/vue-element-admin/column/list',
        method: 'get',
        params: query
    })
}

export function fetchCourse(query) {
    return request({
        url: '/vue-element-admin/column/detail',
        method: 'get',
        params: query
    })
}

export function fetchDetailCourse(query) {
    return request({
        url: '/vue-element-admin/column/course',
        method: 'get',
        params: query
    })
}

export function updateColumn(data) {
    return request({
        url: '/vue-element-admin/column/update',
        method: 'post',
        data
    })
}

export function deleteColumn(data) {
    return request({
        url: '/vue-element-admin/column/delete',
        method: 'post',
        data
    })
}