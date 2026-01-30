sap.ui.define([], () => {
  "use strict";

  return {
    publishedYear(oDate) {
      if (!oDate) {
        return "";
      }
      const resourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      const dateObject = oDate instanceof Date ? oDate : new Date(oDate);

      return `${resourceBundle.getText(
        "publishedPrefix"
      )} ${dateObject.getFullYear()}`;
    },
  };
});
