import request from '@/utils/request'

export function fetchMobileList(query) {
    return request({
        url: '/vue-element-admin/visualization/mobile/list',
        method: 'get',
        params: query
    })
}

export function createMobile(data) {
    return request({
        url: '/vue-element-admin/visualization/mobile/create',
        method: 'post',
        data
    })
}

export function updateMobile(data) {
    return request({
        url: '/vue-element-admin/visualization/mobile/update',
        method: 'post',
        data
    })
}

export function deleteMobile(data) {
    return request({
        url: '/vue-element-admin/visualization/mobile/delete',
        method: 'post',
        data
    })
}