sap.ui.define(["project2/controller/BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("project2.controller.Product", {
    onInit() {
      this.getRouter()
        .getRoute("ProductPage")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched(oEvent) {
      const iId = oEvent.getParameter("arguments").ProductID;

      this.getView().bindObject({
        path: `/Products(${iId})`,
        model: "oDataV2",
        parameters: { expand: "Supplier" },
      });
    },
  });
});
