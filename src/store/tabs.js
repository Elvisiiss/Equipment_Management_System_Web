import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [
            { path: '/', title: '首页' }
        ]
    }),
    actions: {
        addTab(tab) {
            // 检查标签是否已存在
            const exists = this.tabs.some(t => t.path === tab.path)
            if (!exists) {
                this.tabs.push({
                    path: tab.path,
                    title: tab.meta?.title || tab.title
                })
            }
        },
        removeTab(path) {
            if (path === '/') return // 禁止删除首页
            this.tabs = this.tabs.filter(tab => tab.path !== path)
        },
        resetTabs() {
            this.tabs = [
                { path: '/', title: '首页' }
            ]
        }
    }
})

import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    function setUser(userData) {
        user.value = {
            user_name: userData.user_name,
            roles: userData.roles,
            powers: userData.powers,
            token: userData.token,
            avatar_url: userData.avatar_url
        }
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function clearUser() {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    function loadUserFromStorage() {
        const userData = localStorage.getItem('user')
        if (userData) {
            user.value = JSON.parse(userData)
            isAuthenticated.value = true
        }
    }

    return {
        user,
        isAuthenticated,
        setUser,
        clearUser,
        loadUserFromStorage
    }
})
