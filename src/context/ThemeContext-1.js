import React, { createContext, useEffect, useReducer } from "react";

export const ThemeContext = createContext();

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  sideBarStyle: { value: "full", label: "Full" },
  sidebarposition: { value: "fixed", label: "Fixed" },
  sidebarLayout: { value: "vertical", label: "Vertical" },
  background: { value: "light", label: "Light" },
  menuToggle: false,
  windowWidth: 0,
  windowHeight: 0,
};

const ThemeContextProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    sideBarStyle,
    sidebarposition,
    sidebarLayout,
    direction,
    haderColor,
    background,
    containerPositionSize,
    iconHover,
    menuToggle,
    windowWidth,
    windowHeight,
  } = state;

  const body = document.querySelector("body");

  const backgroundOption = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  const sidebarpositions = [
    { value: "fixed", label: "Fixed" },
    { value: "static", label: "Static" },
  ];

  // const changeSideBarPostion = (name) => {
  //     dispatch({sidebarposition: name});
  //     body.setAttribute("data-sidebar-position", name.value);
  // };

  // const changeSideBarLayout = (name) => {
  //   if (name.value === "horizontal") {
  //     if (sideBarStyle.value === "overlay") {

  //       dispatch({sidebarLayout: name});
  //       body.setAttribute("data-layout", name.value);

  //       dispatch({sideBarStyle: {value : "full", label : "Full"} })
  //       body.setAttribute("data-sidebar-style", "full");
  //     } else {

  //       dispatch({sidebarLayout: name});
  //       body.setAttribute("data-layout", name.value);
  //     }
  //   } else {

  //     dispatch({sidebarLayout: name});
  //     body.setAttribute("data-layout", name.value);
  //   }
  // };
  // const changeSideBarStyle = (name) => {
  //   if (sidebarLayout.value === "horizontal") {
  //     if (name.value === "overlay") {
  //       alert("Sorry! Overlay is not possible in Horizontal layout.");
  //     } else {
  //       dispatch({sideBarStyle: name })
  //       dispatch({iconHover : name.value === "icon-hover" ? "_i-hover" : ""});
  //       body.setAttribute("data-sidebar-style", name.value);
  //     }
  //   } else {
  //     dispatch({sideBarStyle: name })
  //     dispatch({iconHover : name.value === "icon-hover" ? "_i-hover" : ""});
  //     body.setAttribute("data-sidebar-style", name.value);
  //   }
  // };

  const openMenuToggle = () => {
    sideBarStyle.value === "overly"
      ? dispatch({ menuToggle: true })
      : dispatch({ menuToggle: false });
  };

  const changeBackground = (name) => {
    body.setAttribute("data-theme-version", name.value);
    dispatch({ background: name });
  };
  useEffect(() => {
    const body = document.querySelector("body");
    body.setAttribute("data-typography", "poppins");
    body.setAttribute("data-theme-version", "light");
    body.setAttribute("data-layout", "vertical");
    body.setAttribute("data-primary", "color_1");
    body.setAttribute("data-nav-headerbg", "color_1");
    body.setAttribute("data-headerbg", "color_1");
    body.setAttribute("data-sidebar-style", "full");
    body.setAttribute("data-sidebarbg", "color_1");
    body.setAttribute("data-primary", "color_1");
    body.setAttribute("data-sidebar-position", "fixed");
    body.setAttribute("data-header-position", "fixed");
    body.setAttribute("data-container", "wide");
    body.setAttribute("direction", "ltr");
    let resizeWindow = () => {
      dispatch({ windowWidth: window.innerWidth });
      dispatch({ windowHeight: window.innerHeight });
      window.innerWidth >= 768 && window.innerWidth < 1024
        ? body.setAttribute("data-sidebar-style", "mini")
        : window.innerWidth <= 768
        ? body.setAttribute("data-sidebar-style", "overlay")
        : body.setAttribute("data-sidebar-style", "full");
    };
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        body,
        backgroundOption,
        sidebarposition,
        windowWidth,
        windowHeight,
        sidebarLayout,
        direction,
        haderColor,
        iconHover,
        menuToggle,
        openMenuToggle,
        changeBackground,
        background,
        containerPositionSize,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
