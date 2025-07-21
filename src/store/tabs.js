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
