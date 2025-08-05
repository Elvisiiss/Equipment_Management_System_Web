/**
 * 点巡检管理模块API
 * 遵循项目统一接口规范
 */

import request from '@/utils/request'

// 看板数据接口
export const getDashboardData = async (params) => {
  return {
    code: 'success',
    data: {
      completionRate: 0.85,
      onTimeRate: 0.78,
      abnormalRate: 0.12,
      trendData: [
        { date: '2024-05-01', completion: 45, onTime: 40 },
        { date: '2024-05-02', completion: 52, onTime: 48 },
        { date: '2024-05-03', completion: 60, onTime: 55 },
      ],
      abnormalRank: [
        { device: 'CNC-001', count: 8 },
        { device: 'INJ-005', count: 5 },
        { device: 'PRESS-002', count: 3 },
      ]
    }
  }
}

// 策略配置接口
export const getPolicyList = async (params) => {
  return {
    code: 'success',
    data: [
      {
        id: 'POL-001',
        name: '设备日常点检策略',
        scene: 'EQUIPMENT',
        deviceTypes: ['CNC', 'INJECTION'],
        status: 1,
        formItems: []
      },
      {
        id: 'POL-002',
        name: '开工检查策略',
        scene: 'STARTUP',
        deviceTypes: ['ASSEMBLY'],
        status: 0,
        formItems: []
      }
    ]
  }
}

export const createPolicy = async (data) => {
  return {
    code: 'success',
    data: { id: 'POL-' + Date.now() }
  }
}

export const updatePolicy = async (data) => {
  return { code: 'success' }
}

export const deletePolicy = async (id) => {
  return { code: 'success' }
}

// 异常处理接口
export const processException = async (exceptionNo) => {
  return { code: 'success' }
}

// 计划管理接口
export const getPlanList = async (params) => {
  return {
    code: 'success',
    data: {
      list: [
        {
          planNo: 'PLAN-001',
          planName: 'CNC日常点检',
          policyName: '设备日常点检策略',
          type: 'DAILY',
          frequency: '1|DAY',
          nextTime: '2024-05-10 08:00:00',
          status: 1,
          devices: [
            { deviceName: 'CNC-001', deviceType: 'CNC', location: 'A区' },
            { deviceName: 'CNC-002', deviceType: 'CNC', location: 'B区' }
          ]
        }
      ],
      total: 1
    }
  }
}

export const updatePlanStatus = async (planNo, status) => {
  return { code: 'success' }
}

export const deletePlan = async (planNo) => {
  return { code: 'success' }
}

export const generateTasks = async (planId) => {
  return {
    code: 'success',
    data: { count: planId ? 5 : 15 }
  }
}

// 任务执行接口
export const getTaskList = async (params) => {
  return {
    code: 'success',
    data: {
      list: [
        {
          taskNo: 'TASK-001',
          taskName: 'CNC-001日常点检',
          deviceName: 'CNC-001',
          deviceType: 'CNC',
          planName: 'CNC日常点检',
          operator: '张三',
          startTime: '2024-05-01 08:00:00',
          endTime: '2024-05-01 10:00:00',
          status: 'PENDING'
        }
      ],
      total: 1
    }
  }
}

export const executeTask = async (taskNo) => {
  return { code: 'success' }
}

export const cancelTask = async (taskNo) => {
  return { code: 'success' }
}

// 异常列表接口
export const getExceptionList = async (params) => {
  return {
    code: 'success',
    data: {
      list: [
        {
          exceptionNo: 'EX-001',
          taskName: 'CNC-001日常点检',
          deviceName: 'CNC-001',
          itemName: '主轴温度',
          level: 'SEVERE',
          status: 'PENDING',
          createTime: '2024-05-01 09:30:00',
          handler: '李四'
        }
      ],
      total: 1
    }
  }
}

// 报表接口
export const getReportData = async (params) => {
  return {
    code: 'success',
    data: {
      efficiencyAnalysis: {
        deviceDistribution: [
          { type: 'CNC', rate: 0.6 },
          { type: 'INJ', rate: 0.3 },
          { type: 'ASM', rate: 0.1 }
        ],
        teamComparison: [
          { team: 'A组', completionRate: 0.85, avgDuration: 45 },
          { team: 'B组', completionRate: 0.78, avgDuration: 52 }
        ],
        detailList: [
          {
            deviceCode: 'CNC-001',
            deviceName: 'CNC机床001',
            completionRate: 0.9,
            avgDuration: 40,
            abnormalCount: 2
          }
        ]
      },
      exceptionAnalysis: {
        typeDistribution: [
          { type: '参数异常', count: 12 },
          { type: '设备故障', count: 8 },
          { type: '操作问题', count: 5 }
        ],
        trendData: [
          { date: '2024-05-01', count: 5 },
          { date: '2024-05-02', count: 3 },
          { date: '2024-05-03', count: 7 }
        ],
        detailList: [
          {
            id: 'EX-001',
            exceptionTime: '2024-05-01 10:30:00',
            deviceCode: 'CNC-001',
            deviceName: 'CNC机床001',
            exceptionType: '参数异常',
            exceptionLevel: 2,
            status: '已处理'
          }
        ]
      }
    }
  }
}
