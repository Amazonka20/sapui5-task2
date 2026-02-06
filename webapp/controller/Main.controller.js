sap.ui.define(["project2/controller/BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("project2.controller.Main", {
    onInit() {
      const oRouter = this.getRouter();
      oRouter
        .getRoute("RouteMain")
        .attachPatternMatched(this._onRouteMatched, this);
      oRouter
        .getRoute("RouteTab")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    onTabSelect(oEvent) {
      const sKey = oEvent.getParameter("key");
      this.getRouter().navTo("RouteTab", { tabKey: sKey });
    },

    _onRouteMatched(oEvent) {
      const oArgs = oEvent.getParameter("arguments") || {};
      const sTabKey = oArgs.tabKey || "json";
      const oIconTabBar = this.byId("iconTabBar");
      if (oIconTabBar) {
        oIconTabBar.setSelectedKey(sTabKey);
      }
    },
  });
});
