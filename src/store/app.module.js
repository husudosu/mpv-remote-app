const initialState = {
  screenOrientation: screen.orientation.type,
  toast: {
    message: "",
    duration: 2000,
    isOpen: false,
  },
};

export const app = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setScreenOrinetation(state, value) {
      state.screenOrientation = value;
    },
    setToastMessage(state, value) {
      state.toast.message = value;
    },
    setToastDuration(state, value) {
      state.toast.duration = value;
    },
    setToastState(state, value) {
      state.toast.isOpen = value;
    },
  },
  actions: {
    showToast: async ({ commit }, payload) => {
      commit("setToastMessage", payload.message);
      commit("setToastDuration", payload.duration || 2000);
      commit("setToastState", true);
    },
  },
};
