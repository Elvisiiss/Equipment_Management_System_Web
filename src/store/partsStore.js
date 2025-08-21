import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { partsAPI } from '@/api/parts/partsAPIdb';

export const usePartsStore = defineStore('parts', () => {
    // 状态
    const warehouses = ref([]);
    const shelves = ref([]);
    const parts = ref([]);
    const partTypes = ref([]);
    const borrowRecords = ref([]);
    const currentWarehouse = ref(null);
    const currentShelf = ref(null);

    // Getter
    const lowStockParts = computed(() => {
        return parts.value.filter(part => part.availableQuantity <= part.minStock);
    });

    const currentWarehouseShelves = computed(() => {
        if (!currentWarehouse.value) return [];
        return shelves.value.filter(shelf => shelf.warehouseId === currentWarehouse.value.id);
    });

    const currentShelfParts = computed(() => {
        if (!currentShelf.value) return [];
        return parts.value.filter(part => part.shelfId === currentShelf.value.id);
    });

    // Actions
    const loadWarehouses = async () => {
        warehouses.value = await partsAPI.getWarehouses();
    };

    const addWarehouse = async (warehouseData) => {
        const newWarehouse = await partsAPI.addWarehouse(warehouseData);
        warehouses.value.push(newWarehouse);
        return newWarehouse;
    };

    const loadShelves = async (warehouseId = null) => {
        shelves.value = await partsAPI.getShelves(warehouseId);
    };

    const addShelf = async (shelfData) => {
        const newShelf = await partsAPI.addShelf(shelfData);
        shelves.value.push(newShelf);
        return newShelf;
    };

    const loadPartTypes = async () => {
        partTypes.value = await partsAPI.getPartTypes();
    };

    const loadParts = async (filters = {}) => {
        parts.value = await partsAPI.getParts(filters);
    };

    const addPart = async (partData) => {
        const newPart = await partsAPI.addPart(partData);
        parts.value.push(newPart);
        return newPart;
    };

    const updatePart = async (id, updates) => {
        const updatedPart = await partsAPI.updatePart(id, updates);
        const index = parts.value.findIndex(p => p.id === id);
        if (index !== -1) {
            parts.value[index] = updatedPart;
        }
        return updatedPart;
    };

    const loadBorrowRecords = async (filters = {}) => {
        borrowRecords.value = await partsAPI.getBorrowRecords(filters);
    };

    const addBorrowRecord = async (recordData) => {
        const newRecord = await partsAPI.addBorrowRecord(recordData);
        borrowRecords.value.push(newRecord);

        // 更新本地parts数据中的可用数量
        const partIndex = parts.value.findIndex(p => p.id === recordData.partId);
        if (partIndex !== -1) {
            if (parts.value[partIndex].hasUniqueCode) {
                parts.value[partIndex].availableQuantity -= 1;
            } else {
                parts.value[partIndex].availableQuantity -= recordData.quantity;
            }
        }

        return newRecord;
    };

    const returnBorrowRecord = async (id, returnData) => {
        const updatedRecord = await partsAPI.returnBorrowRecord(id, returnData);
        const index = borrowRecords.value.findIndex(r => r.id === id);
        if (index !== -1) {
            borrowRecords.value[index] = updatedRecord;
        }

        // 如果是完好的备件，更新本地parts数据中的可用数量
        if (!returnData.isDamaged) {
            const partIndex = parts.value.findIndex(p => p.id === updatedRecord.partId);
            if (partIndex !== -1) {
                if (updatedRecord.uniqueCode) {
                    parts.value[partIndex].availableQuantity += 1;
                } else {
                    parts.value[partIndex].availableQuantity += updatedRecord.quantity;
                }
            }
        }

        return updatedRecord;
    };

    return {
        // 状态
        warehouses,
        shelves,
        parts,
        partTypes,
        borrowRecords,
        currentWarehouse,
        currentShelf,

        // Getter
        lowStockParts,
        currentWarehouseShelves,
        currentShelfParts,

        // Actions
        loadWarehouses,
        addWarehouse,
        loadShelves,
        addShelf,
        loadPartTypes,
        loadParts,
        addPart,
        updatePart,
        loadBorrowRecords,
        addBorrowRecord,
        returnBorrowRecord
    };
});
