const initialState = {
  screenOrientation: screen.orientation.type,
};

export const app = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setScreenOrinetation(state, value) {
      state.screenOrientation = value;
    },
  },
};
