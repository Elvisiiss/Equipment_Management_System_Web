import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)
    const menus = ref([])
    const dynamicRoutesAdded = ref(false)

    function setUser(userData) {
        user.value = {
            user_name: userData.userName,
            roles: userData.roles,
            powers: userData.powers,
            token: userData.token,
            avatar_url: userData.avatarUrl
        }
        isAuthenticated.value = true

        // 存储菜单数据
        if (userData.menus) {
            menus.value = userData.menus
            localStorage.setItem('menus', JSON.stringify(userData.menus))
        }

        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function clearUser() {
        user.value = null
        isAuthenticated.value = false
        menus.value = []
        dynamicRoutesAdded.value = false
        localStorage.removeItem('user')
        localStorage.removeItem('menus')
    }

    function loadUserFromStorage() {
        const userData = localStorage.getItem('user')
        const menusData = localStorage.getItem('menus')
        if (userData) {
            user.value = JSON.parse(userData)
            isAuthenticated.value = true
        }
        if (menusData) {
            menus.value = JSON.parse(menusData)
        }
    }

    function setDynamicRoutesAdded(status) {
        dynamicRoutesAdded.value = status
    }

    return {
        user,
        isAuthenticated,
        menus,
        dynamicRoutesAdded,
        setUser,
        clearUser,
        loadUserFromStorage,
        setDynamicRoutesAdded
    }
})
