import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const useEditorStore = create((set) => ({
    objects: [],
    selectedId: null,
    transformMode: 'translate', // translate, rotate, scale

    addObject: (type, url, name) => set((state) => ({
        objects: [
            ...state.objects,
            {
                id: uuidv4(),
                type, // 'model', 'image', 'video'
                url,
                name: name || `Object ${state.objects.length + 1}`,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            }
        ],
    })),

    updateObject: (id, newData) => set((state) => ({
        objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...newData } : obj
        ),
    })),

    selectObject: (id) => set({ selectedId: id }),

    setTransformMode: (mode) => set({ transformMode: mode }),

    deleteObject: (id) => set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
    })),
}));

export default useEditorStore;
